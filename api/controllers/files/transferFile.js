/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const transferFileContract = require('../../script/file-contract/transferFileContract');

exports.transferFile = async (req, res, next) => {
    const targetUserId = req.body.userId;
    const userId = req.user._id;
    const walletId = req.user.username;
    const fileId = req.params.fileId;

    try {
        //Check if file id exist
        let fileAsset = await readFileContract.readFileAsset(walletId, fileId);
        if (!fileAsset) {
            res.json({status:"error", message: "file asset not found", data:null});
            return;
        }
        fileAsset = JSON.parse(fileAsset);

        if( fileAsset.OwnerID == targetUserId ) {
            res.json({status:"success", message: "User has already been the file owner", data:null});
            return;
        }

        //transfer file transaction
        try {
            console.log("---TRANSFER FILE ASSET");
            transferFileContract.transferFileAsset(walletId, userId, fileId, targetUserId);
        } catch (err) {
            res.json({status:"error", "error while invoke transfer file asset": err, data:null});
            return;
        }

    } catch (err){
        console.log(err);
        res.json({status:"error", "error while uploading": err, data:null});
    }
}