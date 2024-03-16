const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const user = require('../models/user');
const { validationResult } = require('express-validator');
// const sendgridTransport = require('nodemailer-sendgrid-transport');
// const transporter = nodemailer.createTransport(sendgridTransport({
//   auth: {
//     api_key: ''
//   }
// }));
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "dummyecommerce13@gmail.com",
    pass: "mobv mbop kjso elmb"
  }
});
exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  }
  else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMessage: message,
    oldInput: {
      email: "", password: ""
    },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email, password: password
      },
      validationErrors: errors.array()
    });
  }
  User.findOne({ email: email }).then((user) => {
    if (!user) {
      // req.flash('error', 'Invalid email or password');
      // return res.redirect('/login');
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: 'Invalid email or password',
        oldInput: {
          email: email, password: password
        },
        validationErrors: []
      });
    }
    bcrypt.compare(password, user.password).then((match) => {
      if (match) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save(() => {
          res.redirect('/');
        })
      }
      else {
        // req.flash('error', 'Invalid email or password'); 
        res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email or password',
          oldInput: {
            email: email, password: password
          },
          validationErrors: []
        });
        // res.redirect('/login');
      }
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



  // User.findById('65d49f8c30a911153ddf02e2')
  //   .then(user => {
  //     req.session.isLoggedIn = true;
  //     req.session.user = user;
  //     req.session.save(() => {
  //       res.redirect('/');
  //     })
  //   })
  //   .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect('/');
  })
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  }
  else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: message,
    validationErrors: [],
    oldInput: { email: "", password: "", confirmPassword: "" }
  })
}

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      oldInput: { email: email, password: password, confirmPassword: confirmPassword }
    });
  }
  User.findOne({ email: email }).then((userFound) => {
    if (userFound) {
      req.flash('error', 'Email already exists');
      return res.redirect('/signup');
    }
    bcrypt.hash(password, 12).then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] }
      });
      return user.save();
    }).then(() => {
      res.redirect('/login');
      transporter.sendMail({
        to: email,
        from: 'dummyecommerce13@gmail.com',
        subject: 'Signup succeeded',
        html: '<h1>You successfully signed up</h1>'
      }).then().catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
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

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  }
  else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset',
    errorMessage: message
  });

};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        req.flash('error', 'No account with that email exists');
        return res.redirect('/reset');
      }
      user.resetToken = token;
      user.resetTokenExpiry = Date.now() + 3600000;
      user.save().then(() => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'dummyecommerce13@gmail.com',
          subject: 'Signup succeeded',
          html: `<p>You request a password reset</p>
                  <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set new password</p>`
        }).then().catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
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
  });
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  user.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } }).then((user) => {
    if (!user) {
      req.flash('error', 'Time limit exceedeed !! Please Try again');
      return res.redirect('/reset');
    }
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    }
    else {
      message = null;
    }
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token
    });
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });

};
exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.passwordToken;
  User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() }, _id: userId }).then((user) => {
    bcrypt.hash(newPassword, 12)
      .then((hashedPassword) => {
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        user.save().then(() => {
          res.redirect('/login');
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
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })
}
