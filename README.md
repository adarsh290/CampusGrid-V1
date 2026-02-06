# CampusGrid - A Full-Stack Game Store Platform

CampusGrid is a full-stack web application that serves as a digital storefront for games. It features a React frontend, a Node.js/Express backend, and a complete Docker-based environment for easy setup and deployment.

## Technologies Used

-   **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn-ui
-   **Backend:** Node.js, Express.js, TypeScript
-   **Database:** MongoDB
-   **Containerization:** Docker, Docker Compose
-   **Web Server / Proxy:** NGINX

## Prerequisites

Before you begin, ensure you have the following installed on your system:
-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose

**Security Enhancements**
- **Strict CORS whitelist** – only origins listed in the allowed list are accepted; others receive a 403 response.
- **JWT secret enforcement** – the server will exit on start‑up if `JWT_SECRET` is not defined.
- **Rate limiting** – authentication and order endpoints are limited to 100 requests per 15 minutes per IP via `express-rate-limit`.
- **Input validation** – signup, login, and admin game create/update routes validate request bodies using `express-validator` and return clear error messages.
- **Generic error handling** – internal stack traces are logged server‑side but not exposed to clients.
- **Health‑check endpoint** – `/api/health` returns service status; Docker Compose includes a health‑check that pings this endpoint.


Before you begin, ensure you have the following installed on your system:
-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose

## Getting Started with Docker

This is the recommended way to run the application for a production‑like environment on your college network.

**1️⃣ Environment Variables**

The application relies on a `.env` file for the database connection and secret keys.

```sh
cp .env.example .env
```

Edit the new `.env` and set:
- `MONGODB_URI` – your MongoDB connection string.
- `JWT_SECRET` – a strong secret. The server will refuse to start if this variable is missing.
- Any other configuration you need for your network.

**2️⃣ Build and Run**

```sh
docker-compose up --build
```

Docker Compose now includes a **health‑check** for the backend service, which ensures the API is reachable before NGINX starts routing traffic.

**What you get**
- The backend runs with **strict CORS** (only whitelisted origins are allowed).
- **Rate limiting** (100 requests per 15 min per IP) protects the auth and order endpoints.
- **Input validation** on signup, login, and game create/update routes prevents malformed data.
- Generic error responses hide internal stack traces.

The application will be accessible at **http://localhost:8080** (or the IP/port you configure in NGINX).

## Development

The Docker Compose setup orchestrates three main services:

-   `nginx`: The main entry point for the application, accessible at `http://localhost:8080`. It serves the frontend and proxies API requests to the backend.
-   `backend`: The Node.js/Express API server. It is not directly accessible from the host but communicates with the NGINX service.
-   `frontend`: This service is responsible for building the static frontend assets that NGINX serves.

For frontend development with hot-reloading, you can run the Vite dev server separately:
1. Navigate to the project root.
2. Install dependencies: `npm install`.
3. Run the dev server: `npm run dev`.
The frontend will be available at `http://localhost:5173`.

## Testing

This project uses [Vitest](https://vitest.dev/) for unit and component testing.

To run the entire test suite once, use the following command:

```sh
npm test
```

## Project Structure Overview

-   `nginx/`: Contains the NGINX configuration.
-   `scripts/`: Contains utility scripts for database seeding and admin tasks.
-   `src/`: The React frontend application source code.
-   `controllers/`, `models/`, `routes/`, `middleware/`: The backend Express.js application, now written in TypeScript.
-   `types/`: Contains shared TypeScript type definitions, including augmentations for Express.
-   `backend.Dockerfile`, `frontend.Dockerfile`: Docker build configurations for the services.
-   `docker-compose.yml`: Orchestrates the entire application stack.
-   `tsconfig.backend.json`: TypeScript configuration for the Node.js backend.
