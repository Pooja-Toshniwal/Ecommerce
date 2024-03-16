const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiry: Date,
    cart: {
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true }
            }
        ]
    }
});
UserSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex((cp) => {
        return cp.productId.toString() == product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    }
    else {
        updatedCartItems.push({ productId: product._id, quantity: 1 });
    }
    const updatedCart = { items: updatedCartItems };
    this.cart = updatedCart;
    return this.save();

};

UserSchema.methods.deleteFromCart = function (productId) {
    const updatedCartItems = this.cart.items.filter((item) => {
        return item.productId.toString() != productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();

}

UserSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
}
module.exports = mongoose.model('User', UserSchema);





// mongodb
// const getDb = require('../util/database').getDb;
// const mongodb = require('mongodb');
// const { ObjectId } = require('bson');
// class User {
//     constructor(username, email, cart, id) {
//         this.username = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = id;
//     }
//     save() {
//         const db = getDb();
//         return db.collection('users').insertOne(this).then().catch(err => console.log(err));
//     }
//     addToCart(product) {
//         const db = getDb();
//         // if (this.cart) { This if else block doesnot work we always go in the else block reason-dontknow
//         const cartProductIndex = this.cart.items.findIndex((cp) => {
//             return cp.productId.toString() == product._id.toString();
//         });
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];
//         if (cartProductIndex >= 0) {
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         }
//         else {
//             updatedCartItems.push({ productId: new ObjectId(product._id), quantity: 1 });
//         }
//         const updatedCart = { items: updatedCartItems };
//         return db.collection('users').updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: updatedCart } });
//         // }
//         //     else{
//         //     const updatedCart = {
//         //         items: [{ productId: new ObjectId(product._id), quantity: 1 }]
//         //     }
//         //     return db.collection('users').updateOne({ _id: new Object(this._id)},{ $set: { cart: updatedCart } }).then().catch();
//         // }
//     }

//     getCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map((item) => {
//             return item.productId;
//         });
//         return db.collection('products').find({ _id: { $in: productIds } }).toArray().then((products) => {
//             return products.map(product => {
//                 return {
//                     ...product, quantity: this.cart.items.find(item => {
//                         return item.productId.toString() == product._id.toString();
//                     }).quantity
//                 }
//             })
//         }).catch(err => console.log(err));
//     }

//     deleteItemFromCart(productId) {
//         const db = getDb();
//         const updatedCartItems = this.cart.items.filter((item) => {
//             return item.productId.toString() != productId.toString();
//         });
//         return db.collection('users').updateOne({ _id: new Object(this._id) }, { $set: { cart: { items: updatedCartItems } } })
//             .then().catch(err => console.log(err));
//     }
//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users').findOne({ _id: new ObjectId(userId) }).then(user => user).catch(err => console.log(err));
//     }

//     addOrder() {
//         const db = getDb();
//         return this.getCart().then((products) => {
//             const order = {
//                 items: products,
//                 user: {
//                     _id: new ObjectId(this._id),
//                     username: this.username
//                 }
//             };
//             db.collection('orders').insertOne(order).then(() => {
//                 this.cart = { items: [] };
//                 db.collection('users').updateOne({ _id: new Object(this._id) }, { $set: { cart: { items: [] } } })
//                     .then().catch(err => console.log(err));
//             }).catch(err => console.log(err));
//         }).catch(err => console.log(err));

//     }

//     getOrders() {
//         const db = getDb();
//         return db.collection('orders').find({ 'user._id': new ObjectId(this._id) }).toArray().then().catch(err => console.log(err));
//     }
// }
// module.exports = User;




// const Sequelize = require('sequelize');
// const sequelize = require('../util/database');
// const User = sequelize.define('user', {
//     id: {
//         type: Sequelize.INTEGER,
//         primaryKey: true,
//         allowNULL: false,
//         autoIncrement: true
//     },
//     name: {
//         type: Sequelize.STRING,
//         allowNULL: false

//     },
//     email: {
//         type: Sequelize.STRING,
//         allowNULL: false
//     }
// });

// module.exports=User;