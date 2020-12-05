import express from 'express';
import Product from '../models/productModel';
import {isAdmin, isAuth} from '../util';

const router = express.Router();


router.get('/categories', async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.status(200).send(categories);
});

router.get('/count', async (req, res) => {
    const category = req.query.category ? {category: req.query.category} : {};
    const searchKeyword = req.query.searchKeyword
        ? {
            name: {
                $regex: req.query.searchKeyword,
                $options: 'i',
            },
        }
        : {};
    const count = await Product.countDocuments({...category, ...searchKeyword, disabled: false});
    res.status(200).send({count: count});
});

router.get('/', async (req, res) => {
    const page = req.query.page - 1 || 0;
    const limit = req.query.limit - 0 || 10;
    const category = req.query.category ? {category: req.query.category} : {};
    const searchKeyword = req.query.searchKeyword
        ? {
            name: {
                $regex: req.query.searchKeyword,
                $options: 'i',
            },
        }
        : {};
    const sortOrder = req.query.sortOrder
        ? req.query.sortOrder === 'lowest'
            ? {price: 1}
            : {price: -1}
        : {name: 1};
    const products = await Product.find({...category, ...searchKeyword, disabled: false}).sort(
        sortOrder
    ).skip(page * limit).limit(limit);
    res.send(products);
});

router.get('/:id', async (req, res) => {
    const product = await Product.findOne({_id: req.params.id});
    if (product) {
        res.send(product);
    } else {
        res.status(404).send({message: 'Product Not Found.'});
    }
});

router.put('/:id', isAuth, isAdmin, async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
        product.name = req.body.name || product.name;
        product.price = req.body.price || product.price;
        product.image = req.body.image || product.image;
        product.category = req.body.category || product.category;
        product.itemStock = req.body.itemStock || product.itemStock;
        product.description = req.body.description || product.description;
        const updatedProduct = await product.save();
        if (updatedProduct) {
            return res
                .status(200)
                .send({message: 'Product Updated', data: updatedProduct});
        }
    }
    return res.status(500).send({message: ' Error in Updating Product.'});
});

router.delete('/:id', isAuth, isAdmin, async (req, res) => {
    const deletedProduct = await Product.findById(req.params.id);
    if (deletedProduct) {
        deletedProduct.disabled = true;
        const updatedProduct = await deletedProduct.save();
        if (updatedProduct) {
            return res.status(204).send();
        } else {
            res.send('Error in Deletion.');
        }
    } else {
        res.send('Error in Deletion.');
    }
});

router.post('/', isAuth, isAdmin, async (req, res) => {
    const product = new Product({
        name: req.body.name,
        price: req.body.price,
        image: req.body.image,
        category: req.body.category,
        itemStock: req.body.itemStock,
        description: req.body.description,
    });
    const newProduct = await product.save();
    if (newProduct) {
        return res
            .status(201)
            .send({message: 'Product Added', data: newProduct});
    }
    return res.status(500).send({message: ' Error in Adding Product.'});
});

export default router;
