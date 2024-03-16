const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProductSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  imageUrl: {
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
  userId:{
    type:Schema.Types.ObjectId,ref:'User'
  }
});
module.exports=mongoose.model('Product',ProductSchema);
// mongodb without mongoose
// const mongodb = require('mongodb');
// const { ObjectId } = require('bson');
// const getDb = require('../util/database').getDb;
// class Product {
//   constructor(title, imageUrl, description, price,userId) {
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.description = description;
//     this.price = price;
//     this.userId=userId;
//   }
//   save() {
//     const db = getDb();
//     return db.collection('products').insertOne(this).then((res) => console.log(res)).catch(err => console.log(err));
//   }
//   static fetchAll() {
//     const db = getDb();
//     return db.collection('products').find().toArray().then((products) => { return products }).catch(err => console.log(err));
//   }
//   static findById(prodId) {
//     const db = getDb();
//     return db.collection('products').find({ _id: new ObjectId(prodId) }).next().then((product) => { return product }).catch(err => console.log(err));
//   }
//   static changeById(prodId, newTitle, newImageUrl, newDescription, newPrice) {
//     const db = getDb();
//     return db.collection('products').updateOne({
//       _id: new ObjectId(prodId)
//     }, { $set: { title: newTitle, price: newPrice, descripton: newDescription, imageUrl: newImageUrl } }
//     ).then((product) => product).catch(err => console.log(err));
//   }
//   static deleteById(prodId) {
//     const db=getDb();
//     return db.collection('products').deleteOne({ _id: new ObjectId(prodId) }).then(()=>{
//     }).catch(err => console.log(err));
//   }
// }
// module.exports = Product;


// using sequelize

// const Sequelize = require('sequelize');

// const sequelize = require('../util/database');

// const Product = sequelize.define('product', {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true
//   },
//   title: Sequelize.STRING,
//   price: {
//     type: Sequelize.DOUBLE,
//     allowNull: false
//   },
//   imageUrl: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   description: {
//     type: Sequelize.STRING,
//     allowNull: false
//   }
// });

// module.exports = Product;
// using mysql:
// const Cart = require('./Cart');
// const db = require('../util/database');
// module.exports = class Product {
//     constructor(id, title, imageUrl, description, price) {
//         this.id = id;
//         this.title = title;
//         this.imageUrl = imageUrl;
//         this.description = description;
//         this.price = price;
//     }


//     save() {
//         // return db.execute(
//         // 'INSERT INTO products (title,price,description,imageUrl) VALUES (?,?,?,?)',
//         // [this.title, this.price, this.description, this.imageUrl]);
//         return db.execute(
//             'INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)',
//             [this.title, this.price, this.imageUrl, this.description]
//           );
//     };

//     // static deleteById(id){

//     // }

//     static fetchAll() {
//         return db.execute('SELECT * FROM products');
//     }

// };


// // static findById(id){
// return debug.execute('SELECT * FROM products WHERE  product.id=?', [id]);
// // }



// Code for retrieving and saving in a file :
// const path = require('path');
// const fs = require('fs');
// const p = path.join(path.dirname(require.main.filename), 'data', 'products.json');
// const Cart=require('./cart');
// const getProductsFromFile = (cb) => {
//     fs.readFile(p, (err, fileContent) => {
//         if (err) {
//             return cb([]);
//         }
//         cb(JSON.parse(fileContent));
//     });
// }
// module.exports = class Product {
//     constructor(id, title, imageURL, description, price) {
//         this.id = id;
//         this.title = title;
//         this.imageURL = imageURL;
//         this.description = description;
//         this.price = price;
//     }
//     save() {
//         getProductsFromFile(products => {
//             if (this.id) {
//                 console.log("x");
//                 const existingIndex = products.findIndex(prod => prod.id === this.id);
//                 const updatedProduct = [...products];
//                 updatedProduct[existingIndex] = this;
//                 fs.writeFile(p, JSON.stringify(updatedProduct), (err) => {
//                     console.log(err);
//                 });
//                 console.log("Executed");

//             }
//             else {
//                 this.id = Math.random().toString();
//                 products.push(this);
//                 fs.writeFile(p, JSON.stringify(products), (err) => {
//                     console.log(err);
//                 });
//             }
//         });

//     }

//     static fetchAll(cb) {
//         getProductsFromFile(cb);
//     }

//     static findById(id, cb) {
//         getProductsFromFile(products => {
//             const product = products.find(p => p.id == id);
//             cb(product);
//         })
//     }

//     static deleteById(id) {
//         getProductsFromFile(products => {
//             // findById(id, (product) => {
//             //     products.remove(product);
//             // fs.writeFile(p, JSON.stringify(products), err => {
//             //     console.log(err);
//             // })
//             // })
//             const updatedProducts = products.filter(prod => prod.id !== id);
//             fs.writeFile(p, JSON.stringify(updatedProducts), err => {
//                 if(!err){
//                     Cart.deleteProduct(id);
//                 }
//             });
//         })
//     }
// }