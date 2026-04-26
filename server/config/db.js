const mongoose = require("mongoose");

/**
 * Connect to MongoDB via Mongoose.
 * Retries once on initial failure, then exits the process.
 */
const connectDB = async (retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`✅  MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.error(
        `❌  MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`
      );
      if (attempt === retries) {
        console.error(
          "\n💡  Tip: Make sure MongoDB is running locally, or update MONGODB_URI in .env\n" +
            "    with your MongoDB Atlas connection string.\n"
        );
        process.exit(1);
      }
      // Wait 3 seconds before retrying
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
};

module.exports = connectDB;
