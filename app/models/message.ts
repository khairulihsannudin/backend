import mongoose from "mongoose";

// Define Mongoose Schema
const messageSchema = new mongoose.Schema({
    name: String,
    messages: String,
  });
const Message = mongoose.model('Message', messageSchema);

export default Message;
