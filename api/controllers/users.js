const userModel = require('../models/users');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
const path = require('path');

const wallet = require('../script/wallet');
const enrollWalletUser = require('../script/enrollUser');

exports.create = (req, res, next) => {
    try{
        displayName = req.body.name.trim();
        userName = req.body.username.trim();
        password = req.body.password.trim();
    } catch {
        res.json({status:"ERROR", message: "Invalid Request Body", data:null});
        return;
    }

    userModel.findOne({username:userName}, async function(err, userInfo){
        if (userInfo) {
            console.log(userInfo.username);
            res.json({status:"ERROR", message: "Username has already been used", data:null});
            return;
        } 
        
        let status = await enrollWalletUser.registerUserWallet(userName);
        if (status) {
            userModel.create({ name: displayName, username: userName, password: password }, function (err, result) {
                console.log('Creating user');
                if (err) 
                    next(err);
                else{
                    filePath = path.join(process.cwd(), 'wallet')+`/${userName}.id`;
                    console.log(filePath);
                    res.download(filePath, `${userName}.id`, function (err) {
                        if (err) {
                            console.log(err);
                            res.json({status:"ERROR", message: "Downloading Wallet Failed", data:null});
                        }
                        wallet.deleteWallet(userName);
                    });
                    // res.json({status: "success", message: "User added successfully!", data: { id:result._id, name: result.name, username: result.username}});
                }
            });
        } else {
            res.json({status:"ERROR", message: "Creating wallet error", data:null});
        }
    });
}

exports.authenticate = (req, res, next) => {
    try{
        walletData = req.files.wallet.data.toString('utf8');
    }catch{
        res.json({status:"ERROR", message: "Invalid Wallet", data:null});
        return;
    }

    userModel.findOne({username:req.body.username}, function(err, userInfo){
        if (err) {
            next(err);
        } else {
            if(userInfo) {
                if(bcrypt.compareSync(req.body.password, userInfo.password)) {
                    const token = jwt.sign({userId: userInfo._id, wallet:walletData}, process.env.JWT_SECRET, { expiresIn: '1h' });
                    res.json({status:"SUCCESS", message: "USER FOUND", data:{id: userInfo._id, username: userInfo.username, token:token}});
                    return;
                }
            }
            res.json({status:"ERROR", message: "Invalid username/password!!!", data:null});
        }
    });
}