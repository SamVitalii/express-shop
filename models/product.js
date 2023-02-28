import mongoose from "mongoose";

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

export const Product = mongoose.model('Product', productSchema)


// // import {getDb} from "../util/db.js";
// // import {ObjectId} from "mongodb";
// //
// // export class Product {
// //     constructor(title, price, description, imageUrl, id, userId) {
// //         this.title = title;
// //         this.price = price;
// //         this.description = description;
// //         this.imageUrl = imageUrl;
// //         this._id = id ? new ObjectId(id) : null;
// //         this.userId = userId;
// //     }
// //
// //
// //     save() {
// //         const db = getDb();
// //         let dbOperation;
// //         if (this._id) {
// //             // Update the product
// //             dbOperation = db
// //                 .collection('products')
// //                 .updateOne({_id: this._id}, {$set: this});
// //         } else {
// //             dbOperation = db.collection('products').insertOne(this);
// //         }
// //         return dbOperation
// //             .then(result => {
// //                 console.log(result);
// //             })
// //             .catch(err => {
// //                 console.log(err);
// //             });
// //     }
// //
// //
// //     static fetchAll() {
// //         try {
// //             const db = getDb();
// //             return db.collection('products')
// //                 .find()
// //                 .toArray();
// //         } catch (e) {
// //             console.log(e);
// //         }
// //     }
// //
// //     static findById(prodId) {
// //         try {
// //             const db = getDb();
// //             return db
// //                 .collection('products')
// //                 .find({_id: new ObjectId(prodId)})
// //                 .next();
// //         } catch (e) {
// //             console.log(e)
// //         }
// //     }
// //
// //     static async deleteById(prodID) {
// //         try {
// //             const db = getDb()
// //             return db
// //                 .collection('products').deleteOne({_id: new ObjectId(prodID)});
// //         } catch (e) {
// //             console.log(e)
// //         }
// //     }
// // }
