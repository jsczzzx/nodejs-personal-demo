import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
  userName: String,
  mobile_no: String,
  email: String,
  address: String,
  password: String,
});

const User = model('user', userSchema);
export default User;