import mongoose from 'mongoose';
const { Schema, model } = mongoose;
import dishSchema from './Dish.js';

const restaurantSchema = new Schema({
  name: String,
  telephone: String,
  address: String,
  dishes: [dishSchema],
});

const Restaurant = model('restaurant', restaurantSchema);
export default Restaurant;