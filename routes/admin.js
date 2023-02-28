import express from "express";

import {body} from "express-validator";


import {
    getProducts,
    getAddProduct,
    postAddProduct,
    deleteProduct,
    postEditProduct,
    getEditProduct
} from '../controllers/admin.js';
import {isAuth} from "../middleware/is-auth.js";

const adminRoutes = express.Router();


/*using the /admin/ path
can use the same path, because of different methods*/

// /admin/add-product get method
adminRoutes.get('/add-product', isAuth, getAddProduct);

// /admin/products
adminRoutes.get('/products', isAuth, getProducts);

//post method
adminRoutes.post('/add-product', [
        body('title')
            .isString()
            .isLength({min: 2})
            .trim(),
        body('price')
            .isFloat(),
        body('description')
            .isLength({max: 300})
            .trim(),
    ], isAuth, postAddProduct);

adminRoutes.get('/edit-product/:productId', isAuth, getEditProduct);

adminRoutes.post('/edit-product', [
    body('title')
        .isString()
        .isLength({min: 2})
        .trim(),
    body('price')
        .isFloat(),
    body('description')
        .isLength({max: 300})
        .trim(),
], isAuth, postEditProduct);

adminRoutes.delete('/product/:productId', isAuth, deleteProduct);

export default adminRoutes;