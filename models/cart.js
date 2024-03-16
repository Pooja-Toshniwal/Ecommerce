const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const  Cart=sequelize.define('cart',{
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        allowNull:false,
        autoIncrement:true
    }
});
module.exports=Cart;
// const path = require('path');
// const fs = require('fs');
// const { fileLoader } = require('ejs');
// const p = path.join(path.dirname(require.main.filename), 'data', 'cart.json');

// module.exports = class Cart {
//     static addProduct(id, productPrice) {
//         //         // Fetch the previos cart
//         fs.readFile(p, (err, fileContent) => {
//             let cart = { products: [], totalprice: 0 };
//             if (!err) {
//                 cart = JSON.parse(fileContent);
//             }
//             // Analyze the cart (if exists)
//             const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
//             const existingProduct = cart.products[existingProductIndex];
//             let updatedProduct;
//             //             // Add new product/increase quantity
//             if (existingProduct) {
//                 updatedProduct = { ...existingProduct };
//                 updatedProduct.qty = updatedProduct.qty + 1;
//                 cart.products = [...cart.products];
//                 cart.products[existingProductIndex] = updatedProduct;
//             }
//             else {
//                 updatedProduct = { id: id, qty: 1 };
//                 cart.products = [...cart.products];
//                 cart.products.push(updatedProduct);
//             }
//             cart.totalprice = cart.totalprice + +productPrice;

//             fs.writeFile(p, JSON.stringify(cart), err => {
//                 console.log(err);
//             })
//         })
//     }

//     static deleteProduct(id) {
//         fs.readFile(p, (err, fileContent) => {
//             if (!err) {
//                 const cart = JSON.parse(fileContent);
//                 const updatedCart = { ...cart };
//                 const product = updatedCart.products.find(prod => prod.id === id);
//                 if(!product){
//                     return;
//                 }
//                 const productQty = product.qty;
//                 const productPrice = product.price;
//                 updatedCart.products = updatedCart.products.filter(prod => prod.id != id);
//                 updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;
//                 fs.writeFile(p, JSON.stringify(updatedCart), err => {
//                     console.log(err);
//                 });
//             }
//         });
//     }

//     static getCart(cb) {
//         fs.readFile(p, (err, fileContent) => {
//             const cart = JSON.parse(fileContent);
//             if (err) {
//                 cb(null);
//             }
//             else {
//                 cb(cart);
//             }
//         });
//     }


// }


