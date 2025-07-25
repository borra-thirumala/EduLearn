import mongoose from "mongoose";

const connectDB = async () => {
    try {
         console.log("db.js: Attempting to connect to MongoDB using URI:", process.env.MONGO_URI ? "URI provided" : "MONGO_URI is missing or empty in .env");
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
         console.error("db.js: MongoDB connection error:", error.message);
        console.error("db.js: Full error object:", error);
        
    }
}
export default connectDB;