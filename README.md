<div align="center">
  <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80" alt="ShopScale Hero" width="100%" style="border-radius: 8px; margin-bottom: 20px;" />
  
  <h1>ShopScale.</h1>
  <p><strong>A Cloud-Native Scalable E-Commerce Platform</strong></p>
  
  <p>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" /></a>
    <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
    <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" /></a>
    <a href="https://nginx.org/"><img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx" /></a>
  </p>
</div>

<br />

ShopScale is a professional-grade, horizontally scalable e-commerce platform demonstrating modern architectural patterns, stateless backend design, strict race condition handling, and high-performance load balancing. It is completely modernized with a premium "Kinetic Editorial" UI/UX.

## 🏗 Architecture

ShopScale is built with a decoupled 4-tier architecture designed for horizontal scalability and high availability:

```mermaid
graph TD
    Client[Client (React SPA)] -->|HTTP Requests| LB[Nginx Load Balancer]
    
    subgraph "Backend Cluster (Docker)"
    LB -->|Round Robin| API1[Node.js Instance 1]
    LB -->|Round Robin| API2[Node.js Instance 2]
    end
    
    API1 -->|Stateless Queries| DB[(Serverless PostgreSQL)]
    API2 -->|Stateless Queries| DB
    
    classDef node fill:#43853D,stroke:#fff,stroke-width:2px,color:#fff;
    classDef db fill:#316192,stroke:#fff,stroke-width:2px,color:#fff;
    classDef lb fill:#009639,stroke:#fff,stroke-width:2px,color:#fff;
    classDef client fill:#20232A,stroke:#61DAFB,stroke-width:2px,color:#61DAFB;
    
    class Client client;
    class API1,API2 node;
    class DB db;
    class LB lb;
```

### Stateless Design for Scalability
The core challenge in scaling e-commerce is handling state (sessions, cart data) across multiple servers. ShopScale achieves absolute statelessness in the backend:
- **Authentication**: JWT-based (stored client-side, verified statelessly).
- **Cart State**: Persisted immediately to PostgreSQL (`carts` and `cart_items` tables), allowing any backend node in the cluster to service any cart request.
- **Race Condition Prevention**: The checkout flow uses strict row-level DB locking (`SELECT ... FOR UPDATE`) to prevent double-selling inventory during simultaneous high-traffic events.

---

## ✨ Frontend Design: "Kinetic Editorial"
The frontend has been completely overhauled to break away from generic SaaS templates, offering a highly curated consumer experience.

- 🪄 **Micro-Interactions**: Custom CSS-driven hover effects and a global Toast notification system for instantaneous user feedback.
- 🪟 **Glassmorphism**: A sleek, frosted-glass Cart Drawer that keeps the user engaged without jarring page reloads.
- ⚡ **Perceived Performance**: Universal Skeleton loaders replace static loading text, providing a highly premium experience.
- 📊 **System Dashboard**: A custom frontend `/system-status` dashboard that visualizes the active load balancer instance and database health in real-time.
- 🚀 **Performance Optimized**: Achieves near-instant Largest Contentful Paint (LCP) through eager image loading and strict layout stability (CLS).

---

## 🚀 Getting Started

ShopScale runs its API cluster locally using Docker and Docker Compose.

### 1. Environment Setup
Populate the database credentials in `backend/.env`. (Use `.env.example` as a template)

```env
DATABASE_URL=your_postgres_db_url
JWT_SECRET=your_super_secret_key
PORT=3001
```

### 2. Database Initialization
Initialize the schema and seed mock data:
```bash
cd backend
npm install
npm run migrate
npm run seed
```

### 3. Start the Backend Cluster (Docker)
This spins up the Nginx Load Balancer and multiple Node.js instances.
```bash
docker-compose up --build
```
*The load balancer will now be available on `http://localhost:8080/api/`*

### 4. Run the React Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Navigate to `http://localhost:5173` to view the application.*

---

## 🔐 Demo Accounts
To explore user and administrative features without creating an account:
- **Admin**: `admin@shopscale.com` / `admin123`
- *Alternatively, you can register a new customer account directly through the UI.*

---

## 🛡️ Production Readiness & Security
- **No Hardcoded Secrets**: All environment variables and sensitive configuration are strictly ignored in `.gitignore`.
- **XSS Protection**: The React frontend securely parses and sanitizes all user inputs natively.
- **Sanitized Data**: Proper constraints (maxLength, input typing, DOM autocomplete guidelines) are implemented across all forms.
- **Optimized Build**: The frontend is Vite-optimized and production-ready. Run `npm run build` to generate the static distribution.

---

<div align="center">
  <sub>Built as a cloud computing architectural demonstration.</sub>
</div>
