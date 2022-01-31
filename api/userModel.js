import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    googleId: String,
    imageUrl: String,
    email: String,
    name: String,
    givenName: String,
    familyName: String
});

const userModel = mongoose.model("user", userSchema);

export default userModel;