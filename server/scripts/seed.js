require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");
const Job = require("../models/Job");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await User.deleteMany();
    await Job.deleteMany();
    console.log("Cleared existing data.");

    // Create Workers
    const workers = await User.create([
      {
        name: "Ravi Kumar",
        email: "ravi@worker.com",
        password: "password123",
        role: "worker",
        phone: "9876543210",
        isVerified: true,
      },
      {
        name: "Anita Singh",
        email: "anita@worker.com",
        password: "password123",
        role: "worker",
        phone: "9876543211",
        isVerified: true,
      },
    ]);
    console.log("Seeded Workers.");

    // Create Clients
    const clients = await User.create([
      {
        name: "John Doe",
        email: "john@client.com",
        password: "password123",
        role: "client",
        phone: "9998887770",
      },
    ]);
    console.log("Seeded Clients.");

    // Create Jobs
    await Job.create([
      {
        userId: clients[0]._id,
        service: "Plumbing",
        description: "Fixing a leaky pipe in the kitchen sink.",
        status: "pending",
      },
      {
        userId: clients[0]._id,
        service: "Electrical",
        description: "Installing new ceiling fans in the living room.",
        status: "assigned",
        workerId: workers[0]._id,
        workerName: workers[0].name,
      },
      {
        userId: clients[0]._id,
        service: "Cleaning",
        description: "Deep cleaning for a 2BHK apartment.",
        status: "pending",
      },
    ]);
    console.log("Seeded Jobs.");

    console.log("\n✅ Database seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("💥 Seeding failed:", err);
    process.exit(1);
  }
};

seedData();
