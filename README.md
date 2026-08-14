# ShopScale: Scalable Cloud-Based E-Commerce

A professional-grade, cloud-scalable e-commerce platform demonstrating modern architectural patterns, stateless backend design, and high-performance load balancing.

## 🏗 Architecture

ShopScale is built with a decoupled 4-tier architecture designed for horizontal scalability:

1. **Frontend**: React + Vite (Custom Design System, No generic UI libraries)
2. **Load Balancer**: Nginx (Round-robin routing across backend cluster)
3. **Backend Cluster**: 2x Node.js / Express instances (Stateless API)
4. **Database**: Neon Serverless PostgreSQL

### Stateless Design for Scalability
The core challenge in scaling e-commerce is handling state (sessions, cart data) across multiple servers. ShopScale achieves absolute statelessness in the backend:
- **Authentication**: JWT-based (stored client-side, verified statelessly).
- **Cart State**: Persisted immediately to PostgreSQL (`carts` and `cart_items` tables), allowing any backend node to service any cart request.
- **Race Condition Prevention**: The checkout flow uses strict row-level DB locking (`SELECT ... FOR UPDATE`) to prevent double-selling inventory during simultaneous high-traffic events.

## 🚀 Getting Started (Docker)

To run the full backend cluster (Nginx Load Balancer + 2 Node instances):

1. Populate the database credentials in `backend/.env`:
   ```env
   DATABASE_URL=your_neon_db_url
   JWT_SECRET=your_super_secret_key
   PORT=3001
   ```
2. Initialize the database schema and seed mock data:
   ```bash
   cd backend
   npm install
   npm run migrate
   npm run seed
   ```
3. Start the backend cluster:
   ```bash
   docker-compose up --build
   ```
   *The load balancer will now be available on `http://localhost:8080/api/`*

4. Run the React Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🔐 Demo Accounts
- **Admin**: `admin@shopscale.com` / `admin123`

## 🎨 Design Philosophy
The frontend uses a custom, lightweight CSS architecture heavily inspired by premium editorial brands. It utilizes the `Playfair Display` font for headers and `Inter` for body copy, avoiding standard SaaS aesthetic tropes (like glassmorphism or dark mode) in favor of a clean, high-contrast, commercial experience.
