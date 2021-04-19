const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let userSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // role: {
    //     type: String,
    //     required: true
    // },
    // organization: {
    //     type: String,
    //     required: true
    // }
},{
    timestamps: true,
    collection: 'users'
})
module.exports = mongoose.model('User', userSchema);