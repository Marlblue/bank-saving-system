FROM node:20-alpine

# Install build tools for better-sqlite3 native addon
RUN apk add --no-cache python3 make g++

WORKDIR /app

# --- Install backend dependencies ---
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --only=production

# --- Install frontend dependencies & build ---
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci

COPY frontend/ ./frontend/
RUN cd frontend && VITE_API_URL=/api npm run build

# --- Copy backend source ---
COPY backend/ ./backend/

# Expose port 7860 (Hugging Face Spaces default)
EXPOSE 7860

ENV PORT=7860
ENV NODE_ENV=production
ENV HOST=0.0.0.0

WORKDIR /app/backend

CMD ["node", "index.js"]
