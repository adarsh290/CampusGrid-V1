# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json, package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the backend
RUN npm run build:backend

# Prune dev dependencies
RUN npm prune --production


# Stage 2: Production image
FROM node:18-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /usr/src/app

# Copy production node_modules, built app, and package.json from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json

# Expose port 5000
EXPOSE 5000

# Run the compiled app
CMD ["node", "dist/backend/server.js"]
