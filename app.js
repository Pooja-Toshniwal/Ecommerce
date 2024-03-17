const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/user');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
app.use(bodyParser.urlencoded({ extended: false }));
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        // cb(null, new Date().toISOString + '-' + file.originalname)
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
// EJS
app.engine('ejs', require('ejs').__express);
app.set('view engine', 'ejs');
app.set('views', 'views');
// Handlebars
// const expressHbs = require('express-handlebars');
// app.engine('hbs', expressHbs.engine({
//     layoutsDir: 'views/layouts/',
//     defaultLayout: 'main-layout',
//     extname: 'hbs'
// })
// );
// app.set('view engine', 'hbs');
// PUG
// app.engine('pug', require('pug').__express);
// app.set('view engine','pug');
// app.set('views', 'views');
const admin = require('./routes/admin');
const shopRouter = require('./routes/shop');
const authRouter = require('./routes/auth');
const errorRouter = require('./routes/error');
const MONGODB_URI = 'Enter uri';
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({ secret: "my secret", resave: false, saveUninitialized: false, store: store }));
const csrfProtection = csrf();
app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id).then((user) => {
        if (!user) {
            return next();
        }
        req.user = user;
        next();
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
        // throw new Error(err) ;
    }
    );
})

app.use('/admin', admin.routes);
app.use(shopRouter);
app.use(authRouter);
// app.use((req, res, next) => {
//     // res.sendFile(path.join(__dirname,'views','error.html'));
//     res.status(404).render('404', { pageTitle: 'Page not Found', path: 'random' });
// })
app.use(errorRouter);
app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).render('500', { pageTitle: 'Error', path: 'random', isAuthenticated: false });
    // res.redirect('/500');
})
mongoose.connect(MONGODB_URI).then(() => {
    app.listen(3000);
}).catch(err => console.log(err));



// without signup:
// mongoose.connect(MONGODB_URI).then(() => {
//     User.findOne().then((user) => {
//         if (!user) {
//             const user = new User({
//                 name: "Pooja", email: "pooja@gamil.com", cart: {
//                     items: []
//                 }
//             });
//             user.save();
//             console.log("jhjfnejk");
//         }
//     })
//     app.listen(3000);
// }).catch(err => console.log(err));



// mongodb
// const User=require('./models/user');
// const mongoConnect = require('./util/database').mongoConnect;
// mongoConnect(() => {
//     app.listen(3000);
// })
// app.use((req,res,next)=>{
//     User.findById('65cef2b239dbf8c172a0dd5b').then((user)=>{
//         req.user=new User(user.username,user.email,user.cart,user._id);
//         // req.user=user;
//         next();
//     }).catch(err=>console.log(err));
// })

// Sequelize
// const sequelize = require('./util/database');
// const Product = require('./models/product');
// const User = require('./models/user');
// const Cart=require('./models/cart');
// const CartItem=require('./models/cart-item');
// const Order=require('./models/order');
// const OrderItem=require('./models/order-item');
// app.use((req, res, next) => {
//     User.findByPk(1).then((user) => {
//         req.user = user;
//         next();
//     }).catch(err => console.log(err));
// })
// Product.belongsTo(User, { constraint: true, onDelete: 'CASCADE' });
// User.hasMany(Product);
// User.hasOne(Cart);
// Cart.belongsTo(User);
// Cart.belongsToMany(Product,{through:CartItem});
// Product.belongsToMany(Cart,{through:CartItem});
// Order.belongsTo(User);
// User.hasMany(Order);
// Order.belongsToMany(Product, { through: OrderItem});
// Product.belongsToMany(Order, { through: OrderItem});
// sequelize.sync(
//     // {force:true}
//     ).then(() => {
//     User.findByPk(1).then((user) => {
//         if (!user) {
//             User.create({ name: 'Pooja', email: 'pooja@gmail.com' }).then((user)=>{
//                 user.createCart().then().catch(err=>console.log(err));
//             }).catch(err => console.log(err));
//         }
//     }).catch(err => console.log(err));
//     app.listen(3000);
// }).catch(err => console.log(err));
