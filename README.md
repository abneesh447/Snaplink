# 🚀 LinkTech Analytics - Enterprise URL Shortener

A high-performance, production-ready URL shortener built with a modern, decoupled architecture. LinkTech provides lightning-fast redirection, robust rate-limiting, and deep geographical and device-level analytics.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Website-brightgreen?style=for-the-badge)](https://snaplink-three-mocha.vercel.app) 

---

## ✨ Key Features

- **⚡ Blazing Fast Redirects**: In-memory caching via Redis ensures sub-millisecond redirection times.
- **🛡️ Enterprise Security**: Strict IP-based rate limiting prevents API abuse and DDoS attacks.
- **🌍 Geo-Analytics**: Deep dive into traffic origins with country-level tracking and dynamic map visualizations.
- **📱 Device Intelligence**: Automatically detects and categorizes traffic by Operating System (Windows, macOS, iOS, Android) and Browser (Chrome, Firefox, Safari).
- **🎨 Premium UI/UX**: A fully responsive, "Charcoal Black & Orangish-Red" dark-themed dashboard built with pure CSS and React.

---

## 🏗️ Architecture & Data Flow

When a user clicks a shortened link, the system executes a highly optimized sequence of events to ensure speed and accuracy.

![Architecture Sequence Diagram](https://mermaid.ink/img/c2VxdWVuY2VEaWFncmFtCiAgICBwYXJ0aWNpcGFudCBVc2VyCiAgICBwYXJ0aWNpcGFudCBWZXJjZWwKICAgIHBhcnRpY2lwYW50IFJlbmRlcgogICAgcGFydGljaXBhbnQgVXBzdGFzaAogICAgcGFydGljaXBhbnQgTW9uZ29EQgoKICAgIFVzZXItPj5SZW5kZXI6IEdFVCAvc2hvcnRDb2RlCiAgICAKICAgIHJlY3QgcmdiKDMwLCAzMCwgMzApCiAgICBOb3RlIG92ZXIgUmVuZGVyLFVwc3Rhc2g6IDEuIFJhdGUgTGltaXRpbmcgQ2hlY2sKICAgIFJlbmRlci0+PlVwc3Rhc2g6IENoZWNrIElQIHJlcXVlc3QgY291bnQKICAgIFVwc3Rhc2gtLT4+UmVuZGVyOiBBbGxvdyAvIERlbnkKICAgIGVuZAoKICAgIHJlY3QgcmdiKDQwLCA0MCwgNDApCiAgICBOb3RlIG92ZXIgUmVuZGVyLFVwc3Rhc2g6IDIuIENhY2hlIFJldHJpZXZhbAogICAgUmVuZGVyLT4+VXBzdGFzaDogRmV0Y2ggb3JpZ2luYWwgVVJMIGZyb20gY2FjaGUKICAgIGFsdCBVUkwgZm91bmQgaW4gQ2FjaGUgKENhY2hlIEhpdCkKICAgICAgICBVcHN0YXNoLS0+PlJlbmRlcjogUmV0dXJuIE9yaWdpbmFsIFVSTAogICAgZWxzZSBVUkwgbm90IGluIENhY2hlIChDYWNoZSBNaXNzKQogICAgICAgIFJlbmRlci0+Pk1vbmdvREI6IFF1ZXJ5IGRhdGFiYXNlIGZvciBVUkwKICAgICAgICBNb25nb0RCLS0+PlJlbmRlcjogUmV0dXJuIE9yaWdpbmFsIFVSTAogICAgICAgIFJlbmRlci0+PlVwc3Rhc2g6IFN0b3JlIFVSTCBpbiBjYWNoZSBmb3IgZnV0dXJlCiAgICBlbmQKICAgIGVuZAoKICAgIHJlY3QgcmdiKDUwLCA1MCwgNTApCiAgICBOb3RlIG92ZXIgUmVuZGVyLE1vbmdvREI6IDMuIEFuYWx5dGljcyBUcmFja2luZyAoQXN5bmMpCiAgICBSZW5kZXItLT4+VXNlcjogSFRUUCAzMDIgUmVkaXJlY3QgdG8gT3JpZ2luYWwgVVJMCiAgICBSZW5kZXItKU1vbmdvREI6IEFzeW5jaHJvbm91c2x5IGxvZyBDbGljawogICAgZW5k?theme=dark)

---

## 🛠️ Technology Stack & Deployment

We carefully selected this stack to balance development speed, extreme performance, and zero-cost cloud scalability.

### 🌐 Frontend (Deployed on **Vercel**)
- **React (Vite)**: Chosen for its instant server start and lightning-fast HMR compared to Create React App.
- **Vanilla CSS**: We opted for pure CSS (with CSS variables) to maintain absolute control over the dark theme, responsive grid logic, and micro-animations without utility-class bloat.
- **Lucide React & Recharts**: Lightweight libraries for premium iconography and beautiful SVG data visualizations.

### ⚙️ Backend (Deployed on **Render**)
- **Node.js & Express**: Provides a lightweight, event-driven architecture perfect for handling thousands of asynchronous redirect requests.
- **Prisma ORM**: Gives us complete type safety and a highly readable database schema, significantly reducing runtime errors.
- **UAParser.js & GeoIP-Lite**: For extracting rich metadata (OS, Browser, Location) from incoming request headers.

### 🗄️ Database (Deployed on **MongoDB Atlas**)
- **MongoDB**: A NoSQL database was chosen because link analytics (clicks, timestamps, raw metadata) are inherently document-based and rapidly scale in volume. It handles high-write throughput effortlessly.

### ⚡ Caching & Rate Limiting (Deployed on **Upstash**)
- **Redis**: Acts as an intermediary RAM-based storage layer. Instead of querying MongoDB for every single click (which is slow and expensive), Redis holds the active links in memory for instant retrieval. It is also the industry standard for executing token-bucket rate limiting.

---

## 📁 Project File Structure

Here is the directory layout of the LinkTech application:

```
url_shortener(Snaplink)/
├── .github/                 # GitHub CI/CD and workflows
├── client/                  # Frontend Vite + React application
│   ├── public/              # Static assets (favicons, manifest)
│   └── src/
│       ├── assets/          # Shared images, fonts, styles
│       ├── components/      # UI components (Dashboard, HelpCenter, etc.)
│       ├── App.css          # App wrapper styling
│       ├── App.jsx          # Main client entry component
│       ├── index.css        # Global CSS stylesheet & design variables
│       └── main.jsx         # Vite bootstrapping script
├── server/                  # Backend Node.js Express server
│   ├── prisma/
│   │   └── schema.prisma    # Prisma Client ORM Schema
│   └── src/
│       ├── lib/             # Helper libraries (redis, prisma clients)
│       ├── middleware/      # Middleware definitions (rate limiter)
│       ├── routes/          # Express API route files
│       └── server.js        # Main Express application entrypoint
├── docker-compose.yml       # Docker configuration for local services
└── README.md                # Documentation
```

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18+)
- Docker Desktop (with WSL2 enabled on Windows)
- MongoDB URI (Local or Atlas)

### 1. Start Local Redis
Run a local Redis instance in the background using Docker:
```bash
docker run -d --name redis-stack -p 6379:6379 redis:latest
```

### 2. Configure Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=5000
DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/url_shortener?retryWrites=true&w=majority"
REDIS_URL="redis://127.0.0.1:6379"
```

Create a `.env` file in the `client` directory:
```env
VITE_API_URL="http://localhost:5000/api"
VITE_REDIRECT_URL="http://localhost:5000"
```

### 3. Install & Start Backend
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 4. Install & Start Frontend
Open a new terminal:
```bash
cd client
npm install
npm run dev
```

---

## 📡 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/links` | `POST` | Create a new shortened link. Requires `originalUrl`. |
| `/api/links` | `GET` | Fetch all links and their aggregated analytics for the dashboard. |
| `/api/links/:id` | `DELETE` | Delete a specific link and cascade delete all its click data. |
| `/:shortCode` | `GET` | Resolves the short code, logs the analytics data asynchronously, and redirects the user. |

---

*Architected for speed. Built for scale.*
