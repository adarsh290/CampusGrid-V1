import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    console.log("\n🕵️ SECURITY CHECK INITIATED...");
    
    // 1. Check if header exists
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log("❌ No token found in header!");
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    console.log("🔑 Token received (first 10 chars):", token.substring(0, 10) + "...");

    // 2. Verify Signature
    // IMPORTANT: We print which secret we are using to check for mismatches
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    console.log("🔐 Verifying with Secret:", secret);

    const decoded = jwt.verify(token, secret);
    console.log("✅ Signature Verified. User ID inside token:", decoded.id);

    // 3. Find User in DB
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log("❌ User not found in Database with ID:", decoded.id);
      return res.status(401).json({ message: 'Token valid, but User does not exist in DB' });
    }

    console.log("✅ User found:", user.username || user.email);
    req.user = user;
    next();

  } catch (error) {
    console.log("❌ CRASH/REJECT:", error.message);
    res.status(401).json({ message: 'Token is not valid: ' + error.message });
  }
};

