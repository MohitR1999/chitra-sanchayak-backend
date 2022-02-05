const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    userName : {type : String},
    password : {type : String},
    name : {type : String},
    token : {type : String},
    images : {type : Array, default: []},
});

const User = mongoose.model('User', UserSchema);

module.exports = User;