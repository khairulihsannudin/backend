//make user model
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  email: String,
  phone: String,
  gender: String,
  verified: Boolean,
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
});



const User = mongoose.model('User', userSchema);

export default User;