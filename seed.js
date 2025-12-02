import mongoose from 'mongoose';
import dotenv from 'dotenv';
// IMPORTANT: In this mode, we MUST add the .js extension to imports
import Game from './models/Game.js'; 

dotenv.config();

const run = async () => {
  try {
    // 1. Connect to Database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to Database");

    // 2. Clear old data
    await Game.deleteMany({});

    // 3. Create the Test Game
    const newGame = await Game.create({
      title: "Test Text File",
      description: "A small file to test the download engine.",
      price: 0,
      genre: "Debug",
      coverImage: "https://placehold.co/600x400",
      localFilePath: "test.txt" // This must match the file inside D:/CampusGames/
    });

    console.log("✅ Game Added to Menu!");
    console.log("🆔 Game ID:", newGame._id.toString());

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.disconnect();
  }
};

run();