import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User, { IUser } from '../models/User.js';

interface AuthTokenPayload extends JwtPayload {
  id: string;
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("\n🕵️ SECURITY CHECK INITIATED...");
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log("❌ No token found in header!");
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    console.log("🔑 Token received (first 10 chars):", token.substring(0, 10) + "...");

    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    console.log("🔐 Verifying with Secret:", secret);

    const decoded = jwt.verify(token, secret) as AuthTokenPayload;
    console.log("✅ Signature Verified. User ID inside token:", decoded.id);

    const user: IUser | null = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log("❌ User not found in Database with ID:", decoded.id);
      return res.status(401).json({ message: 'Token valid, but User does not exist in DB' });
    }

    console.log("✅ User found:", user.username || user.email);
    req.user = user;
    next();

  } catch (error: any) {
    console.log("❌ CRASH/REJECT:", error.message);
    res.status(401).json({ message: 'Token is not valid: ' + error.message });
  }
};
