const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const OrderSchema = new Schema({
    products: [{
        product: { type: Object, required: true },
        quantity: { type: Number, required: true }
    }],
    user: {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        email: { type: String, required: true }
    }
})
module.exports = mongoose.model('Order', OrderSchema);

// const Sequelize = require('sequelize');
// const sequelize = require('../util/database');
// const  Order=sequelize.define('order',{
//     id:{
//         type:Sequelize.INTEGER,
//         primaryKey:true,
//         allowNull:false,
//         autoIncrement:true
//     }
// });
// module.exports=Order;


