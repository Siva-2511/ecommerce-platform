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

  <h3>
    🔴 <a href="https://ecommerce-platform-rdpnp05f1-sis-projects-a5d26c6e.vercel.app/">View Live Demo</a>
  </h3>
</div>

<br />

## 🎯 Project Overview

**ShopScale** is a professional-grade, horizontally scalable e-commerce platform demonstrating modern architectural patterns, stateless backend design, strict race condition handling, and high-performance load balancing. It is completely modernized with a premium "Kinetic Editorial" UI/UX.

---

## 🏗️ Architecture & Technologies

ShopScale is built with a decoupled 4-tier architecture designed for horizontal scalability and high availability.

```mermaid
graph TD
    Client["Client (React SPA on Vercel)"] -->|"REST API Requests"| LB["Load Balancer / Cloud Gateway"]
    
    subgraph "Stateless Backend Cluster"
    LB -->|"Routing"| API1["Node.js / Express Instance 1"]
    LB -->|"Routing"| API2["Node.js / Express Instance 2"]
    end
    
    API1 -->|"SQL Queries"| DB[("Serverless PostgreSQL - Neon/Supabase")]
    API2 -->|"SQL Queries"| DB
    
    classDef node fill:#43853D,stroke:#fff,stroke-width:2px,color:#fff;
    classDef db fill:#316192,stroke:#fff,stroke-width:2px,color:#fff;
    classDef lb fill:#009639,stroke:#fff,stroke-width:2px,color:#fff;
    classDef client fill:#000,stroke:#fff,stroke-width:2px,color:#fff;
    
    class Client client;
    class API1,API2 node;
    class DB db;
    class LB lb;
```

### Key Engineering Features
1. **Absolute Statelessness**: 
   Handling state (sessions, cart data) across multiple servers is a core challenge. ShopScale achieves this by using stateless JWT authentication and persisting Cart State immediately to PostgreSQL, allowing any backend node in the cluster to service any request.
2. **Race Condition Prevention**: 
   The checkout flow uses strict row-level DB locking (`SELECT ... FOR UPDATE`) to prevent double-selling inventory during simultaneous high-traffic events.

---

## 🎨 Frontend Design: "Kinetic Editorial"

The frontend has been completely overhauled to break away from generic SaaS templates, offering a highly curated consumer experience.

- 🪄 **Micro-Interactions**: Custom CSS-driven hover effects and a global Toast notification system for instantaneous user feedback.
- 🪟 **Glassmorphism**: A sleek, frosted-glass Cart Drawer that keeps the user engaged without jarring page reloads.
- ⚡ **Perceived Performance**: Universal Skeleton loaders replace static loading text, providing a highly premium experience.
- 📊 **System Dashboard**: A custom frontend `/system-status` dashboard that visualizes backend health and API connectivity in real-time.

---

## 🚀 Local Development (Docker)

To run the full architecture locally (Nginx LB + Node instances + React):

1. **Environment Setup**: Populate the database credentials in `backend/.env`. (Use `.env.example` as a template).
   ```env
   DATABASE_URL=your_postgres_db_url
   JWT_SECRET=your_super_secret_key
   PORT=3001
   ```

2. **Database Initialization**: 
   ```bash
   cd backend
   npm install
   npm run migrate
   npm run seed
   ```

3. **Start the Backend Cluster (Docker)**: 
   ```bash
   docker-compose up --build
   ```
   *(The Nginx load balancer is now running on `http://localhost:8080/api/`)*

4. **Run the React Frontend**: 
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *(Navigate to `http://localhost:5173`)*

---

## ☁️ Cloud Deployment

The live demo utilizes a modern, decoupled cloud deployment strategy:
- **Frontend**: Hosted globally on **Vercel** (`https://ecommerce-platform-...vercel.app`).
- **Backend API**: Hosted as a scalable Web Service on **Render**.
- **Database**: Serverless PostgreSQL hosted on **Supabase** / **Neon**.

---

## 🔐 Demo Accounts
To explore user and administrative features without creating an account:
- **Admin**: `admin@shopscale.com` / `admin123`
- *Alternatively, you can register a new customer account directly through the UI.*

<div align="center">
  <br/>
  <sub>Built as a cloud computing architectural demonstration.</sub>
</div>
