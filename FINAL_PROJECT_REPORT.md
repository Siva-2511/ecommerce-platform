# ShopScale: Final Project Report

## 1. Project Overview
ShopScale is a professional-grade, highly scalable cloud-based e-commerce platform. The system is designed to demonstrate modern software architecture patterns, specifically focusing on stateless backend design, load balancing, atomic database transactions, and a bespoke user interface. 

## 2. Problem Statement
Traditional e-commerce platforms often struggle with scale because they rely on in-memory state (such as user sessions or shopping carts) tied to specific servers. This creates bottlenecks and prevents horizontal scaling. Additionally, high-traffic scenarios (e.g., flash sales) often lead to "overselling" inventory due to race conditions in the database.

ShopScale solves these problems by:
1. Being entirely stateless at the application tier.
2. Utilizing strict row-level database locking to guarantee atomic inventory management.
3. Implementing a reverse proxy to evenly distribute traffic across a horizontal cluster of backend nodes.

## 3. Technology Stack
- **Frontend**: React.js, Vite, Vanilla CSS (No generic UI libraries)
- **Backend API**: Node.js, Express.js
- **Database**: PostgreSQL (Neon Serverless DB)
- **Load Balancing**: Nginx
- **Containerization**: Docker & Docker Compose
- **Security**: JSON Web Tokens (JWT), bcrypt, Helmet, CORS

## 4. Architecture
The system employs a 4-tier architecture:
1. **Client Tier**: A responsive React SPA.
2. **Proxy Tier**: Nginx listening on port 8080, handling incoming requests and routing them to the backend cluster using Round-Robin load balancing.
3. **Application Tier**: Two identical, horizontally scaled Node.js backend instances (`backend1` and `backend2`). 
4. **Data Tier**: A single, shared PostgreSQL database hosted on Neon.

## 5. Stateless Architecture & High Availability
In ShopScale, if `backend1` crashes, `backend2` seamlessly takes over without any loss of user data. This is achieved because:
- **Authentication**: JWTs are stored client-side. The backend only validates the cryptographic signature statelessly.
- **Cart State**: Every "Add to Cart" action is immediately persisted to the `cart_items` table in the PostgreSQL database. Neither backend instance stores the cart in memory.

## 6. Checkout Transaction Design
To prevent overselling, the checkout process utilizes an atomic SQL transaction with a `SELECT ... FOR UPDATE` lock. 
When a user begins checkout:
1. A transaction `BEGIN` is triggered.
2. The system fetches the user's cart items and places an exclusive lock on the corresponding rows in the `products` table.
3. The system verifies that the requested quantity is `<= stock_quantity`.
4. The order is created and `stock_quantity` is deducted.
5. The transaction is `COMMIT`ted.

If two users attempt to buy the last remaining item at the exact same millisecond, the database forces one transaction to wait. Once the first transaction commits, the second transaction sees the updated stock (0), correctly fails, and prevents the inventory from going negative.

## 7. Security
- **Authentication**: Custom JWT implementation with 7-day expiry.
- **Passwords**: Hashed using `bcrypt` with a work factor of 12.
- **Database Credentials**: Managed entirely via `.env` files which are strictly excluded from version control via `.gitignore`.
- **RBAC**: Middleware enforces Role-Based Access Control, ensuring only users with the `admin` role can access product creation or order fulfillment routes.

## 8. Database Architecture
The PostgreSQL schema consists of 8 interconnected tables:
- `users`: Core identity (id, email, password_hash, role)
- `categories`: Product taxonomies
- `products`: Catalog and inventory count
- `carts` & `cart_items`: Ephemeral shopping state
- `orders` & `order_items`: Permanent purchase records
- `payments`: Financial transaction tracking

## 9. Design Philosophy
The frontend rejects standard "AI-generated SaaS" tropes (glassmorphism, neon gradients, dark modes). Instead, it adopts a high-end editorial/commercial aesthetic.
- **Typography**: `Playfair Display` for brand/headings and `Inter` for functional UI elements.
- **Color Palette**: Deep Forest Green (`#1B4332`), soft off-whites for the background, and high-contrast dark gray text.

## 10. Deployment
The entire backend ecosystem is containerized. Deploying the cluster locally is achieved via:
```bash
docker-compose up --build
```
This builds the Node.js Alpine images, mounts the Nginx configuration, and starts the load-balanced network.

## 11. Known Limitations & Future Improvements
- **Payment Processing**: Currently uses a simulated gateway with a 90% success rate. Integration with Stripe is the logical next step.
- **Image Storage**: Product images use placeholder URLs. Future iterations should implement Cloudinary integration for scalable media hosting.
- **Caching**: Implementing Redis for product catalog caching would significantly reduce database read-load during high-traffic events.
