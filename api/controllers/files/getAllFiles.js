/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const getAllFilesContract = require('../../script/file-contract/getAllFilesContract');

exports.getAllFiles = async (req,res) => {
    const walletId = req.user.username;
    
    //get all files transaction
    try {
        let result = await getAllFilesContract.getAllFilesAsset(walletId);

        if(!result){
            res.json({status:"success", message: "get all files asset", data:null});
        }
        
        let data = JSON.parse(result);
        
        if (data.length==0) {
            res.json({status:"success", message: "get all files asset", data:null});
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
            res.json({status:"success", message: "Get All Files Assets", data:temp});
        }
    } catch (err) {
        res.json({status:"error", "error while invoke create key asset": err, data:null});
    }
};