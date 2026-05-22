const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error(
      "MONGO_URI is missing. Add it to backend/.env\n" +
        "  Local:  MONGO_URI=mongodb://127.0.0.1:27017/ai-learning-assistant\n" +
        "  Atlas:  use the connection string from MongoDB Atlas → Connect"
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`MongoDB Connected (${mongoose.connection.host})`);
  } catch (error) {
    console.error("\nMongoDB connection failed:");
    console.error(error.message);

    if (uri.includes("mongodb+srv://")) {
      console.error(`
Atlas SRV DNS failed (common on Windows / restricted networks). Try one of:

  1) LOCAL MongoDB (easiest for dev):
     docker run -d --name ai-mongo -p 27017:27017 mongo:7
     MONGO_URI=mongodb://127.0.0.1:27017/ai-learning-assistant

  2) Atlas STANDARD string (not mongodb+srv):
     Atlas → Connect → Drivers → copy "Standard connection string"
     Use that full mongodb://... URL in MONGO_URI

  3) Fix DNS: set PC DNS to 8.8.8.8 / 1.1.1.1, then retry
`);
    }

    process.exit(1);
  }
};

module.exports = connectDB;
