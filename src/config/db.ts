import mongoose from "mongoose";

const connectDB = async(): Promise<void> => {

    try {
        const mongoURL = process.env.DB_URL; 
        if(!mongoURL) {
            throw new Error("MONGO_URI is not defined")
        }

        await mongoose.connect(mongoURL)
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error)
        process.exit(1)
    }
}

export default connectDB