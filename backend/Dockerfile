FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application source
COPY . .

# Expose port (will be mapped dynamically or overridden by docker-compose)
EXPOSE 3001

# Run the server
CMD ["node", "src/server.js"]
