import mongoose from "mongoose";

const channelSchema = mongoose.Schema({
    channelName: String,
    user_0: Object,
    user_1: Object
});

const channelModel = mongoose.model("channel", channelSchema);

export default channelModel;