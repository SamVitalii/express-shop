import express from "express";

import shopController from "../controllers/shop.js";
import {isAuth} from "../middleware/is-auth.js";

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products',  shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteItem);

router.post('/cart', isAuth, shopController.postCart);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/checkout/success', shopController.getCheckoutSuccess);

router.get('/checkout/cancel', shopController.getCheckout);

// router.post('/create-order', isAuth, shopController.postOrders);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

router.get('/favorites', isAuth, shopController.getFavorites);

router.delete('/favorites/:productId', isAuth, shopController.favoriteDeleteItem);

router.post('/favorites', isAuth, shopController.postFavorites);


export default router;