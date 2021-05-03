/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const getAllFilesContract = require('../../script/file-contract/getAllFilesContract');
const wallet = require('../../script/wallet');

exports.getAllFiles = async (req,res) => {
    const walletId = req.user.username;
    const walletData = req.wallet;

    await wallet.saveWallet(walletData, walletId);
    
    try {
        let result = await getAllFilesContract.getAllFilesAsset(walletId);

        if(!result){
            res.json({status: "SUCCESS", message: "Get all files asset", data:null});
            wallet.deleteWallet(walletId);
            return;
        }
        
        let data = JSON.parse(result);
        
        if (data.length==0) {
            res.json({status: "SUCCESS", message: "Get all files asset", data:null});
            wallet.deleteWallet(walletId);
            return;
        } else {
            let temp = [];
            for(let i=0; i<data.length; i++){
                temp[i] = {
                    ID : data[i].Record.ID,
                    OwnerID : data[i].Record.OwnerID,
                    AccessUserList : JSON.parse(data[i].Record.AccessUserList)
                }
            }
            res.json({status: "SUCCESS", message: "Get All Files Assets", data:temp});
        }
    } catch (err) {
        res.json({status: "ERROR", message: err, data:null});
    }
    wallet.deleteWallet(walletId);
};