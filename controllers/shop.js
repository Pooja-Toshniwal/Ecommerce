const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const order = require('../models/order');
const stripe = require('stripe')('sk_test_51OrdKQSJIv0OL7viKz44JIDRgqcSSGTZB7hbZVK2JJxQzNxuLZbA1xsDgSokGMwM1cHTgAoCNh29Ndem112ubStQ00kZEn8kot');
const ITEMS_PER_PAGE = 1;
exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    Product.find().countDocuments().then(number => {
        Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
            .then((products) => {
                res.render('shop/product-list', {
                    pageTitle: 'Products',
                    prods: products,
                    path: '/products',
                    isAuthenticated: req.session.isLoggedIn,
                    currentPage: page,
                    hasNextPage: ITEMS_PER_PAGE * page < number,
                    hasPreviousPage: page > 1,
                    nextPage: page + 1,
                    previousPage: page - 1,
                    lastPage: Math.ceil(number / ITEMS_PER_PAGE)
                });
            }).catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    }).catch(err => next(err));
    // Product.find().then((products) => {
    //     res.render('shop/product-list', {
    //         pageTitle: 'Products',
    //         prods: products,
    //         path: '/products',
    //         isAuthenticated: req.session.isLoggedIn

    //     });
    // }).catch(err => {
    //     const error = new Error(err);
    //     error.httpStatusCode = 500;
    //     return next(error);
    // });

};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
            res.render('shop/product-detail', {
                pageTitle: "Product Detail",
                product: product,
                path: "shop/product-detail",
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getIndex = (req, res, next) => {
    const page = +req.query.page || 1;
    Product.find().countDocuments().then(number => {
        Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
            .then((products) => {
                res.render('shop/index', {
                    pageTitle: 'Shop',
                    prods: products,
                    path: '/',
                    isAuthenticated: req.session.isLoggedIn,
                    currentPage: page,
                    hasNextPage: ITEMS_PER_PAGE * page < number,
                    hasPreviousPage: page > 1,
                    nextPage: page + 1,
                    previousPage: page - 1,
                    lastPage: Math.ceil(number / ITEMS_PER_PAGE)
                });
            }).catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    }).catch(err => next(err));

};


exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId).then((product) => {
        req.user.addToCart(product).then(() => {
            res.redirect('/cart');
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.getCart = (req, res, next) => {
    req.user.populate('cart.items.productId').then(user => {
        const products = user.cart.items;
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products,
            isAuthenticated: req.session.isLoggedIn

        })
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

}

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.deleteFromCart(prodId).then(() => {
        res.redirect('/cart');
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

}

exports.getOrders = (req, res, next) => {
    Order.find({ 'users.userId': req.user_id })
        .then((orders) => {
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders,
                isAuthenticated: req.session.isLoggedIn

            });
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postOrder = (req, res, next) => {
    req.user.populate('cart.items.productId').then(user => {
        const products = user.cart.items.map(item => {
            return { quantity: item.quantity, product: { ...item.productId._doc } };
        });
        const order = new Order({
            user: {
                email: req.user.email,
                userId: req.user
            },
            products: products
        });
        return order.save();
    }).then(() => {
        req.user.clearCart().then(() => {
            res.redirect('/orders')
        })
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

}

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId).then((order) => {
        if (order.user.userId.toString() !== req.user._id.toString()) {
            return new Error('Unauthorized');
        }
        const invoiceName = 'invoice-' + orderId + '.pdf';
        const invoicePath = path.join('data', 'invoices', invoiceName);
        const pdfdoc = new PDFDocument();
        pdfdoc.pipe(fs.createWriteStream(invoicePath));
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline;filename="' + invoiceName + '"');
        pdfdoc.pipe(res);
        pdfdoc.fontSize(26).text('Invoice');
        pdfdoc.text('-----------------------------');
        let totalPrice = 0;
        order.products.forEach(product => {
            pdfdoc.fontSize(16).text(product.product.title + ' - ' + product.quantity + ' x $' + product.product.price);
            totalPrice += product.product.price * product.quantity;
        });
        pdfdoc.text('----');
        pdfdoc.text('Total Price: $' + totalPrice);
        pdfdoc.end();



    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })


    // fs.readFile(invoicePath, (err, data) => {
    //     if (err) {
    //         return next(err);
    //     }
    //     res.setHeader('Content-Type', 'application/pdf');
    //     res.setHeader('Content-Disposition', 'inline;filename="' + invoiceName + '"');
    //     // res.setHeader('Content-Disposition', 'attachment;filename="' + invoiceName + '"');
    //     res.send(data);
    // });
    // Streaming the data
    // const file = fs.createReadStream(invoicePath);
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', 'inline;filename="' + invoiceName + '"');
    // file.pipe(res);

};


exports.getCheckout = (req, res, next) => {
        let products;
        let total = 0;
        req.user
          .populate('cart.items.productId')
          .then(user => {
            products = user.cart.items;
            total = 0;
            products.forEach(p => {
              total += p.quantity * p.productId.price;
            });
      
            return stripe.checkout.sessions.create({
              payment_method_types: ['card'],
              line_items: products.map(p => {
                return {
                  name: p.productId.title,
                  description: p.productId.description,
                  amount: p.productId.price * 100,
                  currency: 'usd',
                  quantity: p.quantity
                };
              }),
              success_url: req.protocol + '://' + req.get('host') + '/checkout/success', // => http://localhost:3000
              cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
            });
          })
          .then(session => {
            res.render('shop/checkout', {
              path: '/checkout',
              pageTitle: 'Checkout',
              products: products,
              totalSum: total,
              sessionId: session.id
            });
          })
          .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
      };
    // let total = 0;
    // let products;
    // req.user.populate('cart.items.productId').then(user => {
    //     products = user.cart.items;
    //     products.forEach(product => {
    //         total += product.quantity * product.productId.price;
    //     });
    //     stripe.checkout.session.create({
    //         payment_method_types: ['card'],
    //         line_items: products.map(p => {
    //             return {
    //                 name: p.productId.title,
    //                 description: p.productId.description,
    //                 amount: p.productId.price * 100,
    //                 quantity: p.quantity,
    //                 currency: 'usd'
    //             };
    //         }),
    //         success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
    //         cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
    //     });
    // }).then(session => {
    //     res.render('shop/checkout', {
    //         path: '/checkout',
    //         pageTitle: 'Checkout',
    //         products: products,
    //         totalSum: total,
    //         sessionId: session.id
    //     })
    // })
    //     .catch(err => {
    //         const error = new Error(err);
    //         error.httpStatusCode = 500;
    //         return next(error);
    //     });
// }

exports.getCheckoutSuccess = (req, res, next) => {
    req.user.populate('cart.items.productId').then(user => {
        const products = user.cart.items.map(item => {
            return { quantity: item.quantity, product: { ...item.productId._doc } };
        });
        const order = new Order({
            user: {
                email: req.user.email,
                userId: req.user
            },
            products: products
        });
        return order.save();
    }).then(() => {
        req.user.clearCart().then(() => {
            res.redirect('/orders')
        })
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

}
// mongodb sequelize file
// const Product = require('../models/product');
// exports.getProducts = (req, res, next) => {
//     Product.fetchAll().then((products) => {
//         res.render('shop/product-list', {
//             pageTitle: 'Shop',
//             prods: products,
//             path: '/products',
//         });
//     }).catch(err => console.log(err));
//     // Product.findAll()
//     //     .then((products) => {
//     //         res.render('shop/product-list', {
//     //             pageTitle: 'Shop',
//     //             prods: products,
//     //             path: '/products',
//     //         });
//     //     }).catch(err => console.log(err));
//     // const products = admin.products;
//     // Product.fetchAll((products) => {
//     //     res.render('shop/product-list', {
//     //         pageTitle: 'All Products',
//     //         prods: products,
//     //         path: '/products',
//     //         // hasProducts: products.length > 0,
//     //         // activeShop: true,s
//     //         // productCss: true
//     //     });
//     // }
//     // );
// };

// exports.getProduct = (req, res, next) => {
//     const prodId = req.params.productId;
//     Product.findById(prodId)
//         .then((product) => {
//             res.render('shop/product-detail', {
//                 pageTitle: "Product Detail",
//                 product: product,
//                 path: "shop/product-detail"
//             });
//         })
//         .catch(err => console.log(err));

//     // Product.findByPk(prodId)
//     //     .then((product) => {
//     //         res.render('shop/product-detail', {
//     //             pageTitle: "Product Detail",
//     //             product: product,
//     //             path: "shop/product-detail"
//     //         });
//     //     })
//     //     .catch(err => console.log(err));

//     // Product.findById(prodId, product => {
//     //     res.render('shop/product-detail', { pageTitle: "Product Detail", product: product, path: "shop/product-detail" });
//     // });
// }

// exports.getIndex = (req, res, next) => {
//     Product.fetchAll()
//         .then((products) => {
//             res.render('shop/index', {
//                 pageTitle: 'Shop',
//                 prods: products,
//                 path: '/',
//             });
//         }).catch(err => console.log(err));
//     // Product.fetchAll()
//     //     .then(([rows, fieldsData]) => {
//     //         res.render('shop/index', {
//     //             pageTitle: 'Shop',
//     //             prods: rows,
//     //             path: '/',
//     //         });
//     //     })
//     //     .catch(err => console.log(err));

// };


// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout', {
//         pageTitle: 'Checkout',
//         path: '/checkout',
//     });
// };


// exports.postCart = (req, res, next) => {
//     const prodId = req.body.productId;
//     Product.findById(prodId).then((product) => {
//         req.user.addToCart(product).then(() => {
//             res.redirect('/cart');
//         }).catch(err => console.log(err));
//     }).catch(err => console.log(err));
//     // req.user.getCart().then(cart => {
//     //     cart.getProducts({ where: { id: prodId } }).then(products => {
//     //         let product;
//     //         if (products.length > 0) {
//     //             product = products[0];
//     //         }
//     //         let newQuantity = 1;
//     //         if (product) {
//     //             newQuantity = product.cartItem.quantity + 1;
//     //         }
//     //         Product.findByPk(prodId).then(product => {
//     //             cart.addProduct(product, { through: { quantity: newQuantity } }).then(() => {
//     //                 res.redirect('/cart');
//     //             }).catch(err => console.log(err));
//     //         }).catch(err => console.log(err));

//     //     }).catch(err => console.log(err));
//     // }).catch(err => console.log(err));

//     // Product.findById(prodId, (product) => {
//     //     Cart.addProduct(prodId, product.price);
//     // })
//     // res.redirect('/cart');
// }

// exports.getCart = (req, res, next) => {
//     req.user.getCart().then(products => {
//         res.render('shop/cart', {
//             path: '/cart',
//             pageTitle: 'Your Cart',
//             products: products
//         })}).catch(err => consoel.log(err));
//         // req.user.getCart()
//         //     .then((cart) => {
//         //         cart.getProducts().then((products) => {
//         //             res.render('shop/cart', {
//         //                 path: '/cart',
//         //                 pageTitle: 'Your Cart',
//         //                 products: products
//         //             })
//         //         }).catch(err => console.log(err));
//         //     })
//         //     .catch(err => console.log(err));
//         // req.user.createProduct()
//         // Cart.getCart(cart => {
//         //     Product.fetchAll(products => {
//         //         const cartProducts = [];
//         //         for (let product of products) {
//         //             const cartProductsData = cart.products.find(prod => prod.id === product.id)
//         //             if (cartProductsData) {
//         //                 cartProducts.push({ productData: product, qty: cartProductsData.qty });
//         //             }
//         //         }
//         //         res.render('shop/cart', {
//         //             path: '/cart',
//         //             pageTitle: 'Your Cart',
//         //             products: cartProducts
//         //         });
//         //     });
//         // })
//     }

// exports.postCartDeleteProduct = (req, res, next) => {
//             const prodId = req.body.productId;
//             req.user.deleteItemFromCart(prodId).then(()=>{
//                 res.redirect('/cart');
//             }).catch(err=>consoel.log(err));
//             // req.user.getCart().then((cart) => {
//             //     cart.getProducts({ where: { id: prodId } }).then(products => {
//             //         const product = products[0];
//             //         product.cartItem.destroy().then(() => {
//             //             res.redirect('/cart');
//             //         }).catch(err => console.log(err));
//             //     }).catch(err => console.log(err));
//             // }).catch(err => console.log(err));
//             // Cart.deleteProduct(prodId);
//             // res.redirect('/cart');
//         }

// exports.getOrders = (req, res, next) => {

//      req.user.getOrders().then((orders)=>{
//         res.render('shop/orders', {
//                     pageTitle: 'Your Orders',
//                     path: '/orders',
//                     orders: orders
//                 });
//      }).catch(err=>console.log(err));
//             // req.user.getOrders({ include: ['products'] }).then((orders) => {
//             //     res.render('shop/orders', {
//             //         pageTitle: 'Your Orders',
//             //         path: '/orders',
//             //         orders: orders
//             //     });
//             // }).catch(err => console.log(err));

//         }

// exports.postOrder = (req, res, next) => {
//       req.user.addOrder().then(()=>{
//         res.redirect('/orders')
//       }).catch(err=>console.log(err));
//             // req.user.getCart().then(cart => {
//             //     cart.getProducts().then(products => {
//             //         req.user.createOrder().then(order => {
//             //             order.addProducts(products.map(product => {
//             //                 product.orderItem = { quantity: product.cartItem.quantity };
//             //                 return product;
//             //             })).then(() => {
//             //                 cart.setProducts(null).then(() => {
//             //                     res.redirect('/orders')
//             //                 }).catch(err => console.log(err));
//             //             }).catch(err => console.log(err));
//             //         }).catch(err => console.log(err));
//             //     }).carch(err => console.log(err));
//             // }).catch(err => console.log(err));
//         }