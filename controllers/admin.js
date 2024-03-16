const Product = require('../models/product');
const { validationResult } = require('express-validator');
const file = require('../util/file');
exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {
        pageTitle: "Add Product", path: '/admin/add-product',
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: null,
        oldInput: { title: '', imageUrl: '', price: '', description: '' },
        validationErrors: []
    });
}
exports.postAddProduct = (req, res, next) => {
    console.log("fhbef");
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    if (!image) {
        return res.status(422).render('admin/add-product', {
            pageTitle: "Add Product", path: '/admin/add-product',
            isAuthenticated: req.session.isLoggedIn,
            errorMessage: 'Attached file is not an image',
            oldInput: { title: title, price: price, description: description },
            validationErrors: []
        })
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/add-product', {
            pageTitle: "Add Product", path: '/admin/add-product',
            isAuthenticated: req.session.isLoggedIn,
            errorMessage: errors.array()[0].msg,
            oldInput: { title: title, price: price, description: description },
            validationErrors: errors.array()
        })
    }
    const imageUrl = image.path;
    console.log("hehfjn");
    const product = new Product({ title: title, price: price, description: description, userId: req.user._id, imageUrl: imageUrl });
    product.save().then(() => {
        res.redirect('/admin/products');
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
            if (!product) {
                res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                product: product,
                errorMessage: null,
                isAuthenticated: req.session.isLoggedIn,
                validationErrors: [],
            })
        }
        ).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.prodId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImage = req.file;
    const updatedDesc = req.body.description;
    const errors = validationResult(req);
    if (!image) {

    }
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            isAuthenticated: req.session.isLoggedIn,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            product: { title: updatedTitle, price: updatedPrice, description: updatedDesc, _id: prodId }
        })
    }
    Product.findById(prodId).then((product) => {
        if (product.userId.toString() != req.user._id.toString()) {
            return res.redirect('/');
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDesc;
        if (updatedImage) {
            file.deleteFile(product.imageUrl);
            product.imageUrl = updatedImage.path;
        }
        product.save().then(() => {
            res.redirect('/admin/products');
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
};

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id }).then((products) => {
        res.render('admin/products', {
            pageTitle: 'Admin Products',
            path: '/admin/products',
            prods: products,
            isAuthenticated: req.session.isLoggedIn

        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

}

exports.postDeleteProduct = (req, res, next) => {

    const prodId = req.body.prodId;
    Product.findById(prodId).then(product => {
        if (!product) {
            return next(new Error('Product not found'));
        }
        file.deleteFile(product.imageUrl);
        return Product.deleteOne({ _id: prodId, userId: req.user._id });
    }).then(re => {
        res.redirect('/admin/products');
    }).catch(err => next(err));

    // Product.find({ _id: prodId }).then((product) => {
    //     if (product.userId.toString() != req.user._id.toString()) {
    //         return res.redirect('/');
    //     }
    // }).catch(err => {
    //     const error = new Error(err);
    //     error.httpStatusCode = 500;
    //     return next(error);
    // });
    // Product.findByIdAndDelete(prodId).then(() => {
    //     res.redirect('/admin/products');
    // }).catch(err => {
    //     const error = new Error(err);
    //     error.httpStatusCode = 500;
    //     return next(error);
    // });
}

exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId).then(product => {
        if (!product) {
            return next(new Error('Product not found'));
        }
        file.deleteFile(product.imageUrl);
        return Product.deleteOne({ _id: prodId, userId: req.user._id });
    }).then(re => {
     res.status(200).json({message:'Success'});
    }).catch(err =>res.status(500).json('Failed'));
}


// mongodb sequlize file
// const Product = require('../models/product');
// exports.getAddProduct = (req, res, next) => {
//     // res.sendFile(path.join(__dirname, '..', 'views', 'add-product.html'));
//     res.render('admin/add-product', {
//         pageTitle: "Add Product", path: '/admin/add-product',
//         formsCss: true,
//         productCss: true,
//         activeAddProduct: true
//     });
// }
// exports.postAddProduct = (req, res, next) => {
//     // console.log(req.body);
//     const title = req.body.title;
//     const imageUrl = req.body.imageUrl;
//     const price = req.body.price;
//     const description = req.body.description;
//     const product = new Product(title, imageUrl, description, price, req.session.user._id);
//     product.save().then(() => {
//         res.redirect('/admin/products');
//     }).catch(err => console.log(err));


//     // req.session.user.createProduct({ title: title, imageUrl: imageUrl, price: price, description: description }).then(()=> {
//     //     res.redirect('/admin/products');
//     // }).catch(err => console.log(err));

//     // Product.create({ title: title, imageUrl: imageUrl, price: price, description: description, userId:req.session.user.id }).then(()=> {
//     //     res.redirect('/admin/products');
//     // }).catch(err => console.log(err));
//     // const product = new Product(null, title, imageURL, description, price);
//     // product.save()
//     //     .then(() => {
//     //         res.redirect('/');
//     //     })
//     //     .catch(err => console.log(err));
//     // product.push({ title: req.body.title });
//     // res.redirect('/');
// };

// exports.getEditProduct = (req, res, next) => {
//     const prodId = req.params.productId;
//     Product.findById(prodId)
//         .then((product) => {
//             if (!product) {
//                 res.redirect('/');
//             }
//             res.render('admin/edit-product', {
//                 pageTitle: 'Edit Product',
//                 path: '/admin/edit-product',
//                 product: product,
//             })
//         }
//         ).catch(err => console.log(err));


//     // Product.findByPk(prodId)
//     //     .then((product) => {
//     //         if (!product) {
//     //             res.redirect('/');
//     //         }
//     //         res.render('admin/edit-product', {
//     //             pageTitle: 'Edit Product',
//     //             path: '/admin/edit-product',
//     //             product: product,
//     //         })
//     //     }
//     //     ).catch(err => console.log(err));
//     // Product.findById(prodId, product => {
//     //     if (!product) {
//     //         res.redirect('/');
//     //     }
//     //     res.render('admin/edit-product', {
//     //         pageTitle: 'Edit Product',
//     //         path: '/admin/edit-product',
//     //         product: product,
//     //     })
//     // })
// }

// exports.postEditProduct = (req, res, next) => {
//     const prodId = req.body.prodId;
//     const updatedTitle = req.body.title;
//     const updatedPrice = req.body.price;
//     const updatedImageUrl = req.body.imageUrl;
//     const updatedDesc = req.body.description;
//     Product.changeById(prodId, updatedTitle, updatedImageUrl, updatedDesc, updatedPrice)
//         .then((product) => {
//             if (!product) {
//                 console.log("product not found");
//                 res.redirect('/admin/products');
//             }
//             res.redirect('/admin/products');
//         }).catch(err => console.log(err));
//     // Product.findByPk(prodId)
//     //     .then(product => {
//     //         if (!product) {
//     //             // If the product is not found, handle the error or redirect as needed
//     //             console.log('Product not found.');
//     //             console.log(prodId);
//     //             // Redirect or send an error response
//     //             return res.redirect('/admin/products');
//     //         }
//     //         product.title = updatedTitle;
//     //         product.price = updatedPrice;
//     //         product.description = updatedDesc;
//     //         product.imageUrl = updatedImageUrl;
//     //         //  product.save().then(result=>{
//     //         //     res.redirect('/admin/products');
//     //         //  });
//     //         return product.save();
//     //     })
//     //     .then(result => {
//     //         res.redirect('/admin/products');
//     //     })
//     //     .catch(err => console.log(err));
// };



// exports.getProducts = (req, res, next) => {
//     Product.fetchAll().then((products) => {
//         res.render('admin/products', {
//             pageTitle: 'Admin Products',
//             path: '/admin/products',
//             prods: products,
//         });
//     }).catch(err => console.log(err));

// }
// // req.session.user.getProducts().then((products) => {
// //     res.render('admin/products', {
// //         pageTitle: 'Admin Products',
// //         path: '/admin/products',
// //         prods: products,
// //     });
// // }).catch(err => console.log(err));

// //     // Product.findAll().then((products) => {
// //     //     res.render('admin/products', {
// //     //         pageTitle: 'Admin Products',
// //     //         path: '/admin/products',
// //     //         prods: products,
// //     //     });
// //     // }).catch(err => console.log(err));
// //     // Product.fetchAll((products) => {
// //     //     res.render('admin/products', {
// //     //         pageTitle: 'Admin Products',
// //     //         path: '/admin/products',
// //     //         prods: products,
// //     //     });
// //     // }
// //     // );
// // };

// exports.postDeleteProduct = (req, res, next) => {
//     const prodId = req.body.prodId;
//     Product.deleteById(prodId).then(() => {
//         res.redirect('/admin/products');
//     }).catch(err => console.log(err));


//     // Product.findByPk(prodId)
//     // .then(product=>{
//     //     return product.destroy();
//     // })
//     // .then(()=>{
//     //     res.redirect('/admin/products');
//     // })
//     // .catch(err=>console.log(err));
//     // Product.deleteById(prodId);
//     // res.redirect('/admin/products');
// }
