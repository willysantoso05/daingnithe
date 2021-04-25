/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const readFileContract = require('../../script/file-contract/readFileContract');
const deleteFileContract = require('../../script/file-contract/deleteFileContract');
const deleteKeyContract = require('../../script/key-contract/deleteKeyContract');

exports.deleteFile = async (req, res, next) => {
    const fileId = req.params.fileId;
    const userId = req.user._id;
    const walletId = req.user.username;

    try {
        let fileAsset = await readFileContract.readFileAsset(walletId, fileId);
        if (!fileAsset) {
            res.json({status:"error", message: "file asset not found", data:null});
            return;
        }
        fileAsset = JSON.parse(fileAsset);

        //Delete all key assets
        let accessUserList = JSON.parse(fileAsset.AccessUserList)
        const listUsers = Object.keys(accessUserList);
        for (let i = 0; i < listUsers.length; i++) {
            const user = listUsers[i];
            const key = accessUserList[user];
            console.log(user.toString() + " ...... " + key);

            //Delete key transaction
            try {
                await deleteKeyContract.deleteKeyAsset(walletId, userId, key.toString());
            } catch (err) {
                res.json({status:"error", "error while delete key assets": err, data:null});
                return;
            }
        }

        //Delete File Asset
        try {
            deleteFileContract.deleteFileAsset(walletId, userId, fileId);
        } catch (err) {
            res.json({status:"error", "error while delete file asset": err, data:null});
            return;
        }

        res.json({status:"success", message: "File is deleted", data:null});
    } catch (err) {
        res.json({status:"error", "error while invoke create key asset": err, data:null});
    }
}