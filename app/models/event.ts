import mongoose from "mongoose"
const eventSchema = new mongoose.Schema({
    title: String,
    description: String,
    date: Date,
    maxParticipants: Number,
    numberOfParticipants: Number,
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    })
const Event = mongoose.model('Event', eventSchema);

export default Event;