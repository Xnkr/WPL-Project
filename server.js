import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import config from './config';
import userRoute from './routes/userRoute';
import productRoute from './routes/productRoute';
import orderRoute from './routes/orderRoute';
import uploadRoute from './routes/uploadRoute';

const morgan = require('morgan');

const mongodbUrl = config.MONGODB_URL;
mongoose
    .connect(mongodbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    .catch((error) => console.log(error.reason));

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/api/uploads', uploadRoute);
app.use('/api/users', userRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.get('*', (req, res) => {
    res.send({message: 'My Bistro API'});
});

app.listen(config.PORT, () => {
    console.log('Server started at http://localhost:' + config.PORT);
});
