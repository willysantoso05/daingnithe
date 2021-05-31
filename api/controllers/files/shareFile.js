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
const wallet = require('../../script/wallet');

exports.shareFile = async (req, res, next) => {
    const fileId = req.params.fileId;
    const action = req.body.access.toString().toUpperCase() ;
    const targetUserId = req.body.userId;

    const userId = req.user._id;
    const walletId = req.user.username;
    const walletData = req.wallet;

    await wallet.saveWallet(walletData, walletId);

    try {
        //Getting file asset info
        let fileAsset = await readFileContract.readFileAsset(walletId, fileId);
        if (!fileAsset) {
            res.status(404).json({status:"ERROR", message: "File asset is not found", data:null});
            wallet.deleteWallet(walletId);
            return;
        }
        fileAsset = JSON.parse(fileAsset);

        let fileVersion = Number(fileAsset.Version) + 1;
        let accessUserList = JSON.parse(fileAsset.AccessUserList)
        const totalGrantedUser = Object.keys(accessUserList).length;
        const ownerKeyId = accessUserList[userId];

        //Getting key asset info
        let keyAsset = await readKeyContract.readKeyAsset(walletId, userId, ownerKeyId);
        if (!keyAsset) {
            res.status(404).json({status:"ERROR", message: "Key asset is not found", data:null});
            wallet.deleteWallet(walletId);
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
                res.json({status:"SUCCESS", message: "User has already access", data:null});
                wallet.deleteWallet(walletId);
                return;
            }

            //Generate new shared
            const secret = Buffer.from(privateKey.toString())
            const newShares = sss.split(secret, { shares: totalGrantedUser+2, threshold: 2 })

            //Add to new list of granted user
            const keyID = "KEY_" + uuidv4().toString();
            accessUserList[targetUserId] = keyID;

            //SHARE File Asset
            try {
                console.log("---SHARE FILE ASSET");
                await shareFileContract.shareFileAsset(walletId, userId, fileId, newShares[0].toString('binary'), JSON.stringify(accessUserList));
            } catch (err) {
                res.status(500).json({status:"ERROR", message: err, data:null});
                wallet.deleteWallet(walletId);
                return;
            }

            //create key transaction
            try {
                console.log("---CREATE KEY ASSET");
                await createKeyContract.createKeyAsset(walletId, keyID, targetUserId, fileId, userId, fileVersion, newShares[1].toString('binary'));
            } catch (err) {
                res.status(500).json({status:"ERROR", message: err, data:null});
                wallet.deleteWallet(walletId);
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
                    await updateKeyContract.updateKeyAsset(walletId, userId, key, fileVersion, newShares[i+2].toString('binary'));
                } catch (err) {
                    res.status(500).json({status:"ERROR", message: err, data:null});
                    wallet.deleteWallet(walletId);
                    return;
                }
            }

        } else if (action == "REVOKE") {
            //Check if user has already been revoked
            if(!accessUserList.hasOwnProperty(targetUserId)){
                res.json({status:"SUCCESS", message: "User has already no access", data:null});
                wallet.deleteWallet(walletId);
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
                await shareFileContract.shareFileAsset(walletId, userId, fileId, newShares[0].toString('binary'), JSON.stringify(accessUserList));
            } catch (err) {
                res.status(500).json({status:"ERROR", message: err, data:null});
                wallet.deleteWallet(walletId);
                return;
            }

            //Delete key transaction
            try {
                console.log("---DELETE KEY ASSET");
                await deleteKeyContract.deleteKeyAsset(walletId, userId, targetKeyID);
            } catch (err) {
                res.status(500).json({status:"ERROR", message: err, data:null});
                wallet.deleteWallet(walletId);
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
                    await updateKeyContract.updateKeyAsset(walletId, userId, key, fileVersion, newShares[i+1].toString('binary'));
                } catch (err) {
                    res.status(500).json({status:"ERROR", message: err, data:null});
                    wallet.deleteWallet(walletId);
                    return;
                }
            }
        } else {
            res.status(500).json({status:"ERROR", message: "Error action", data:null});
        }

        res.json({
            status:"SUCCESS",
            message: "Change user access file", 
            data:{
                Action: `${action} ACCESS`,
                UserID: targetUserId,
                FileID : fileId,
                GrantedUserList : accessUserList
            }
        });
    } catch (err) {
        res.status(500).json({status:"ERROR", message: err, data:null});
    }
    wallet.deleteWallet(walletId);
}