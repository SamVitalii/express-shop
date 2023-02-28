import {createWriteStream} from "fs";
import PDFDocument from "pdfkit";
import path from "path";
import Stripe from "stripe";

const stripe = Stripe(process.env.STRIPE_KEY);

import {Product} from "../models/product.js";
import {Order} from "../models/order.js";
import {errorHandle} from "./error.js";

const ITEMS_PER_PAGE = 3;

export default class ShopController {
    static async getProducts(req, res, next) {
        try {
            const page = +req.query.page || 1;

            const productsAmount = await Product.find().countDocuments();

            const products = await Product
                .find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
            res.render('shop/product-list', {
                products,
                pageTitle: 'Products',
                path: '/products',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < productsAmount,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(productsAmount / ITEMS_PER_PAGE)
            });
        } catch (e) {
            console.log(e);
            errorHandle(e, next);
        }
    }

    static async getProduct(req, res, next) {
        try {
            const prodId = req.params.productId;

            const product = await Product.findById(prodId);

            res.render('shop/product-detail', {
                product: product,
                pageTitle: 'Product details: ' + product.title,
                path: '/products',

            });
        } catch (e) {
            console.log(e);
            errorHandle(e, next);
        }
    };

    static async getIndex(req, res, next) {
        try {
            const page = +req.query.page || 1;

            const productsAmount = await Product.find().countDocuments();

            const products = await Product
                .find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
            res.render('shop/index', {
                products,
                pageTitle: 'Our Shop',
                path: '/',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < productsAmount,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(productsAmount / ITEMS_PER_PAGE)
            });
        } catch (e) {
            console.log(e);
            errorHandle(e, next);
        }
    }

    static async postFavorites(req, res, next) {
        try {
            const prodId = req.body.productId;

            const product = await Product.findById(prodId);
            await req.user.addFavorites(product);

            console.log('Product added to Favorites');

            res.redirect('/favorites');
        } catch (e) {
            console.log(e);
            errorHandle(e, next);
        }
    }


    static async getFavorites(req, res, next) {
        try {
            const user = await req.user.populate('favorites.items.productId');
            const products = user.favorites.items;

            res.render('shop/favorites', {
                path: '/favorite',
                pageTitle: 'Your favorites',
                hasError: false,
                errorMessage: null,
                validationErrors: [],
                products
            });
        } catch (e) {
            errorHandle(e, next);
            console.log(e);
        }
    }

    static async favoriteDeleteItem(req, res) {
        try {
            const prodId = req.params.productId;

            await req.user.deleteFavoriteItem(prodId);

            console.log("Product deleted from favorites");
            res.status(200).json({message: 'Successfully deleted from favorites'});
        } catch (e) {
            res.status(500).json({message: 'Failed to delete from favorites'});
            console.log(e);
        }
    }

    static async getCart(req, res, next) {
        try {
            const user = await req.user.populate('cart.items.productId');
            const products = user.cart.items;

            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                hasError: false,
                errorMessage: null,
                validationErrors: [],
                products
            });
        } catch (e) {
            console.log(e);
            errorHandle(e, next);
        }
    }

    static async postCart(req, res, next) {
        try {
            const prodId = req.body.productId;

            const product = await Product.findById(prodId);
            await req.user.addToCart(product);

            console.log('Product added to Cart');
            res.redirect('/cart');
        } catch (e) {
            console.log(e);
            errorHandle(e, next);
        }
    }

    static async postCartDeleteItem(req, res, next) {
        try {
            const prodId = req.body.productId;

            await req.user.deleteCartItem(prodId);
            console.log('Item deleted from cart');

            res.redirect('/cart');
        } catch (e) {
            console.log(e);
            // errorHandle(e, next);
        }
    }

    static async getCheckout(req, res, next) {
        try {
            const user = await req.user.populate('cart.items.productId');
            const products = user.cart.items;


            let totalSum = 0;
            products.forEach(prod => {
                totalSum += prod.quantity * prod.productId.price;
            })

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: products.map(p => ({
                        price_data: {
                            product_data: {
                                id: p.productId._id,
                                name: p.productId.title,
                                description: p.productId.description,
                            },
                            unit_amount: p.productId.price * 100,
                            currency: 'usd',
                        },
                        quantity: p.quantity
                    })
                ),
                mode: 'payment',
                success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
                cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`
            });

            res.render('shop/checkout', {
                path: '/checkout',
                pageTitle: 'Checkout',
                products,
                totalSum,
                sessionId: session.id
            });
        } catch (e) {
            console.log(e);
            errorHandle(e, next);
        }
    }

    static async getCheckoutSuccess(req, res, next) {
        try {
            const user = await req.user.populate('cart.items.productId');
            const products = user.cart.items
                .map(item => {
                    return {quantity: item.quantity, product: {...item.productId /*._doc*/}};
                });

            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: products
            })

            await order.save();

            await req.user.clearCart();

            console.log('Ordered')
            res.redirect('/orders')
        } catch (e) {
            console.log(e);
            errorHandle(e, next);
        }

    }

    static async getOrders(req, res, next) {
        try {
            const orders = await Order.find({'user.userId': req.user._id});

            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders
            });
        } catch (e) {
            console.log(e);
            errorHandle(e, next);
        }
    }

    static async getInvoice(req, res, next) {
        try {
            const orderId = req.params.orderId;

            const order = await Order.findById(orderId);

            if (!order) {
                return next(new Error('No order find'));
            }
            if (String(order.user.userId) !== String(req.user._id)) {
                return next(new Error('Unauthorised'));
            }

            const invoiceName = `invoice-${orderId}.pdf`;
            const invoicePath = path.join('data', 'invoices', invoiceName);

            const pdfDoc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
            pdfDoc.pipe(createWriteStream(invoicePath));
            pdfDoc.pipe(res);

            const l = 5.99;

            pdfDoc.fontSize(18).text(`Invoice for Order - #${orderId}`, {bold: true});
            pdfDoc.text('-----------------------------------------------------------------');

            let totalPrice = 0;
            order.products.forEach(prod => {
                totalPrice += prod.quantity * prod.product.price;
                pdfDoc.text(`${prod.product.title} - $${prod.product.price} x ${prod.quantity}`);
            })
            pdfDoc.text(`-----------------------------------------------------------------\nTotal: $${totalPrice}`);

            pdfDoc.end();

            // const file = createReadStream(invoicePath);
            // res.setHeader('Content-Type', 'application/pdf');
            // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
            // file.pipe(res);

            // readFile(invoicePath, (err, data) => {
            //     if (err) {
            //         return next(err);
            //     }
            //     res.setHeader('Content-Type', 'application/pdf');
            //     res.setHeader(`Content-Disposition', 'inline; filename="${invoiceName}"`);
            //     //TODO doesn't work inline, just downloading
            //     res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
            //     res.send(data);
            // });
        } catch (e) {
            console.log(e);
            errorHandle(e, next);
        }
    }
}
