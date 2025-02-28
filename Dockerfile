# Use a local Node.js image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies in offline mode (ensure lock file exists)
RUN npm install --production --omit=dev --cache=/tmp/.npm --prefer-offline

# Copy application code
COPY . .

# Build Next.js app (no external requests)
RUN npm run build

# Final stage: production server
FROM node:20-alpine

WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app /app

# Expose Next.js port
EXPOSE 3000

# Run Next.js server
CMD ["npm", "start"]
