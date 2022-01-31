import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    name: String,
    message: String,
    timestamp: String,
    sender: String,
    channelId: String
});

const messageModel = mongoose.model("message", messageSchema);

export default messageModel;