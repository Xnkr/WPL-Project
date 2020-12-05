import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    name: {type: String, required: true},
    qty: {type: Number, required: true},
    image: {type: String, required: true},
    price: {type: String, required: true},
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
});

const orderSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    orderItems: [orderItemSchema],
    totalPrice: {type: Number},
}, {
    timestamps: true
});

const orderModel = mongoose.model("Order", orderSchema);
export default orderModel;