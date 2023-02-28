import {Product} from "../models/product.js";
import {validationResult} from "express-validator";
import {errorHandle} from "./error.js";
import {deleteFile} from "../util/file.js";


export const getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
};

export const postAddProduct = async (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const errors = validationResult(req);

    try {
        if (!image) {
            return res.status(422).render('admin/edit-product', {
                pageTitle: 'Add Product',
                path: '/admin/add-product',
                editing: false,
                hasError: true,
                product: {
                    title: title,
                    price: price,
                    description: description
                },
                errorMessage: 'Attached file is not an image',
                validationErrors: []
            });
        }

        const imageUrl = image.path;

        if (!errors.isEmpty()) {
            return res.status(422).render('admin/edit-product', {
                pageTitle: 'Add Product',
                path: '/admin/add-product',
                editing: false,
                hasError: true,
                product: {
                    title: title,
                    imageUrl: imageUrl,
                    price: price,
                    description: description
                },
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array()
            });
        }

        const product = new Product({
            title: title,
            price: price,
            description: description,
            imageUrl: imageUrl,
            userId: req.user
        });
        await product.save()

        console.log('PRODUCT CREATED');
        res.redirect('/admin/products');
    } catch (e) {
        console.log(e);
        // errorHandle(e, next);
    }
};

export const getEditProduct = async (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }

    try {
        const prodId = req.params.productId;

        const product = await Product.findById(prodId)

        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product,
            hasError: false,
            errorMessage: null,
            validationErrors: []
        });
    } catch (e) {
        console.log(e);
        errorHandle(e, next);
    }
};

export const postEditProduct = async (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const image = req.file;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDescription,
                _id: prodId
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    try {
        const product = await Product.findById(prodId);

        if (String(product.userId) !== String(req.user._id)) {
            return await res.redirect('/');
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDescription;
        if (image) {
            deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
        // product.imageUrl = updatedImageUrl;

        await product.save();

        res.redirect('/admin/products');
        console.log("Product updated");
    } catch (e) {
        console.log(e);
        errorHandle(e, next);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const prodId = req.params.productId;

        const product = await Product.findById(prodId);

        if (!product) {
            return next(new Error('Product not found'));
        }
        deleteFile(product.imageUrl);

        await Product.deleteOne({_id: prodId, userId: req.user._id});

        console.log("Product deleted");
        res.status(200).json({message: 'Successfully deleted'});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'Deleting product failed'});
    }
};

export const getProducts = async (req, res, next) => {
    try {
        const products = await Product.find({userId: req.user._id});
        // .populate('userId');

        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products',

        });
    } catch (e) {
        console.log(e);
        errorHandle(e, next);
    }
};