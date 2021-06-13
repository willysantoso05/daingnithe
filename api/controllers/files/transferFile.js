/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';
const readFileContract = require('../../script/file-contract/readFileContract');
const transferFileContract = require('../../script/file-contract/transferFileContract');
const updateFileOwnerKeyAsset = require('../../script/key-contract/updateFileOwnerKeyAsset');
const wallet = require('../../script/wallet');

exports.transferFile = async (req, res, next) => {
    const targetUserId = req.body.userId;
    const userId = req.user._id;
    const walletId = req.user.username;
    const fileId = req.params.fileId;
    const walletData = req.wallet;

    await wallet.saveWallet(walletData, walletId);

    try {
        //Check if file id exist
        let fileAsset = await readFileContract.readFileAsset(walletId, fileId);
        if (!fileAsset) {
            res.status(404).json({status:"ERROR", message: "File asset is not found", data:null});
            wallet.deleteWallet(walletId);
            return;
        }
        fileAsset = JSON.parse(fileAsset);
        let accessUserList = JSON.parse(fileAsset.AccessUserList)

        //Check if new owner is the last owner
        if( fileAsset.OwnerID == targetUserId ) {
            res.json({status:"SUCCESS", message: "User has already been the file owner", data:null});
            wallet.deleteWallet(walletId);
            return;
        }

        //Check if new owner is not in granted user list
        if(!accessUserList.hasOwnProperty(targetUserId)){
            res.json({status:"SUCCESS", message: "User has already no access", data:null});
            wallet.deleteWallet(walletId);
            return;
        }

        //transfer file transaction
        try {
            console.log("---TRANSFER FILE ASSET");
            await transferFileContract.transferFileAsset(walletId, userId, fileId, targetUserId);
        } catch (err) {
            res.status(500).json({status:"ERROR", message: err, data:null});
            wallet.deleteWallet(walletId);
            return;
        }

        //Update all key asset
        console.log("---CHANGE KEY ASSETS");
        const listUsers = Object.keys(accessUserList);
        for (let i = 0; i < listUsers.length; i++) {
            const user = listUsers[i];
            const key = accessUserList[user];
            console.log(user.toString() + " ...... " + key.toString());

            //update key transaction
            try {
                await updateFileOwnerKeyAsset.updateFileOwnerKeyAsset(walletId, userId, key, targetUserId);
            } catch (err) {
                res.status(500).json({status:"ERROR", message: err, data:null});
                wallet.deleteWallet(walletId);
                return;
            }
        }

        res.json({
            status:"SUCCESS",
            message: "Transfering file",
            data:{
                FileID : fileId,
                OwnerID : targetUserId,
            }
        });
    } catch (err){
        res.status(500).json({status:"ERROR", message: err, data:null});
    }
    wallet.deleteWallet(walletId);
}