import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { prisma } from '../lib/prisma.js';
import { cache } from '../lib/redis.js';
import { rateLimiter } from '../middleware/rate-limiter.js';

const router = Router();

// Base-62 random generator for short code
function generateShortCode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a new shortened link
router.post(
  '/',
  requireAuth(),
  rateLimiter({
    windowSeconds: 60,
    maxRequests: 20,
    message: 'Too many link creation requests. Please try again in a minute.',
  }),
  async (req, res) => {
    const { originalUrl, customAlias, expiration, title } = req.body;
    const userId = typeof req.auth === 'function' ? req.auth()?.userId : req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required.' });
    }

    // URL validation
    try {
      new URL(originalUrl);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid original URL format.' });
    }

    let shortCode = customAlias ? customAlias.trim() : '';

    if (shortCode) {
      // Validate custom alias characters
      const aliasRegex = /^[a-zA-Z0-9-_]+$/;
      if (!aliasRegex.test(shortCode)) {
        return res.status(400).json({
          error: 'Custom alias can only contain alphanumeric characters, hyphens, and underscores.',
        });
      }

      // Check if custom alias is already in use
      const existingLink = await prisma.link.findUnique({
        where: { shortCode },
      });

      if (existingLink) {
        return res.status(400).json({ error: 'Custom alias is already in use.' });
      }
    } else {
      // Generate a unique short code
      let isUnique = false;
      let retries = 0;
      while (!isUnique && retries < 5) {
        shortCode = generateShortCode();
        const existingLink = await prisma.link.findUnique({
          where: { shortCode },
        });
        if (!existingLink) {
          isUnique = true;
        }
        retries++;
      }

      if (!isUnique) {
        return res.status(500).json({ error: 'Failed to generate a unique short code.' });
      }
    }

    let expirationDate = null;
    if (expiration) {
      expirationDate = new Date(expiration);
      if (isNaN(expirationDate.getTime())) {
        return res.status(400).json({ error: 'Invalid expiration date format.' });
      }
      if (expirationDate <= new Date()) {
        return res.status(400).json({ error: 'Expiration date must be in the future.' });
      }
    }

    try {
      const link = await prisma.link.create({
        data: {
          originalUrl,
          shortCode,
          title: title || null,
          expiration: expirationDate,
          userId,
        },
        include: {
          clicks: true,
        },
      });

      // Cache the shortCode mapping to Redis immediately to speed up the first lookup
      // Cache with expiration if defined, otherwise cache for a reasonable default (e.g. 24 hours)
      const ttl = expirationDate
        ? Math.floor((expirationDate.getTime() - Date.now()) / 1000)
        : 86400; // 1 day

      if (ttl > 0) {
        await cache.set(`link:${shortCode}`, originalUrl, ttl);
      }

      return res.status(201).json(link);
    } catch (err) {
      console.error('Error creating link:', err);
      return res.status(500).json({ error: 'Failed to create shortened link.' });
    }
  }
);

// Fetch all links created by the logged in user
router.get('/', requireAuth(), async (req, res) => {
  const userId = typeof req.auth === 'function' ? req.auth()?.userId : req.auth?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const links = await prisma.link.findMany({
      where: { userId },
      include: {
        clicks: {
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(links);
  } catch (err) {
    console.error('Error fetching links:', err);
    return res.status(500).json({ error: 'Failed to fetch links.' });
  }
});

// Delete a link
router.delete('/:id', requireAuth(), async (req, res) => {
  const userId = typeof req.auth === 'function' ? req.auth()?.userId : req.auth?.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const link = await prisma.link.findFirst({
      where: { id, userId },
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found or unauthorized.' });
    }

    await prisma.link.delete({
      where: { id },
    });

    // Remove from cache
    await cache.del(`link:${link.shortCode}`);

    return res.json({ success: true, message: 'Link deleted successfully.' });
  } catch (err) {
    console.error('Error deleting link:', err);
    return res.status(500).json({ error: 'Failed to delete link.' });
  }
});

export default router;
