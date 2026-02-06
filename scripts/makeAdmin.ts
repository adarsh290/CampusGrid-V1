import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const TARGET_EMAIL = "as0654224@gmail.com"; // <--- PUT YOUR EMAIL HERE

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB...");

    const user = await User.findOne({ email: TARGET_EMAIL });
    if (!user) {
        console.log("❌ User not found!");
        return;
    }

    user.role = "admin"; // <--- The Magic Switch
    await user.save();
    
    console.log(`🎉 SUCCESS! User ${user.username} is now an ADMIN.`);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.disconnect();
  }
};

run();