import mongoose from "mongoose";

const mongoConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGOURL);
        console.log("MongoDB connected...")
    } catch (error) {
        console.error(error);
    }
}

export default mongoConnect;