import express from 'express';
import Order from '../models/orderModel';
import Product from '../models/productModel';
import {isAuth} from '../util';

const router = express.Router();

router.get("/", isAuth, async (req, res) => {
    const orders = await Order.find({}).populate('user');
    res.send(orders);
});

router.get("/:id", isAuth, async (req, res) => {
    const order = await Order.findOne({_id: req.params.id});
    if (order) {
        res.send(order);
    } else {
        res.status(404).send("Order Not Found.")
    }
});

router.post("/", isAuth, async (req, res) => {
    const orderItems = req.body.orderItems;

    async function updateInventory(orderItem) {
        const productId = orderItem.product;
        const product = await Product.findOne({_id: productId});
        const newStock = product.itemStock - orderItem.qty;
        product.itemStock = newStock < 0 ? 0 : newStock;
        const updatedProduct = await product.save();
        console.log("Product updated", productId)
    }

    orderItems.map((orderItem, idx) => {
        updateInventory(orderItem);
    });
    const newOrder = new Order({
        orderItems: orderItems,
        user: req.user._id,
        totalPrice: req.body.totalPrice,
    });
    const newOrderCreated = await newOrder.save();
    res.status(201).send({message: "Order Placed", data: newOrderCreated});
});


export default router;