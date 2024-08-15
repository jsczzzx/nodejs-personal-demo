import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
  first_name: String,
  last_name: String,
  mobile_no: String,
  email: String,
  password: String,
});

const User = model('user', userSchema);
export default User;