# ShopScale: Scalable Cloud-Based E-Commerce

A professional-grade, cloud-scalable e-commerce platform demonstrating modern architectural patterns, stateless backend design, and high-performance load balancing, completely modernized with a premium "Kinetic Editorial" UI/UX.

## 🏗 Architecture

ShopScale is built with a decoupled 4-tier architecture designed for horizontal scalability:

1. **Frontend**: React + Vite (Custom "Kinetic Editorial" Design System, no generic UI libraries)
2. **Load Balancer**: Nginx (Round-robin routing across the backend cluster)
3. **Backend Cluster**: 2x Node.js / Express instances (Strictly stateless API)
4. **Database**: Serverless PostgreSQL (Neon)

### Stateless Design for Scalability
The core challenge in scaling e-commerce is handling state (sessions, cart data) across multiple servers. ShopScale achieves absolute statelessness in the backend:
- **Authentication**: JWT-based (stored client-side, verified statelessly).
- **Cart State**: Persisted immediately to PostgreSQL (`carts` and `cart_items` tables), allowing any backend node in the cluster to service any cart request.
- **Race Condition Prevention**: The checkout flow uses strict row-level DB locking (`SELECT ... FOR UPDATE`) to prevent double-selling inventory during simultaneous high-traffic events.

## ✨ Frontend Design: "Kinetic Editorial"
The frontend has been completely overhauled to break away from generic SaaS templates. 
- **Micro-Interactions**: Custom CSS-driven hover effects and a global Toast notification system for instantaneous user feedback.
- **Glassmorphism**: A sleek, frosted-glass Cart Drawer that keeps the user engaged without jarring page reloads.
- **Perceived Performance**: Universal Skeleton loaders replace static loading text, providing a highly premium experience.
- **System Dashboard**: A custom frontend `/system-status` dashboard that visualizes the active load balancer instance and database health in real-time.
- **Performance Optimized**: Achieves near-instant Largest Contentful Paint (LCP) through eager image loading and strict layout stability (CLS).

## 🚀 Getting Started (Docker)

To run the full backend cluster (Nginx Load Balancer + 2 Node instances):

1. **Environment Setup**: Populate the database credentials in `backend/.env` (a `.env.example` is provided):
   ```env
   DATABASE_URL=your_postgres_db_url
   JWT_SECRET=your_super_secret_key
   PORT=3001
   ```
2. **Database Initialization**: Initialize the schema and seed mock data:
   ```bash
   cd backend
   npm install
   npm run migrate
   npm run seed
   ```
3. **Start the Cluster**:
   ```bash
   docker-compose up --build
   ```
   *The load balancer will now be available on `http://localhost:8080/api/`*

4. **Run the React Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Navigate to `http://localhost:5173` to view the application.*

## 🔐 Demo Accounts
- **Admin**: `admin@shopscale.com` / `admin123`
- *Alternatively, you can register a new account directly through the UI.*

## 🛡️ Production Readiness & Security
- **No Hardcoded Secrets**: All environment variables and sensitive configuration are strictly ignored in `.gitignore`.
- **XSS Protection**: The React frontend securely parses and sanitizes all user inputs as text nodes.
- **Sanitized Data**: Proper constraints (maxLength, input typing, DOM autocomplete guidelines) are implemented across all forms.
- **Optimized Build**: The frontend is Vite-optimized and production-ready (`npm run build`).

---
*Built as a cloud computing architectural demonstration.*
