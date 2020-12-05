import express from 'express';
import User from '../models/userModel';
import {getToken, isAuth} from '../util';
import mongoose from 'mongoose';
import Order from "../models/orderModel";

const bcrypt = require('bcrypt');

const router = express.Router();
const saltRounds = 10;

router.put('/:id', isAuth, async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        let hashedPassword;
        if (req.body.password) {
            hashedPassword = await new Promise((resolve, reject) => {
                bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
                    if (err) reject(err);
                    resolve(hash)
                });
            });
        }
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.password = hashedPassword || user.password;
            const updatedUser = await user.save();
            res.send({
                _id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                token: getToken(updatedUser),
            });
        } else {
            res.status(404).send({message: 'User Not Found'});
        }
    } catch (e) {
        console.log("Caught exception", e);
        res.status(500).send({message: "Server error occurred"})
    }
});

router.post('/signin', async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            res.status(401).send({message: 'Invalid Email or Password.'});
        }
        const dbUser = await User.findOne({
            email: req.body.email
        });
        if (dbUser) {
            const isValidPassword = await new Promise((resolve, reject) => {
                bcrypt.compare(req.body.password, dbUser.password, function (err, res) {
                    if (err) reject(err);
                    resolve(res)
                });
            });
            if (isValidPassword) {
                res.send({
                    _id: dbUser.id,
                    name: dbUser.name,
                    email: dbUser.email,
                    isAdmin: dbUser.isAdmin,
                    token: getToken(dbUser),
                });
            }

        }
        res.status(401).send({message: 'Invalid Email or Password.'});

    } catch (e) {
        console.log("Caught exception", e);
        res.status(500).send({message: "Server error occurred"})
    }
});

router.post('/register', async (req, res) => {
    const passwordPlain = req.body.password;
    let user = new User({
        name: req.body.name,
        email: req.body.email
    });

    try {
        user.password = await new Promise((resolve, reject) => {
            bcrypt.hash(passwordPlain, saltRounds, function (err, hash) {
                if (err) reject(err);
                resolve(hash)
            });
        });
        const newUser = await user.save();
        if (newUser) {
            res.send({
                _id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                isAdmin: newUser.isAdmin,
                password: newUser.password,
                token: getToken(newUser),
            });
        } else {
            res.status(400).send({message: 'Invalid User Data.'});
        }
    } catch (e) {
        console.log('Catch an error: ', e);
        if (e instanceof mongoose.Error.ValidationError) {
            res.status(400).send({message: 'Invalid Fields: ' + Object.keys(e.errors)});
        } else {
            res.status(400).send({message: 'Invalid User Data.'});
        }

    }
});

router.get('/usercheck', async function (req, res) {
    const user = await User.findOne({
        email: req.body.email,
    });
    if (user) {
        res.status(200).send({message: 'Email ID already exists'})
    } else {
        res.status(204).send()
    }
});

router.get('/makeadmin', async (req, res) => {
    const user = new User({
        name: 'Admin',
        email: 'admin@admin.com',
        password: 'admin',
        isAdmin: true,
    });
    try {
        const newUser = await user.save();
        res.send(newUser);
    } catch (error) {
        res.send({message: error.message, user: user});
    }
});

router.get("/orders", isAuth, async (req, res) => {
    const orders = await Order.find({user: req.user._id});
    res.send(orders);
});

export default router;
