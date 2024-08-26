import mongoose from 'mongoose';
const { Schema, model } = mongoose;
import dishSchema from './Dish.js';

const orderSchema = new Schema({
    userId: String,
    userName: String,
    restaurantId: String,
    restaurantName: String,
    items: OrderItem[],
    totalPrice: Number,
    createdAt: Date,
    updatedAt: Date,
    status: 'Pending' | 'Confirmed' | 'Delivered'
});

const orderItem = new Schema({
    dish: dishSchema,
    quantity: Number
})

const Order = model('order', orderSchema);
export default Order;
