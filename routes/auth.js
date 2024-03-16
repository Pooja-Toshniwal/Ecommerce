const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { check, body } = require('express-validator');
const User = require('../models/user');
router.get('/login', authController.getLogin);
router.post('/login', check('email').isEmail().withMessage('Invalid email!!! Try again').normalizeEmail(),
    body('password', 'Password has to be valid')
        .isLength({ min: 5 }).isAlphanumeric().trim(),
    authController.postLogin);
router.post('/logout', authController.postLogout);
router.get('/signup', authController.getSignup);
router.post('/signup', check('email').isEmail().withMessage('Invalid email!!! Try again').normalizeEmail()
    // .custom((value, { req }) => {
    //    return User.findOne({ email: value }).then((userFound) => {
    //         if (userFound) {
    //             return Promise.reject('Email already exists!!');
    //         }
    // });
    // })
    ,
    body('password', 'Please enter a password with only numbers and text and at least 5 characters').trim()
        .isLength({ min: 5 }).isAlphanumeric(),
    body('confirmPassword').trim().custom((value, { req }) => {
        if (value === req.body.password) {
            return true;
        }
        throw new Error('Passwords have to match!!')
    }),
    authController.postSignup);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);
module.exports = router;