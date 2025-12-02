import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Game from './models/Game.js';

dotenv.config();

// --- CONFIGURATION ---
// TYPE THE EMAIL YOU JUST REGISTERED BELOW:
const TARGET_EMAIL = "as0654224@gmail.com"; // <--- CHANGE THIS if you used a different email
// ---------------------

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB...");

    // 1. Find the User
    const user = await User.findOne({ email: TARGET_EMAIL });
    if (!user) {
        console.log(`❌ User with email '${TARGET_EMAIL}' not found!`);
        return;
    }
    console.log(`✅ Found User: ${user.username}`);

    // 2. Find the Game (The Test Game)
    const game = await Game.findOne(); 
    if (!game) {
        console.log("❌ No games found in DB.");
        return;
    }

    // 3. Add Game to Library
    // Check if they already own it to avoid duplicates
    if (user.library.includes(game._id)) {
        console.log("⚠️ This user already owns this game.");
    } else {
        user.library.push(game._id);
        await user.save();
        console.log(`🎉 SUCCESS! Added '${game.title}' to ${user.username}'s library.`);
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.disconnect();
  }
};

run();