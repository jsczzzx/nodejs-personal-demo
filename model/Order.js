import mongoose from 'mongoose';
const { Schema, model } = mongoose;
import dishSchema from './Dish.js';

const orderItemSchema = new Schema({
    dish: dishSchema,
    quantity: Number
});

const orderSchema = new Schema({
    userId: String,
    userName: String,
    restaurantId: String,
    restaurantName: String,
    items: [orderItemSchema],
    totalPrice: Number,
    createdAt: Date,
    updatedAt: Date,
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Delivered'],  // Ensure it's a single string with one of these values
        default: 'Pending'  // Set the default value to 'Pending'
    }
});



const Order = model('order', orderSchema);
export default Order;
