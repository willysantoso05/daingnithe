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

        let data = JSON.parse(result);
        console.log(data[0].Key);
        console.log(data[0].Record.ID);
        
        if (data.length==0) {
            res.json({status:"success", message: "get all files asset", data:null});
        } else {
            let temp = [];
            for(let i=0; i<data.length; i++){
                temp[i] = {
                    ID : data[i].Record.ID,
                    OwnerID : data[i].Record.OwnerID,
                    AccessUserList : data[i].Record.AccessUserList
                }
            }
            res.json({status:"success", message: "Get All Files Assets", data:temp});
        }
        
    } catch (err) {
        res.json({status:"error", "error while invoke create key asset": err, data:null});
    }
};