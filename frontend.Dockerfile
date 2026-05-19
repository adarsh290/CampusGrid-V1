# Stage 1: Build the React application
FROM node:18-alpine as builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies using npm
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Build the project
RUN npm run build


# Stage 2: The final image is just a lightweight server for the static files
# In our case, NGINX will handle this, so this file's main purpose is the build artifact.
# We create a minimal final stage to hold the build output.
FROM alpine:latest
WORKDIR /usr/src/app/dist
COPY --from=builder /usr/src/app/dist .

# This image is not meant to be run directly, but to be used by NGINX.
# The CMD is just a placeholder.
CMD ["echo", "Frontend build artifacts. Use with NGINX."]
