FROM node:20-alpine

# Install build tools for better-sqlite3 native addon
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Set environment
ENV PORT=8000
ENV NODE_ENV=production
ENV HOST=0.0.0.0

CMD ["node", "index.js"]
