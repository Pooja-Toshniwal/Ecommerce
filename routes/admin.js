const express = require('express');
const router = express.Router();
const product = [];
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const { body } = require('express-validator');
router.get('/add-product', isAuth, adminController.getAddProduct);
router.post('/add-product', body('title').trim().isString().isLength({ min: 3 }),
    // body('imageUrl').isURL(),
    body('price').isFloat(),
    body('description').trim().isLength({ min: 5, max: 400 }),
    isAuth, adminController.postAddProduct);
router.get('/products', isAuth, adminController.getProducts);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post('/edit-product', body('title').trim().isString().isLength({ min: 3 }),
    body('price').isFloat(),
    body('description').trim().isLength({ min: 5, max: 400 }),
    isAuth, adminController.postEditProduct);
// router.post('/delete-product', isAuth, adminController.postDeleteProduct);
router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = { routes: router, products: product };