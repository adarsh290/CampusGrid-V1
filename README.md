# CampusGrid - A Full-Stack Game Store Platform

CampusGrid is a digital storefront designed to serve large game files (50GB+) over a local network (LAN). This project has been optimized for deployment on **Linux (Fedora/Ubuntu)** using Docker.

## 🚀 Quick Start (Linux/Fedora)

The easiest way to get the site running on your network is to use the included deployment script.

### 1. Run the Deployment Script
In your terminal, run:
```bash
chmod +x deploy.sh
./deploy.sh
```
*This script will automatically configure your firewall, set up storage, build the containers, and seed the database.*

### 2. Access the Site
Once the script finishes, it will provide you with your local IP address. Access the site at:
**`http://<your-ip>:8080`**

### 3. Managing the Site
- **Start:** `./deploy.sh`
- **Stop:** `docker compose stop`
- **Complete Shutdown:** `docker compose down`
- **View Logs:** `docker compose logs -f`

---

## 📁 Managing Game Files

Game files are served from the `./storage` directory on your host machine.

1.  **Add Games:** Drop your `.zip` or game folders into the `storage/` folder.
2.  **Admin Panel:** When adding a game in the browser, use the path: `/storage/your-game-file.zip`.
3.  **Metadata:** Screenshots and covers are automatically stored in `storage/metadata`.

---

## 🛠️ Technologies & Security

-   **Frontend:** React (TypeScript), Vite, Tailwind CSS, shadcn-ui.
-   **Backend:** Node.js (TypeScript), Express.js.
-   **Database:** MongoDB.
-   **Proxy:** NGINX (handles large file streaming via `X-Accel-Redirect`).
-   **Security:**
    -   JWT Authentication with strict enforcement.
    -   Rate limiting on Auth/Order endpoints.
    -   SELinux compatible Docker mounts (using `:Z` flags).
    -   Flexible CORS for LAN-wide access.

---

## 🖥️ Database Commands

To inspect users or roles, enter the MongoDB shell:
```bash
docker exec -it campusgrid-mongo mongosh campusgrid
```

- **Count Users:** `db.users.countDocuments()`
- **Find Admins:** `db.users.find({ role: "admin" })`
- **Make Admin:** `db.users.updateOne({ username: "NAME" }, { $set: { role: "admin" } })`

---

## 🧪 Development & Testing

- **Local Dev (Frontend):** `npm install && npm run dev`
- **Local Dev (Backend):** `npm run server:dev`
- **Run Tests:** `npm test`

*Note: For the backend to run outside of Docker, you must have a local MongoDB instance running and update your `.env` file accordingly.*
