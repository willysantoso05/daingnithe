/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {v4 : uuidv4} = require('uuid')
const sss = require('shamirs-secret-sharing')

const readFileContract = require('../../script/file-contract/readFileContract');
const shareFileContract = require('../../script/file-contract/shareFileContract');
const readKeyContract = require('../../script/key-contract/readKeyContract');
const createKeyContract = require('../../script/key-contract/createKeyContract');
const updateKeyContract = require('../../script/key-contract/updateKeyContract');
const deleteKeyContract = require('../../script/key-contract/deleteKeyContract');

exports.shareFile = async (req, res, next) => {
    const fileId = req.params.fileId;
    const action = req.body.access;
    const targetUserId = req.body.userId;

    const userId = req.user._id;
    const walletId = req.user.username;

    try {
        let fileAsset = await readFileContract.readFileAsset(walletId, fileId);
        if (!fileAsset) {
            res.json({status:"error", message: "file asset not found", data:null});
            return;
        }
        fileAsset = JSON.parse(fileAsset);

        let accessUserList = JSON.parse(fileAsset.AccessUserList)
        const totalGrantedUser = Object.keys(accessUserList).length;
        console.log(totalGrantedUser);
        const ownerKeyId = accessUserList[userId];

        let keyAsset = await readKeyContract.readKeyAsset(walletId, userId, ownerKeyId);
        if (!keyAsset) {
            res.json({status:"error", message: "key asset not found", data:null});
            return;
        }
        keyAsset = JSON.parse(keyAsset);

        //Create private key
        let shared = []
        shared[0] = Buffer.from(fileAsset.SharedKey.toString(), 'binary');
        shared[1] = Buffer.from(keyAsset.KeyValue.toString(), 'binary');

        const privateKey = sss.combine(shared);

        if(action == "GRANT"){
            //Check if user has already been granted
            if(accessUserList.hasOwnProperty(targetUserId)){
                res.json({status:"success", message: "User has already access", data:null});
                return;
            }

            //Generate new shared
            const secret = Buffer.from(privateKey.toString())
            const newShares = sss.split(secret, { shares: totalGrantedUser+2, threshold: 2 })

            //Add to new list of granted user
            const keyID = "KEY_" + uuidv4().toString();
            accessUserList[targetUserId] = keyID;
            console.log(accessUserList);

            //SHARE File Asset
            try {
                console.log("---SHARE FILE ASSET");
                shareFileContract.shareFileAsset(walletId, userId, fileId, newShares[0].toString('binary'), JSON.stringify(accessUserList));
            } catch (err) {
                res.json({status:"error", "error while invoke create file asset": err, data:null});
                return;
            }

            //create key transaction
            try {
                console.log("---CREATE KEY ASSET");
                createKeyContract.createKeyAsset(walletId, keyID, targetUserId, fileId, userId, newShares[1].toString('binary'));
            } catch (err) {
                res.json({status:"error", "error while invoke create key asset": err, data:null});
                return;
            }

            //Update the rest granted user keys
            console.log("---CHANGE KEY ASSETS");
            const listUsers = Object.keys(accessUserList);
            for (let i = 0; i < listUsers.length-1; i++) {
                let user = listUsers[i];
                let key = accessUserList[user];
                console.log(user.toString() + " ...... " + key.toString());

                //update key transaction
                try {
                    updateKeyContract.updateKeyAsset(walletId, userId, key, newShares[i+2].toString('binary'));
                } catch (err) {
                    res.json({status:"error", "error while invoke create key asset": err, data:null});
                    return;
                }
            }

        } else if (action == "REVOKE") {
            //Check if user has already been granted
            if(!accessUserList.hasOwnProperty(targetUserId)){
                res.json({status:"success", message: "User has already no access", data:null});
                return;
            }

            //Generate new shared
            const secret = Buffer.from(privateKey.toString())
            const newShares = sss.split(secret, { shares: totalGrantedUser, threshold: 2 })

            //Delete user from granted user list
            const targetKeyID = accessUserList[targetUserId];
            delete accessUserList[targetUserId];
            console.log(targetKeyID);

            //SHARE File Asset
            try {
                console.log("---SHARE FILE ASSET");
                shareFileContract.shareFileAsset(walletId, userId, fileId, newShares[0].toString('binary'), JSON.stringify(accessUserList));
            } catch (err) {
                res.json({status:"error", "error while invoke create file asset": err, data:null});
                return;
            }

            //Delete key transaction
            try {
                console.log("---DELETE KEY ASSET");
                await  deleteKeyContract.deleteKeyAsset(walletId, userId, targetKeyID);
            } catch (err) {
                res.json({status:"error", "error while invoke create key asset": err, data:null});
                return;
            }

            //Update the rest granted user keys
            console.log("---CHANGE KEY ASSETS");
            const listUsers = Object.keys(accessUserList);
            for (let i = 0; i < listUsers.length; i++) {
                const user = listUsers[i];
                const key = accessUserList[user];
                console.log(user.toString() + " ...... " + key.toString());

                //update key transaction
                try {
                    updateKeyContract.updateKeyAsset(walletId, userId, key, newShares[i+1].toString('binary'));
                } catch (err) {
                    res.json({status:"error", "error while invoke create key asset": err, data:null});
                    return;
                }
            }

        } else {
            res.json({status:"error", message: "error action", data:null});
        }

        res.json({status:"success", message: "get all files asset", data:null});
    } catch (err) {
        res.json({status:"error", "error while invoke create key asset": err, data:null});
    }
}