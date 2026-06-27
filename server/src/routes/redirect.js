import { Router } from 'express';
import UAParser from 'ua-parser-js';
import { prisma } from '../lib/prisma.js';
import { cache } from '../lib/redis.js';

const router = Router();

// Non-blocking background IP geolocator using native fetch in Node.js
async function getCountryFromIp(ip) {
  let cleanIp = ip.replace('::ffff:', '');
  
  // Resolve loopback/localhost IPs to actual external IP for accurate testing
  if (!cleanIp || cleanIp === '127.0.0.1' || cleanIp === '::1') {
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      if (ipData.ip) {
        cleanIp = ipData.ip;
      } else {
        return 'Unknown';
      }
    } catch {
      return 'Unknown';
    }
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${cleanIp}?fields=country`);
    const data = await res.json();
    return data.country || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

// Background task to log click analytics without blocking redirect
async function logClickAnalytics(
  linkId,
  ip,
  userAgent
) {
  try {
    // Parse user agent
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || 'Unknown';
    const os = parser.getOS().name || 'Unknown';

    // Get country
    const country = await getCountryFromIp(ip);

    // Save click event
    await prisma.click.create({
      data: {
        linkId,
        ip,
        country,
        browser,
        os,
      },
    });
  } catch (err) {
    console.error('Error logging click analytics:', err);
  }
}

// Redirect handler
router.get('/:code', async (req, res) => {
  const { code } = req.params;
  const userAgent = req.headers['user-agent'] || '';
  // Resolve client IP (supporting reverse proxies)
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  try {
    // 1. Check Redis Cache first
    const cachedUrl = await cache.get(`link:${code}`);
    
    if (cachedUrl) {
      // Find the link ID to log analytics. We can query the database asynchronously
      // or store the link ID in the cache too. Let's query it in the background.
      prisma.link
        .findUnique({
          where: { shortCode: code },
          select: { id: true, expiration: true },
        })
        .then((link) => {
          if (link) {
            // Check expiration just in case cache is out-of-sync
            if (link.expiration && new Date(link.expiration) <= new Date()) {
              // Delete cache and let the main thread render expired page (though this request already redirected, next will check DB)
              cache.del(`link:${code}`);
              return;
            }
            logClickAnalytics(link.id, ip, userAgent);
          }
        });

      return res.redirect(302, cachedUrl);
    }

    // 2. Cache Miss: Query Database
    const link = await prisma.link.findUnique({
      where: { shortCode: code },
    });

    if (!link) {
      return res.status(404).send(getNotFoundHtml(code));
    }

    // 3. Expiration Check
    if (link.expiration && new Date(link.expiration) <= new Date()) {
      return res.status(410).send(getExpiredHtml(link.shortCode));
    }

    // 4. Cache the link details
    const ttl = link.expiration
      ? Math.floor((new Date(link.expiration).getTime() - Date.now()) / 1000)
      : 86400; // Default 1 day caching

    if (ttl > 0) {
      await cache.set(`link:${code}`, link.originalUrl, ttl);
    }

    // 5. Asynchronously log analytics
    logClickAnalytics(link.id, ip, userAgent);

    // 6. Perform redirection
    return res.redirect(302, link.originalUrl);
  } catch (err) {
    console.error('Redirection error:', err);
    return res.status(500).send('Internal Server Error');
  }
});

// HTML Template for expired link
function getExpiredHtml(code) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Link Expired</title>
      <style>
        body {
          background-color: #080710;
          color: #ffffff;
          font-family: 'Outfit', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          text-align: center;
        }
        .container {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          padding: 40px;
          border-radius: 20px;
          border: 1px rgba(255,255,255,0.1) solid;
          box-shadow: 0 0 40px rgba(8,7,16,0.6);
          max-width: 450px;
        }
        h1 {
          color: #ff5e62;
          font-size: 2.5rem;
          margin-bottom: 10px;
        }
        p {
          font-size: 1.1rem;
          color: #dfdfdf;
          line-height: 1.6;
        }
        .code {
          background: rgba(255,255,255,0.1);
          padding: 5px 10px;
          border-radius: 5px;
          font-family: monospace;
          color: #ff9966;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Link Expired ⏳</h1>
        <p>The shortened link <span class="code">/${code}</span> has expired and is no longer available.</p>
      </div>
    </body>
    </html>
  `;
}

// HTML Template for link not found
function getNotFoundHtml(code) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Link Not Found</title>
      <style>
        body {
          background-color: #080710;
          color: #ffffff;
          font-family: 'Outfit', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          text-align: center;
        }
        .container {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          padding: 40px;
          border-radius: 20px;
          border: 1px rgba(255,255,255,0.1) solid;
          box-shadow: 0 0 40px rgba(8,7,16,0.6);
          max-width: 450px;
        }
        h1 {
          color: #9b51e0;
          font-size: 2.5rem;
          margin-bottom: 10px;
        }
        p {
          font-size: 1.1rem;
          color: #dfdfdf;
          line-height: 1.6;
        }
        .code {
          background: rgba(255,255,255,0.1);
          padding: 5px 10px;
          border-radius: 5px;
          font-family: monospace;
          color: #38ef7d;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Link Not Found 🔍</h1>
        <p>The shortened link <span class="code">/${code}</span> does not exist or may have been deleted.</p>
      </div>
    </body>
    </html>
  `;
}

export default router;
