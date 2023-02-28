import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    },
    favorites: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
        }]
    }
});


userSchema.methods.clearCart = function () {
    this.cart = {items: []};
    this.save();
}

userSchema.methods.addToCart = async function (product) {
    const cartProductIndex = this.cart.items.findIndex(cp => String(cp.productId) === String(product._id));
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity
        });
    }
    this.cart = {
        items: updatedCartItems
    };

    this.save();
}

userSchema.methods.addFavorites = function (product) {
    const favorites = [...this.favorites.items];

    favorites.push({
        productId: product._id
    });

    this.favorites = {
        items: favorites
    }

    this.save();
}

userSchema.methods.deleteFavoriteItem = function (productId) {
    console.log(this.favorites.items)
    this.favorites.items = this.favorites.items.filter(item => item._id.toString() !== productId.toString());

    this.save();
}

userSchema.methods.deleteCartItem = function (productId) {
    this.cart.items = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString();
    });

    this.save();
}

export const User = mongoose.model('User', userSchema);


// import {getDb} from "../util/db.js";
// import {ObjectId} from "mongodb";
//
// export class User {
//     constructor(username, email, cart, id) {
//         this.name = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = id;
//     }
//
//     save() {
//         const db = getDb();
//         db.collection('users')
//             .insertOne(this)
//             .then(user => console.log(user))
//             .catch(e => console.log(e));
//     }
//
//     async getCart() {
//         try {
//             const db = getDb();
//             const productsIds = this.cart.items.map(i => i.productId);
//             const products = await db
//                 .collection('products')
//                 .find({_id: {$in: productsIds}})
//                 .toArray();
//
//             return products.map(p => {
//                 return {
//                     ...p, quantity: this.cart.items.find(i => {
//                         return i.productId.toString() === p._id.toString();
//                     }).quantity
//                 };
//             });
//         } catch (e) {
//             console.log(e);
//         }
//     }
//
//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === product._id.toString();
//         });
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items]
//
//         if (cartProductIndex >= 0) {
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         } else {
//             updatedCartItems.push({
//                 productId: new ObjectId(product._id),
//                 quantity: newQuantity
//             });
//         }
//
//         const updatedCart = {
//             items: updatedCartItems
//         };
//         const db = getDb();
//         return db.collection('users').updateOne(
//             {_id:  new ObjectId(this._id)},
//             {$set: {cart: updatedCart}}
//         );
//     }
//
//     deleteCartItem(productId) {
//         const updatedCartItems = this.cart.items.filter(item => {
//             return item.productId.toString() !== productId.toString();
//         });
//         const db = getDb();
//         db.collection('users')
//             .updateOne(
//                 {_id: new ObjectId(this._id)},
//                 {$set: { cart: {items: updatedCartItems}}}
//             );
//     }
//
//     async addOrder() {
//         try {
//             const db = getDb();
//
//             const products = await this.getCart();
//
//             const order = {
//                 items: products,
//                 user: {
//                     _id: new ObjectId(this._id),
//                     name: this.name,
//                 }
//             }
//
//             await db
//                 .collection('orders')
//                 .insertOne(order);
//
//             this.cart = { items: {}};
//             db.collection('users')
//                 .updateOne(
//                     {_id: new ObjectId(this._id)},
//                     {$set: { cart: {items: []}}}
//                 );
//         } catch (e) {
//             console.log(e);
//         }
//
//     }
//
//     getOrders() {
//         const db = getDb();
//         return db
//             .collection('orders')
//             .find({'user._id': new ObjectId(this._id) })
//
//     }
//
//
//     static async findById(userId) {
//         const db = getDb();
//
//         try {
//             const user = db
//                 .collection('users')
//                 .findOne({_id: new ObjectId(userId)});
//
//             return await user;
//         } catch (e) {
//             console.log(e);
//         }
//     }
// }