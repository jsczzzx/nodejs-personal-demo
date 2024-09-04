import mongoose from 'mongoose';
const { Schema, model } = mongoose;
import dishSchema from './Dish.js';

const restaurantSchema = new mongoose.Schema({
  name: String,
  telephone: String,
  address: String,
  coordinates: {
    type: [Number], // [longitude, latitude]
    index: '2dsphere' // Ensure the 2dsphere index is created
  },
  type: [String],
  dishes: [dishSchema]
});

const Restaurant = model('restaurant', restaurantSchema);
export default Restaurant;