# Scalable Cloud-Based E-Commerce Platform
## Product Requirements Document (PRD) & Design Specification

**Document Version:** 3.0  
**Project:** Project 2 — Scalable E-Commerce Platform (ShopScale)  
**Date:** August 2026  
**Status:** Implementation-Ready & Fully Complete (100%)

---

## Recommended $0 Stack (Quick Reference)

| Layer | Technology | Type | Cost |
|---|---|---|---|
| Frontend | React + Vite | Open-source | Free forever |
| Frontend Hosting | Vercel | Free tier | Free forever |
| Backend | Node.js + Express | Open-source | Free forever |
| Backend Hosting | Render (2 instances) | Free tier | Free (with limits) |
| Load Balancer | Nginx (Docker, local demo) / Render routing | Open-source / Free tier | Free forever |
| Database | PostgreSQL via Neon | Free tier | Free forever |
| Authentication | Custom JWT | Open-source | Free forever |
| File Storage | Cloudinary | Free tier | Free forever |
| Monitoring | UptimeRobot + Render logs | Free tier | Free forever |
| Load Testing | k6 | Open-source | Free forever |
| Containerization | Docker + Docker Compose | Open-source | Free forever |
| Repository | GitHub | Free tier | Free forever |

**Estimated Monthly Cost: $0** (for normal student/demo usage within free tier limits)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals](#3-goals)
4. [Non-Goals](#4-non-goals)
5. [User Roles](#5-user-roles)
6. [Authentication System](#6-authentication-system)
7. [Role-Based Access Control](#7-role-based-access-control)
8. [Product Catalog](#8-product-catalog)
9. [Shopping Cart](#9-shopping-cart)
10. [Checkout and Payment Simulation](#10-checkout-and-payment-simulation)
11. [Order Management](#11-order-management)
12. [Scalability Architecture](#12-scalability-architecture)
13. [Load Balancing Design](#13-load-balancing-design)
14. [Database Design](#14-database-design)
15. [API Design](#15-api-design)
16. [Recommended Technology Stack](#16-recommended-technology-stack)
17. [Free-Tier Comparison](#17-free-tier-comparison)
18. [$0 Deployment Architecture](#18-0-deployment-architecture)
19. [High Availability Requirements](#19-high-availability-requirements)
20. [Auto-Scaling Requirements](#20-auto-scaling-requirements)
21. [Performance Requirements](#21-performance-requirements)
22. [Load Testing Strategy](#22-load-testing-strategy)
23. [Demonstrating Load Balancing](#23-demonstrating-load-balancing)
24. [Security Requirements](#24-security-requirements)
25. [Non-Functional Requirements](#25-non-functional-requirements)
26. [UX/UI Specification & Design System](#26-uxui-specification--design-system)
27. [User Flows](#27-user-flows)
28. [System Architecture](#28-system-architecture)
29. [Project Folder Structure](#29-project-folder-structure)
30. [Development Phases](#30-development-phases)
31. [MVP Scope](#31-mvp-scope)
32. [Testing Strategy](#32-testing-strategy)
33. [Acceptance Criteria](#33-acceptance-criteria)
34. [Error Handling](#34-error-handling)
35. [Risks and Mitigations](#35-risks-and-mitigations)
36. [Backup and Recovery](#36-backup-and-recovery)
37. [Deployment Guide](#37-deployment-guide)
38. [Environment Variables](#38-environment-variables)
39. [Academic Documentation](#39-academic-documentation)
40. [Future Enhancements](#40-future-enhancements)
41. [Final Recommended Architecture](#41-final-recommended-architecture)
42. [Final Build Checklist](#42-final-build-checklist)

---

## 1. Executive Summary

### Product Name
**ShopScale** — Scalable Cloud-Based E-Commerce Platform

### Product Vision
A cloud-native e-commerce web application designed to demonstrate, through hands-on implementation, how modern distributed systems achieve high availability, horizontal scaling, load balancing, and fault tolerance using free and open-source technologies.

### Product Purpose
To build a fully functional e-commerce platform serving as a living proof-of-concept for scalable cloud architecture. The system enables customers to browse products, manage a shopping cart, and simulate checkout/payment, while providing administrators with product and order management capabilities. The infrastructure runs multiple backend instances behind a load balancer to visually and measurably prove request distribution and failure recovery.

### Problem Being Solved
Traditional single-server web applications fail under high traffic, have no fault tolerance, and do not scale automatically. This project demonstrates a practical, cost-effective architectural solution using open-source tools that mirror real-world cloud patterns.

### Target Users
- **Primary:** Academic evaluators and viva examiners reviewing cloud computing concepts
- **Secondary:** Simulated customers browsing and purchasing products
- **Tertiary:** Simulated administrators managing the product catalog and orders

### Main Value Proposition
A working, visually demonstrable, $0-cost cloud architecture that proves:
- Requests are distributed across multiple backend instances (via `/api/instance` endpoint)
- The system survives the failure of one backend instance
- Traffic increases are handled by adding instances
- All shared state lives in a centralized database

---

## 2. Problem Statement

### The Single-Server Problem
A traditional e-commerce application runs on a single server handling every request. This introduces critical failure modes:
- **Traffic Spikes:** CPU and memory exhaust quickly, server becomes unresponsive.
- **Single Point of Failure:** Hardware fault or software crash brings the entire platform offline.
- **Server Overload:** Fixed compute capacity causes latency and dropped requests under load.
- **Poor Availability:** Routine maintenance forces service downtime.

### Solutions Demonstrated
- **Load Balancing:** Nginx distributes incoming HTTP requests across backend instances.
- **Horizontal Scaling:** Adding more backend instances increases overall compute capacity.
- **Stateless Backend:** Storing user session (JWT) and cart state in PostgreSQL ensures any instance can process any request.
- **Visual Proof:** `/api/instance` endpoint returns the specific instance ID serving each request.

---

## 3. Goals

### Primary Goals
1. Build a functional e-commerce application (browse, cart, simulated checkout).
2. Deploy a minimum of two backend instances running simultaneously.
3. Distribute traffic using a load balancer (Nginx locally / Render routing).
4. Demonstrate horizontal scaling and high availability during failure.
5. Perform structured load testing using k6.

### Academic Goals
1. Cloud Architecture & Multi-Tier Deployment
2. High Availability & Fault Tolerance
3. Load Balancing Algorithms (Round-Robin)
4. Horizontal Scaling vs Vertical Scaling
5. Stateless REST API & Shared Database Design
6. Docker Containerization & Infrastructure-as-Code Basics

---

## 4. Non-Goals

- Real payment gateway integration (Stripe/PayPal) — Payment is strictly simulated.
- Production financial compliance (PCI-DSS).
- Complex microservices or Kubernetes overhead — Docker Compose is sufficient.
- Multi-region global deployment — Single region free tier is used.
- Recommendation engines or advanced ML features.

---

## 5. User Roles

| Action | Guest | Customer | Admin |
|---|---|---|---|
| Browse & Search Products | ✅ | ✅ | ✅ |
| Register / Login | ✅ | ❌ | ❌ |
| Manage Shopping Cart | ❌ | ✅ | ✅ |
| Checkout & Simulate Payment | ❌ | ✅ | ✅ |
| View Own Orders | ❌ | ✅ | ✅ |
| Create / Edit / Delete Products | ❌ | ❌ | ✅ |
| View All Customer Orders | ❌ | ❌ | ✅ |
| View Platform Statistics | ❌ | ❌ | ✅ |

---

## 6. Authentication System

- **Strategy:** Custom JWT (JSON Web Token) with `jsonwebtoken` and `bcrypt`.
- **Why Custom JWT?** Completely free, stateless (verified by any backend instance without session replication), and high academic learning value.
- **Password Hashing:** `bcrypt` with salt rounds = 12.
- **Token Expiry:** 7-day expiration for academic simplicity.
- **Storage:** Frontend stores token in `localStorage` and transmits via `Authorization: Bearer <token>` header.

---

## 7. Role-Based Access Control

Authorization is strictly enforced server-side via Express middleware:
1. `authenticateToken`: Verifies JWT payload and attaches `req.user`.
2. `requireAdmin`: Checks `req.user.role === 'admin'`. Returns 403 Forbidden if not admin.

---

## 8. Product Catalog

### Product Schema Summary
- `product_id`: Serial (PK)
- `name`: Varchar(255)
- `description`: Text
- `category_id`: Integer (FK to categories)
- `price`: Decimal(10,2)
- `image_url`: Varchar(500) (Cloudinary)
- `stock_quantity`: Integer
- `is_active`: Boolean (Default: true for soft delete)

### Features
- Paginated listing, full-text search, category filtering, price sorting.
- Admin CRUD operations with image upload support.

---

## 9. Shopping Cart

- **Strategy:** Database-backed cart (`carts` and `cart_items` tables).
- **Scalability Rationale:** Storing cart state in server memory breaks horizontal scaling because round-robin load balancing sends requests to different servers. Database-backed cart ensures consistency across all backend instances.

---

## 10. Checkout and Payment Simulation

### Workflow
1. Customer clicks "Checkout" → Backend creates `orders` record (status: `PENDING`) and `order_items`.
2. Stock quantity is atomically deducted from `products`.
3. Customer clicks "Simulate Payment" → Backend generates payment outcome (90% success, 10% failure).
4. **On Success:** Order status set to `PAID`, cart items deleted.
5. **On Failure:** Order status set to `CANCELLED`, product stock restored.

---

## 11. Order Management

- **Statuses:** `PENDING`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`.
- **Customer View:** Access only their own order history (`GET /api/orders`).
- **Admin View:** Access all platform orders and update status (`GET /api/admin/orders`).

---

## 12. Scalability Architecture

```text
                    Users (HTTP Requests)
                           |
                           v
                    ┌─────────────┐
                    │    Nginx    │  ← Load Balancer (:80)
                    └──────┬──────┘
                    ┌──────┴──────┐
              ┌─────▼─────┐ ┌─────▼─────┐
              │ Backend 1 │ │ Backend 2 │  ← Stateless Instances
              └─────┬─────┘ └─────┬─────┘
                    └──────┬──────┘
                           v
                    ┌─────────────┐
                    │  PostgreSQL │  ← Shared Database (Neon)
                    └─────────────┘
```

- **Health Checks:** Every backend exposes `GET /health` returning DB connection status. Nginx removes instances failing 2 consecutive health checks.
- **Stateless Backend:** Zero session data stored in Node process memory.

---

## 13. Load Balancing Design

- **Tool:** Nginx in Docker (Local) / Render Native Routing (Cloud).
- **Algorithm:** Round-Robin (default, equal distribution).
- **Demonstration Endpoint:** `GET /api/instance` returns `{ "instance": "backend-1" }`.

```nginx
upstream backend_pool {
    server backend1:3001;
    server backend2:3002;
}

server {
    listen 80;
    location /api/ {
        proxy_pass http://backend_pool;
        proxy_next_upstream error timeout http_503;
    }
}
```

---

## 14. Database Design

### Tables
1. `users` (user_id, email, password_hash, first_name, last_name, role, created_at)
2. `categories` (category_id, name, slug)
3. `products` (product_id, name, description, category_id, price, image_url, stock_quantity, is_active)
4. `carts` (cart_id, user_id, created_at, updated_at)
5. `cart_items` (item_id, cart_id, product_id, quantity)
6. `orders` (order_id, user_id, status, total_amount, shipping_address, created_at)
7. `order_items` (item_id, order_id, product_id, product_name, product_price, quantity)
8. `payments` (payment_id, order_id, status, transaction_id, failure_reason)

### ER Diagram (Mermaid)

```mermaid
erDiagram
    users ||--o{ carts : "has"
    users ||--o{ orders : "places"
    carts ||--o{ cart_items : "contains"
    products ||--o{ cart_items : "referenced in"
    orders ||--o{ order_items : "contains"
    products ||--o{ order_items : "referenced in"
    orders ||--o| payments : "has"
    categories ||--o{ products : "classifies"
```

---

## 15. API Design

### Authentication
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login user, receive JWT
- `GET /api/auth/profile` — Get current user profile

### Products
- `GET /api/products` — List products (paginated, filtered)
- `GET /api/products/:id` — Get product details
- `POST /api/products` — Create product (Admin)
- `PUT /api/products/:id` — Update product (Admin)
- `DELETE /api/products/:id` — Soft-delete product (Admin)

### Cart & Checkout
- `GET /api/cart` — View cart
- `POST /api/cart/items` — Add item
- `PUT /api/cart/items/:productId` — Update item quantity
- `DELETE /api/cart/items/:productId` — Remove item
- `POST /api/checkout` — Create order from cart
- `POST /api/payments/simulate` — Process simulated payment

### Infrastructure
- `GET /health` — Instance health check
- `GET /api/instance` — Returns `{ "instance": "backend-1" }` for LB demo

---

## 16. Recommended Technology Stack

- **Frontend:** React + Vite (hosted on Vercel)
- **Backend:** Node.js + Express (hosted on Render / Docker)
- **Database:** PostgreSQL (hosted on Neon free tier)
- **Load Balancer:** Nginx (in Docker Compose)
- **Storage:** Cloudinary (Free image hosting)
- **Load Testing:** k6 CLI
- **Monitoring:** UptimeRobot

---

## 17. Free-Tier Comparison

| Layer | Recommended | Free Tier Limits | Credit Card Needed? |
|---|---|---|---|
| Compute | Render | 750 free instance hours/month | No |
| Database | Neon PostgreSQL | 3 GB storage, serverless | No |
| Frontend | Vercel | Unlimited bandwidth for personal projects | No |
| File Storage | Cloudinary | 25 credits / 25 GB bandwidth | No |
| Load Balancer | Nginx (Docker) | Self-hosted (100% free) | No |
| Load Testing | k6 | Open-source CLI | No |

---

## 18. $0 Deployment Architecture

- **Frontend (Vercel):** Serves compiled React SPA over HTTPS.
- **Load Balancer (Nginx):** Routes API requests to backend instances.
- **Backend Instances (Render/Docker):** Two Express apps connecting to single Neon DB.
- **Cloud Database (Neon):** Shared PostgreSQL database.

---

## 19. High Availability Requirements

- **FR-SCALE-001:** Minimum 2 backend instances active during demo.
- **FR-SCALE-007:** System continues serving traffic if 1 instance fails.
- **FR-HEALTH-001:** Nginx health checks run every 10s on `/health`.

---

## 20. Auto-Scaling Requirements

- **Local Demonstration:** Manual container scaling via Docker Compose (`docker compose up --scale backend=4`).
- **Academic Framing:** Real cloud auto-scaling (AWS ASG/GCP MIG) uses CPU/RPS thresholds. We demonstrate the horizontal capacity concept using Docker Compose.

---

## 21. Performance Requirements

- API response time (p50): < 200ms
- API response time (p95): < 800ms
- Target throughput: 50–100 requests/sec across 2 instances

---

## 22. Load Testing Strategy & k6 Script Examples

- **Tool:** k6 JavaScript load testing framework.
- **Target Metrics:** Throughput (RPS), p95 Latency, Error Rate, and Verification of Instance Distribution.

### Complete k6 Test Script Example (`load-tests/browse_test.js`)

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 Virtual Users (VUs)
    { duration: '1m', target: 50 },   // Sustained load at 50 VUs
    { duration: '30s', target: 100 }, // Stress spike to 100 VUs
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'], // 95% of requests must complete below 800ms
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
  },
};

export default function () {
  // Test 1: Fetch product listing
  const resProducts = http.get('http://localhost/api/products?page=1&limit=12');
  check(resProducts, {
    'products status is 200': (r) => r.status === 200,
  });

  // Test 2: Check load balancing instance ID
  const resInstance = http.get('http://localhost/api/instance');
  check(resInstance, {
    'instance status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

---

## 23. Demonstrating Load Balancing

### Viva Demo Script
1. `docker compose ps` → Show 2 backend containers running.
2. `curl http://localhost/api/instance` × 6 → Observe alternating `backend-1` and `backend-2`.
3. `docker stop shopscale-backend-1` → Stop instance 1.
4. `curl http://localhost/api/instance` × 4 → Observe all traffic routed seamlessly to `backend-2`.
5. Browse application in UI → Proves zero user downtime.
6. `docker start shopscale-backend-1` → Restore instance 1.

---

## 24. Security Requirements

- Passwords hashed with `bcrypt` (salt rounds = 12).
- HTTP headers secured with `helmet()`.
- SQL queries parameterized to prevent SQL injection.
- Rate limiting on `/api/auth/*` endpoints using `express-rate-limit`.
- Secrets stored in `.env` (never committed to git).

---

## 25. Non-Functional Requirements

### Performance & Latency
- First Contentful Paint (FCP) < 1.2s on desktop, < 2.0s on 4G mobile.
- API p50 latency < 150ms for cached product queries, < 300ms for database writes.
- Maximum DB connection pool wait time < 500ms under load.

### Scalability & Elasticity
- Zero-downtime horizontal expansion by attaching new Express instances to the Nginx upstream pool.
- DB connection pooling limits (max 5 active connections per Node process) to respect Neon free-tier limits.

### Reliability & Resilience
- Graceful degradation: If Cloudinary image delivery fails, UI falls back to elegant SVG pattern placeholders without throwing JS exceptions.
- Cart state recovery: If client loses network connectivity during cart modification, state syncs automatically upon reconnect.

### Accessibility & Compatibility
- WCAG 2.1 AA Compliance (minimum 4.5:1 contrast ratio for all text elements).
- Full keyboard accessibility (focus traps on modals, visible focus rings, logical tab order).
- Browser support: Chrome 100+, Safari 15+, Firefox 100+, Edge 100+, Mobile Safari, Chrome Android.

---

## 26. UX/UI Specification & Design System

### ANTI-PATTERN BAN LIST (Strict Rules)
To ensure ShopScale looks like a human-designed commercial e-commerce platform and NOT an AI template:
- 🚫 NO dark navy/black background defaults
- 🚫 NO purple/blue neon gradients or glowing text/borders
- 🚫 NO glassmorphism or translucent blurry cards
- 🚫 NO pill-shaped buttons everywhere (`border-radius` strictly capped at `4px` or `6px`)
- 🚫 NO floating gradient blobs or decorative background geometry
- 🚫 NO "System Online", "AI Powered", or fake status dots in the store header
- 🚫 NO putting every single text element inside a heavy card container

---

### Visual Identity & Brand System

#### Brand Name
**ShopScale** — Modern, editorial, trustworthy e-commerce.

#### Typography System
- **Headings (Brand/Editorial):** `Playfair Display` (Serif, 600 weight) — used for main landing titles, category banners, product titles on detail pages.
- **Body & Interface:** `Inter` (Sans-serif, 400/500/600 weight) — used for prices, navigation, forms, buttons, table data, and metadata.

#### Color Palette (Warm Editorial Commercial)
- **Page Background (`--color-bg`):** `#FAFAF8` (Warm off-white)
- **Surface / Card Background (`--color-surface`):** `#FFFFFF` (Pure white)
- **Borders & Dividers (`--color-border`):** `#E6E4DF` (Subtle warm gray)
- **Primary Accent (`--color-primary`):** `#1B4332` (Deep Forest Green — commercial, trustworthy)
- **Primary Hover (`--color-primary-hover`):** `#0D2818` (Darker green)
- **Secondary Accent (`--color-secondary`):** `#D8F3DC` (Soft sage tint for badges)
- **Text Primary (`--color-text-main`):** `#191918` (Charcoal off-black)
- **Text Muted (`--color-text-muted`):** `#686660` (Neutral gray)
- **Error / Failure (`--color-error`):** `#900C3F` (Deep crimson)
- **Warning / Alert (`--color-warning`):** `#D97706` (Amber)
- **Success (`--color-success`):** `#166534` (Emerald green)

---

### Component System

#### 1. Header & Navigation
- **Left:** Brand logo (`Playfair Display`, `1.5rem`, `#1B4332`), clean wordmark.
- **Center:** Category links (All, Apparel, Electronics, Home, Footwear) with a subtle 2px bottom border on active link.
- **Right:** Search bar (expandable input), Cart button with badge counter (`#1B4332` pill count badge), User Account / Login link, Admin link (if role = `admin`).

#### 2. Product Card Component
- **Structure:** Clean vertical card layout with a `1px solid --color-border`.
- **Image Container:** Fixed 4:3 or 1:1 aspect ratio, clean white background, `overflow: hidden`.
- **Image Hover:** Subtle `scale(1.03)` image transition (0.2s ease).
- **Metadata:**
  - Category tag in uppercase (`11px`, `--color-text-muted`, letter-spacing 1px)
  - Product Name (`Inter`, 600, `15px`, `--color-text-main`)
  - Price (`Inter`, 600, `16px`, `--color-primary`)
  - Stock Badge (e.g. "Low Stock - 3 left" in amber if < 5)
- **Action:** Full-width "Add to Cart" button at bottom of card or quick-add icon overlay.

#### 3. Shopping Cart Drawer / Page
- Clean list layout separated by simple horizontal borders (no unnecessary cards inside cards).
- Thumbnail image (`64x64px`), item title, price, inline `-` `1` `+` quantity selector, remove button (`🗑`).
- Order Summary sidebar: Subtotal, Shipping (Free), Total in bold `18px`, and a large primary green "Proceed to Checkout" button.

#### 4. Checkout & Payment Simulation UI
- Trustworthy, standard 2-column checkout layout.
- Left column: Shipping Details form (Simple, crisp inputs with `1px border`).
- Right column: Order Summary block with item breakdown.
- Payment Simulation step explicitly features a clear banner:
  `ℹ️ Simulation Mode: Click button below to test payment processing (90% success / 10% random failure scenario).`

#### 5. Admin Dashboard & Tables
- Standard tabular presentation (`<table>` with alternating subtle zebra stripes or `1px bottom borders`).
- Status badges: `PAID` (green background), `PENDING` (yellow), `CANCELLED` (red), `SHIPPED` (blue).
- Crisp form inputs for Product CRUD operations with image URL preview box.

---

## 27. User Flows

### Complete Customer Order Flow (Mermaid)

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Frontend as React SPA (Vercel)
    participant LB as Nginx Load Balancer
    participant Backend as Express Instance (1 or 2)
    participant DB as Neon PostgreSQL DB

    Customer->>Frontend: Browse Catalog & Select Product
    Frontend->>LB: GET /api/products/:id
    LB->>Backend: Forward Request (Round-Robin)
    Backend->>DB: SELECT * FROM products WHERE id = :id
    DB-->>Backend: Return Product Data
    Backend-->>Frontend: 200 OK (Product Details)

    Customer->>Frontend: Click "Add to Cart"
    Frontend->>LB: POST /api/cart/items {productId, quantity}
    LB->>Backend: Forward Request
    Backend->>DB: INSERT / UPDATE cart_items
    DB-->>Backend: Cart Updated
    Backend-->>Frontend: 200 OK (Updated Cart Object)

    Customer->>Frontend: Click "Checkout"
    Frontend->>LB: POST /api/checkout
    LB->>Backend: Forward Request
    Backend->>DB: BEGIN TRANSACTION (Create Order + Deduct Stock)
    DB-->>Backend: Transaction Committed (Order ID: #1042)
    Backend-->>Frontend: 201 Created (Order Pending)

    Customer->>Frontend: Click "Simulate Payment"
    Frontend->>LB: POST /api/payments/simulate {orderId}
    LB->>Backend: Forward Request
    Backend->>Backend: Generate Payment Result (90% Success)
    alt Payment Successful
        Backend->>DB: UPDATE orders SET status='PAID'
        Backend->>DB: DELETE FROM cart_items WHERE cart_id = :cartId
        Backend-->>Frontend: 200 OK {status: 'SUCCESS'}
        Frontend->>Customer: Display Order Confirmation Page
    else Payment Failed
        Backend->>DB: UPDATE orders SET status='CANCELLED'
        Backend->>DB: RESTORE product stock_quantity
        Backend-->>Frontend: 400 Bad Request {status: 'FAILED'}
        Frontend->>Customer: Display Payment Failed Notice & Retry Option
    end
```

---

## 28. System Architecture

```mermaid
graph TD
    subgraph Client Layer
        A[Customer Browser]
        B[Admin Browser]
    end

    subgraph CDN & Frontend
        C[Vercel Global CDN - React SPA]
    end

    subgraph Traffic Distribution Layer
        D[Nginx Reverse Proxy / Load Balancer :80]
    end

    subgraph Application Tier - Stateless Containers
        E[Express App Instance 1 :3001]
        F[Express App Instance 2 :3002]
    end

    subgraph Data & Storage Tier
        G[(Neon PostgreSQL Cloud DB)]
        H[Cloudinary Image Storage]
    end

    subgraph Health Monitoring
        I[UptimeRobot External Health Check]
    end

    A --> C
    B --> C
    C -->|API Requests| D
    D -->|Round Robin| E
    D -->|Round Robin| F
    E --> G
    F --> G
    E --> H
    F --> H
    I -->|GET /health every 5m| D
```

---

## 29. Project Folder Structure

```text
cloudproject2/
├── frontend/                     # React + Vite Client
│   ├── public/
│   ├── src/
│   │   ├── api/                  # Axios/Fetch API wrappers
│   │   ├── components/           # Navbar, Footer, ProductCard, CartDrawer, etc.
│   │   ├── context/              # AuthContext, CartContext
│   │   ├── pages/                # Catalog, ProductDetail, Cart, Checkout, Admin, Orders
│   │   ├── styles/               # index.css (Design System Tokens)
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── config/               # db.js (Neon PG Pool), cloudinary.js
│   │   ├── controllers/          # auth, product, cart, checkout, order controllers
│   │   ├── middleware/           # authMiddleware.js, errorHandler.js
│   │   ├── routes/               # api routes
│   │   └── server.js             # Express app entry point
│   ├── migrations/               # SQL schema definition scripts
│   ├── seeds/                    # Sample product & category data scripts
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   └── nginx.conf                # Load Balancer Upstream configuration
├── load-tests/
│   ├── browse_test.js            # k6 test script for GET /api/products
│   └── stress_test.js            # k6 stress test script
├── docker-compose.yml            # Runs Nginx + 2 Backend Instances
├── PRD.md                        # Master PRD Document
└── README.md                     # Setup and execution guide
```

---

## 30. Development Phases

1. **Phase 1 (Database & Express Baseline):** Database migrations on Neon, Express boilerplate, `/health` and `/api/instance` endpoints.
2. **Phase 2 (Auth & Product APIs):** Custom JWT implementation, bcrypt password hashing, product listing, filtering, search APIs.
3. **Phase 3 (Cart, Checkout & Payment Simulation):** DB-backed cart APIs, atomic checkout database transaction, simulated payment engine.
4. **Phase 4 (Frontend UI Implementation):** Build React SPA adhering strictly to the established design system tokens.
5. **Phase 5 (Dockerization & Nginx Load Balancing):** Create `docker-compose.yml` with 2 backend containers and Nginx round-robin load balancing.
6. **Phase 6 (Load Testing & Viva Validation):** Execute k6 load scripts, verify instance switching, test backend instance failure recovery.

---

## 31. MVP Scope

### Included in MVP
- Complete E-Commerce Storefront (Browse, Filter, Search, Product Detail).
- Shopping Cart & Checkout with Simulated Payment Engine.
- Custom JWT Authentication & Role-Based Access Control (Customer / Admin).
- Admin Dashboard (Manage Products, View Orders).
- Multi-Instance Backend Architecture (2 Docker containers).
- Nginx Load Balancing with `/api/instance` verification.
- Neon Cloud PostgreSQL Database with connection pooling.
- Automated k6 load testing scripts.

### Excluded from MVP
- Real Stripe / PayPal processing (simulated only).
- Kubernetes / Microservices (Docker Compose is cleaner for student project).
- Redis Caching / ElasticSearch (Database indexes are sufficient).

---

## 32. Testing Strategy

- **Unit & Integration Testing:** Jest tests for auth middleware, JWT generation, and cart subtotal calculation logic.
- **API Functional Testing:** Postman / Thunder Client collection for all API endpoints.
- **Scalability & Load Testing:** `k6` CLI running multi-VU scripts against the Nginx load balancer to measure RPS, latency, and error rates.
- **Failover Testing:** Manual execution of `docker stop shopscale-backend-1` while making requests to prove seamless failure handling.

---

## 33. Acceptance Criteria

- **AC-01 (Load Balancing):** Making 10 sequential calls to `GET /api/instance` through Nginx returns alternating `backend-1` and `backend-2` instance responses.
- **AC-02 (High Availability):** Stopping `backend-1` via `docker stop` results in 0 dropped requests for subsequent customer calls to `/api/products` or `/api/cart`.
- **AC-03 (Stateless Cart):** Adding an item to the cart when served by `backend-1` and subsequently fetching `/api/cart` when served by `backend-2` returns the exact same cart items.
- **AC-04 (Atomic Checkout):** Completing checkout on an item with stock = 1 simultaneously from 2 browser sessions results in exactly 1 successful order and 1 out-of-stock error response (no negative inventory).

---

## 34. Error Handling

Standardized Error JSON Format across all endpoints:
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Only 2 units of 'Leather Journal' remaining in stock.",
    "timestamp": "2026-08-13T20:00:00.000Z"
  }
}
```

---

## 35. Comprehensive Risks & Mitigations (15 Identified Risks)

| Risk ID | Risk Description | Severity / Likelihood | Mitigation Strategy |
|---|---|---|---|
| **RSK-01** | Render Free-Tier instance spins down after 15 min of inactivity (cold start delay) | High / High | Script pinging `/health` endpoint every 5 minutes prior to viva demonstration. |
| **RSK-02** | Neon Cloud DB connection limits (max 20 connections) exceeded by multiple backend processes | High / Medium | Enforce strict Express `pg-pool` max connection caps (`max: 5` per backend container). |
| **RSK-03** | Docker Desktop resource starvation on dev laptop during multi-instance load testing | Medium / Medium | Limit container count to 2 backend instances + 1 Nginx instance during demo. |
| **RSK-04** | Cloudinary free tier bandwidth limit exceeded by large product images | Low / Low | Auto-resize images on upload to max 800px width using Cloudinary transformation parameters. |
| **RSK-05** | JWT Secret mismatch across backend containers leading to 401 Unauthorized errors | High / Low | Define `JWT_SECRET` centrally in `.env` passed to both containers via `docker-compose.yml`. |
| **RSK-06** | Browser CORS rejection when React frontend on Vercel calls Render backend API | High / Medium | Configure Express `cors()` middleware with explicit `origin` whitelist. |
| **RSK-07** | Race condition in stock deduction during concurrent checkouts | High / Low | Wrap checkout in explicit SQL transaction (`BEGIN ... COMMIT`) with `FOR UPDATE` row lock. |
| **RSK-08** | Invalidation of user session on server restart | Low / Low | Custom JWTs are stateless; zero server session state saved in memory. |
| **RSK-09** | Nginx failing to detect backend container crash immediately | Medium / Low | Configure aggressive Nginx health checks (`max_fails=2 fail_timeout=5s`). |
| **RSK-10** | Evaluator confusing payment simulation for broken real payment gateway | Medium / Medium | Explicit banner on Checkout page: *"Simulation Mode: No real cards charged."* |
| **RSK-11** | Local machine port conflicts (Port 80 or 3001 already in use) | Low / Medium | Configurable environment variables for container port mapping in `docker-compose.yml`. |
| **RSK-12** | Database migration failure on fresh setup | Medium / Low | Write idempotent migration scripts (`CREATE TABLE IF NOT EXISTS`). |
| **RSK-13** | k6 load testing generating excessive error logs and filling disk | Low / Low | Configure k6 script output to log summary statistics only. |
| **RSK-14** | Vercel frontend deployment build failure due to strict Linter rules | Low / Low | Standardize ESLint rules and test `npm run build` locally prior to push. |
| **RSK-15** | Scope creep delaying core load balancing demonstration | High / Medium | Enforce strict MVP boundary; defer search filters/reviews until core demo is complete. |

---

## 36. Backup and Recovery

- **Code Base:** Continuous version control via GitHub repository.
- **Database Schema & Data:** Idempotent SQL migration and seeding scripts stored in `/backend/migrations` and `/backend/seeds`.
- **Environment Recovery:** Re-creatable infrastructure state driven entirely by `docker-compose.yml` and `.env.example`.

---

## 37. Deployment Guide

### Local Multi-Instance Run (Docker Compose)
```bash
# 1. Clone & setup environment variables
git clone https://github.com/user/cloudproject2.git
cd cloudproject2
cp backend/.env.example backend/.env

# 2. Build and launch Nginx + 2 Backend instances
docker-compose up --build -d

# 3. Verify load balancing
curl http://localhost/api/instance
# Output: {"instance":"backend-1"}
curl http://localhost/api/instance
# Output: {"instance":"backend-2"}
```

---

## 38. Environment Variables

### Backend `.env` Template
```dotenv
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:password@ep-cool-host.neon.tech/neondb?sslmode=require
JWT_SECRET=super_secret_jwt_key_shopscale_2026
INSTANCE_ID=backend-1
CLOUDINARY_CLOUD_NAME=shopscale_demo
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abcdefg_secret
```

---

## 39. Academic Documentation & Viva Demonstration Script

### Mapping to Course Learning Outcomes

| Learning Outcome | How ShopScale Demonstrates It | Verification / Viva Proof |
|---|---|---|
| **Distributed Architecture & Load Balancing** | HTTP requests routed via Nginx reverse proxy using Round-Robin across 2 isolated Express containers. | Executing `curl http://localhost/api/instance` shows alternating `backend-1` and `backend-2`. |
| **High Availability & Fault Tolerance** | Application remains 100% operational when an active backend server is killed. | Running `docker stop shopscale-backend-1` while browsing results in zero downtime. |
| **Stateless Application Design** | No server-side session memory. User state resides in JWTs and database. | Adding items to cart on `backend-1` and querying cart on `backend-2` returns identical data. |
| **Database Concurrency & ACID Transactions** | PostgreSQL transactional row locks prevent race conditions during checkout. | Concurrent k6 requests attempting checkout on low-stock items succeed once and fail gracefully for rest. |

---

### Step-by-Step Viva Demonstration Script (15 Minutes)

#### Step 1: Architecture Presentation (3 Mins)
- Display the System Architecture Diagram (Section 28).
- Explain the 4-tier model: Vercel SPA $\rightarrow$ Nginx Load Balancer $\rightarrow$ Express Backends $\rightarrow$ Neon Cloud Database.

#### Step 2: Live Storefront Walkthrough (4 Mins)
- Open browser at `http://localhost`.
- Browse products, apply category filter, and view product details.
- Add product to cart, proceed to checkout, and complete payment simulation.
- Show order confirmation and order history.

#### Step 3: Load Balancing Demonstration (3 Mins)
- Open terminal and execute:
  ```bash
  for i in {1..6}; do curl -s http://localhost/api/instance; echo ""; done
  ```
- Show alternating responses: `{"instance":"backend-1"}` $\rightarrow$ `{"instance":"backend-2"}`.

#### Step 4: High Availability & Instance Failure Test (3 Mins)
- Stop backend 1 live: `docker stop shopscale-backend-1`.
- Execute `curl -s http://localhost/api/instance` again.
- Show all requests transparently routed to `backend-2` without errors.
- Refresh the React storefront to prove the app functions normally.
- Restart instance: `docker start shopscale-backend-1`.

#### Step 5: k6 Load Test Execution (2 Mins)
- Run load script in terminal: `k6 run load-tests/browse_test.js`.
- Display real-time RPS, p95 latency (< 800ms threshold), and 0% error rate output.

---

## 40. Future Enhancements

- Redis cache layer for high-frequency product catalog queries.
- Webhook notifications for shipping updates.
- Real Stripe sandbox integration.

---

## 41. Final Recommended Architecture

- **Frontend:** React + Vite on Vercel
- **Load Balancer:** Nginx (Docker Compose)
- **Backend:** 2× Node.js Express Containers
- **Database:** PostgreSQL on Neon
- **Estimated Cost:** $0.00 / month

---

## 42. Final Build & Implementation Checklist

### Phase 1: Environment & Core Setup
- [x] PRD Document completed & design system tokens defined
- [ ] Initialize Git repository with `frontend/`, `backend/`, and `nginx/` directories
- [ ] Create Neon PostgreSQL Cloud Database instance
- [ ] Write SQL schema migrations (`001_users.sql`, `002_categories.sql`, `003_products.sql`, etc.)
- [ ] Run seed script for initial product categories and mock products

### Phase 2: Express Backend APIs
- [ ] Setup Node.js Express app with `helmet`, `cors`, `morgan`, and `express-rate-limit`
- [ ] Implement `pg-pool` database configuration with Neon TLS connection string
- [ ] Implement Custom JWT Authentication (`/api/auth/register`, `/api/auth/login`, `/api/auth/profile`)
- [ ] Implement `authenticateToken` and `requireAdmin` role middleware
- [ ] Implement Product REST endpoints (GET list/filter/search, GET detail, Admin POST/PUT/DELETE)
- [ ] Implement DB-backed Shopping Cart endpoints (`/api/cart`)
- [ ] Implement Atomic Checkout & Payment Simulation API (`/api/checkout`, `/api/payments/simulate`)
- [ ] Implement Infrastructure endpoints (`GET /health`, `GET /api/instance`)

### Phase 3: React Frontend Development
- [ ] Create React + Vite project and configure CSS design tokens in `index.css`
- [ ] Build Brand Navigation Header with Category links, Search input, and Cart badge
- [ ] Build Product Catalog grid with filter sidebar and pagination
- [ ] Build Product Detail page with quantity controls and stock status indicators
- [ ] Build Shopping Cart drawer and dedicated checkout page
- [ ] Build Payment Simulation page with explicit simulation banner and result handlers
- [ ] Build Customer Order History page
- [ ] Build Admin Dashboard (Product CRUD forms & Order Status management tables)

### Phase 4: Docker & Load Balancing Infrastructure
- [ ] Create Backend `Dockerfile`
- [ ] Create `nginx/nginx.conf` with round-robin upstream pool and `/health` monitoring
- [ ] Create `docker-compose.yml` orchestrating `nginx`, `backend-1`, and `backend-2`
- [ ] Test local multi-container launch (`docker-compose up --build`)
- [ ] Verify load balancing via `curl http://localhost/api/instance`

### Phase 5: Load Testing & Final Verification
- [ ] Create `load-tests/browse_test.js` k6 load testing script
- [ ] Run k6 load test and verify p95 latency < 800ms
- [ ] Perform instance kill test (`docker stop shopscale-backend-1`) and verify zero downtime
- [ ] Verify full student viva demonstration workflow

---
*End of Master Product Requirements Document & Design Specification*
