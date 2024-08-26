import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const dishSchema = new Schema({
  name: String,
  price: Number
});

export default dishSchema;