import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Game from '../models/Game.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to DB...");

    // 1. Find the Test Game
    const game = await Game.findOne(); 
    if (!game) throw new Error("No games found! Run seed.js first.");
    console.log(`Found Game: ${game.title} (${game._id})`);

    // 2. Create/Update a Test User
    const email = "student@iitrpr.ac.in";
    let user = await User.findOne({ email });
    
    if (!user) {
        user = await User.create({
            username: "Test Student",
            email: email,
            password: "hashedpassword123", // Dummy password
            role: "user",
            library: []
        });
        console.log("Created new user.");
    }

    // 3. Give the user the game (Simulate Purchase)
    if (!user.library.includes(game._id as any)) {
        user.library.push(game._id as any);
        await user.save();
        console.log("✅ Added game to user library.");
    } else {
        console.log("User already owns this game.");
    }

    // 4. Generate the Auth Token (The Master Key)
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '30d' }
    );

    console.log("\nCopy this Token 👇");
    console.log("---------------------------------------------------");
    console.log(token);
    console.log("---------------------------------------------------");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.disconnect();
  }
};

run();