import mongoose from 'mongoose';

const prodctSchema = new mongoose.Schema({
    name: {type: String, required: true},
    image: {type: String, required: true},
    price: {type: Number, default: 0, required: true},
    category: {type: String, required: true},
    itemStock: {type: Number, default: 0, required: true},
    description: {type: String, required: true},
    disabled: {type: Boolean, default: false, required: true}
});

const productModel = mongoose.model('Product', prodctSchema);

export default productModel;
