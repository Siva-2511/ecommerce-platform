# Viva Checklist & Q&A

This document provides simple, articulate answers to common defense/viva questions regarding the ShopScale architecture, as well as a script for a 5–10 minute project demonstration.

## Core Concepts Q&A

**Q: What is load balancing?**
A: Load balancing is the process of distributing incoming network traffic across multiple servers. This ensures no single server bears too much demand, improving responsiveness and availability.

**Q: Why use Nginx?**
A: Nginx is a highly performant web server that excels as a reverse proxy and load balancer. We use it to accept traffic from the client and route it to our backend nodes.

**Q: Why two backend instances?**
A: Running two instances demonstrates horizontal scaling and high availability. If one instance crashes, the load balancer will route all traffic to the remaining instance, keeping the application online.

**Q: What does "stateless" mean?**
A: A stateless application does not store client data (like sessions or shopping carts) in its local memory from one request to the next. Every request contains all the information needed to process it (e.g., a JWT token), and shared state is persisted in a central database. This allows any backend instance to serve any request.

**Q: Why PostgreSQL?**
A: PostgreSQL is a powerful, open-source relational database. We chose it because e-commerce data is highly relational (Users have Orders, Orders have Items) and it supports robust ACID transactions.

**Q: Why Neon?**
A: Neon provides serverless PostgreSQL. It separates storage and compute, allowing the database to scale seamlessly and pausing compute when inactive, which perfectly fits a $0-cost/open-source cloud architecture.

**Q: How does JWT work?**
A: JSON Web Tokens (JWT) are cryptographically signed tokens issued upon login. The client stores the token and sends it with every request. The backend can verify the signature mathematically without needing to look up the user's session in a database, enabling stateless authentication.

**Q: Why bcrypt?**
A: Bcrypt is a password-hashing function designed to be intentionally slow (computationally expensive). This protects user passwords against brute-force and rainbow table attacks.

**Q: How does Docker help?**
A: Docker packages our application and all its dependencies into a standardized unit called a container. This guarantees that the application will run exactly the same way on my machine, your machine, or a production server.

**Q: How does docker-compose work?**
A: Docker-compose is a tool for defining and running multi-container Docker applications. Our `docker-compose.yml` file allows us to spin up the Nginx load balancer and both backend instances simultaneously, automatically connecting them to the same network.

**Q: How does round-robin work?**
A: Round-robin is a load-balancing algorithm that sends incoming requests to each server in a sequential order. Request 1 goes to Server A, Request 2 goes to Server B, Request 3 goes back to Server A, and so on.

**Q: What happens if one backend instance fails?**
A: The load balancer (Nginx) will fail to connect to the down instance and will automatically route the request to the remaining healthy instance. Because the backend is stateless, the user will not lose their session or cart data.

**Q: How does the checkout transaction prevent overselling?**
A: We use an atomic database transaction combined with a row-level lock (`SELECT ... FOR UPDATE`). When a user checks out, the database locks the specific products they are buying. If another user tries to buy the same product at the exact same time, their transaction must wait until the first one finishes. This guarantees the stock is never deducted below zero.

**Q: Why is database state shared between instances?**
A: If each instance had its own database, a user might add an item to their cart on Server A, but when they go to checkout, the load balancer might route them to Server B, which wouldn't know about their cart. A shared, central database ensures consistency across the entire cluster.

**Q: How would this architecture scale to more instances?**
A: We would simply update our `docker-compose.yml` (or Kubernetes deployment) to spin up Backend 3, 4, and 5, and add them to the Nginx upstream block. Because the backend is stateless and the database is centralized, the cluster can scale infinitely horizontally.

---

## Project Demonstration Flow (5-10 Minutes)

1. **Architecture Introduction (1 min)**
   - Explain that this is a 4-tier architecture.
   - Show the `docker-compose.yml` and `nginx.conf` files to prove there are two backend instances and a load balancer.

2. **Stateless Verification & Health Check (2 mins)**
   - Start the cluster (`docker-compose up -d`).
   - Hit the `/api/instance` endpoint a few times to show the response alternating between `backend-node-1` and `backend-node-2`, proving round-robin load balancing.

3. **Frontend Walkthrough & Authentication (2 mins)**
   - Open the React frontend. Highlight the bespoke Deep Forest Green editorial design.
   - Navigate to the login page and sign in as `admin@shopscale.com` / `admin123`.
   - Explain that a JWT is now stored in the client and is sent with every request.

4. **The Shopping Flow & Cart State (2 mins)**
   - Browse the catalog and add a product to the cart.
   - Explain that the cart state is stored in the database, not in backend memory. 
   - (Optional) Kill `backend1` in docker. Refresh the page to show the cart is still there, proving the stateless high-availability design.

5. **Atomic Checkout (2 mins)**
   - Proceed to checkout.
   - Show the two-step process: Shipping Address -> Payment Simulation.
   - Click "Simulate Payment". Explain the `SELECT ... FOR UPDATE` logic happening under the hood to reserve stock.
   - Go to the Admin Dashboard to show the newly created order.
