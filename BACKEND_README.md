# CampusGrid Backend API

A high-performance Node.js backend for serving large game files (50GB+) from local storage to LAN users.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/campusgrid

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 3. Start MongoDB

Make sure MongoDB is running on your system.

### 4. Run the Server

```bash
npm run server
```

For development with auto-reload:
```bash
npm run server:dev
```

## 📁 Project Structure

```
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── authController.js  # Authentication logic
│   ├── gameController.js  # Game CRUD + streaming
│   └── orderController.js # Purchase simulation
├── middleware/
│   ├── auth.js            # JWT verification
│   └── admin.js           # Admin role check
├── models/
│   ├── User.js            # User schema
│   └── Game.js            # Game schema
├── routes/
│   ├── authRoutes.js      # Auth endpoints
│   ├── gameRoutes.js      # Game endpoints
│   └── orderRoutes.js     # Order endpoints
└── server.js              # Entry point
```

## 🔐 API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user" // optional, defaults to "user"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `GET /api/auth/me` - Get current user (requires auth token)

### Games

- `GET /api/games` - Get all games (public)
- `GET /api/games/:id` - Get single game (public)
- `GET /api/games/:id/download` - Download game file (requires auth + ownership)
- `POST /api/games` - Create game (admin only)
  ```json
  {
    "title": "Cyberpunk 2077",
    "description": "Open-world RPG",
    "price": 59.99,
    "coverImage": "https://example.com/cover.jpg",
    "genre": "RPG",
    "localFilePath": "D:/CampusGames/cyberpunk.zip"
  }
  ```
- `PUT /api/games/:id` - Update game (admin only)
- `DELETE /api/games/:id` - Delete game (admin only)

### Orders

- `POST /api/orders/buy/:gameId` - Purchase game (adds to library)
- `GET /api/orders/library` - Get user's game library

## 🔒 Security Features

1. **Password Hashing**: Uses bcryptjs with salt rounds
2. **JWT Authentication**: Secure token-based auth
3. **Path Traversal Protection**: Validates file paths to prevent directory traversal attacks
4. **Hidden File Paths**: `localFilePath` is excluded from API responses by default
5. **Ownership Verification**: Users can only download games they own

## 📦 Streaming Engine

The `downloadGame` function uses `fs.createReadStream()` to stream large files without loading them into RAM:

- ✅ Uses streaming (memory efficient)
- ✅ Validates file existence
- ✅ Prevents path traversal attacks
- ✅ Sets proper download headers
- ✅ Verifies user ownership

**Critical**: Never use `fs.readFile()` for large files as it will crash server RAM.

## 🧪 Testing

### Create Admin User

```bash
# Use MongoDB shell or a tool like Postman
POST /api/auth/signup
{
  "username": "admin",
  "email": "admin@campusgrid.com",
  "password": "admin123",
  "role": "admin"
}
```

### Add a Game (as Admin)

```bash
POST /api/games
Headers: Authorization: Bearer <admin_token>
{
  "title": "Test Game",
  "description": "A test game",
  "price": 29.99,
  "coverImage": "https://example.com/cover.jpg",
  "genre": "Action",
  "localFilePath": "D:/CampusGames/test-game.zip"
}
```

### Purchase Game (as User)

```bash
POST /api/orders/buy/<gameId>
Headers: Authorization: Bearer <user_token>
```

### Download Game

```bash
GET /api/games/<gameId>/download
Headers: Authorization: Bearer <user_token>
```

## ⚠️ Important Notes

1. **File Paths**: When adding games, use absolute paths like `D:/CampusGames/game.zip`
2. **JWT Secret**: Change the default JWT_SECRET in production
3. **CORS**: Update FRONTEND_URL in `.env` for production
4. **MongoDB**: Ensure MongoDB is running before starting the server
5. **Large Files**: The streaming engine handles 50GB+ files efficiently

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + bcryptjs
- **File Streaming**: Node.js fs.createReadStream



