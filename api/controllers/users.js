const userModel = require('../models/users');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');

const enrollWalletUser = require('../script/enrollUser')

module.exports = {
    create: function(req, res, next) {
        userModel.findOne({username:req.body.username}, function(err, userInfo){
            if (userInfo) {
                console.log(userInfo.username);
                res.json({status:"error", message: "Username has already been used", data:null});
            } else {
                let status = enrollWalletUser.registerUserWallet(req.body.username);
                if (status) {
                    userModel.create({ name: req.body.name, username: req.body.username, password: req.body.password }, function (err, result) {
                        console.log('Creating user');
                        if (err) 
                            next(err);
                        else{
                            res.json({status: "success", message: "User added successfully!", data: { id:result._id, name: result.name, username: result.username}});
                        }
                    });
                } else {
                    res.json({status:"error", message: "Creating wallet error", data:null});
                }
            }
        });
    },

    authenticate: function(req, res, next) {
        userModel.findOne({username:req.body.username}, function(err, userInfo){
            if (err) {
                next(err);
            } else {
                if(userInfo) {
                    if(bcrypt.compareSync(req.body.password, userInfo.password)) {
                        const token = jwt.sign({userId: userInfo._id}, process.env.JWT_SECRET, { expiresIn: '1h' });
                        res.json({status:"success", message: "user found!!!", data:{id: userInfo._id, username: userInfo.username, token:token}});
                        return;
                    }
                }
                res.json({status:"error", message: "Invalid username/password!!!", data:null});
            }
        });
    },
}