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

ARG MONGODB_URI
ARG MONGODB_DB_NAME
ARG MONGODB_COLLECTION_NAME
ARG LDAP_URL
ARG JWT_SECRET
ARG SYM_ENC_KEY

# Build Next.js app (no external requests)
RUN npm run build

# Final stage: production server
FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app /app

# Expose Next.js port
EXPOSE 3000

# Run Next.js server
CMD ["npm", "start"]
