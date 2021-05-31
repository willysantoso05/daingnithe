/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const sss = require('shamirs-secret-sharing');
const encryption = require('../../utils/encryption');

const historyKeyContract = require('../../script/key-contract/historyKeyContract');
const historyFileContract = require('../../script/file-contract/historyFileContract');
const downloadFileIPFS = require('../../utils/ipfs');
const wallet = require('../../script/wallet');

var stream = require('stream');
const { use } = require('../../routes/files');

exports.downloadHistoryFile = async (req, res, next) => {
    const fileId = req.params.fileId;
    const fileVersion = req.params.version;
    const userId = req.user._id;
    const walletId = req.user.username;
    const walletData = req.wallet;

    await wallet.saveWallet(walletData, walletId);

    try {
        //Get File History
        let historyFileResult = await historyFileContract.historyFileAsset(walletId, fileId);

        if(!historyFileResult){
            res.status(404).json({status:"ERROR", message: "File asset is not found", data:null});
            wallet.deleteWallet(walletId);
            return;
        }
        
        let historyFileData = JSON.parse(historyFileResult);
        let fileHistory = [];

        if (historyFileData.length==0) {
            res.status(404).json({status:"ERROR", message: "File asset is not found", data:null});
            wallet.deleteWallet(walletId);
            return;
        } else {
            for(let i=0; i<historyFileData.length; i++){
                if (Number(fileVersion) == Number(historyFileData[i].Value.Version)){
                    fileHistory.push({
                        Timestamp: historyFileData[i].Timestamp.seconds,
                        ID : historyFileData[i].Value.ID,
                        FileName : historyFileData[i].Value.FileName,
                        MimeType: historyFileData[i].Value.MimeType,
                        IpfsPath: historyFileData[i].Value.IpfsPath,
                        SharedKey: historyFileData[i].Value.SharedKey,
                        OwnerID : historyFileData[i].Value.OwnerID,
                        Version: historyFileData[i].Value.Version,
                        AccessUserList : JSON.parse(historyFileData[i].Value.AccessUserList)
                    });
                }
            }
            // console.log(fileHistory);
        }

        //Check if version exist
        if (fileHistory.length==0) {
            res.status(404).json({status:"ERROR", message: "File Version is not found", data:null});
            wallet.deleteWallet(walletId);
            return;
        }

        let specifiedFile = fileHistory[0];

        //Check if user is granted
        if(!specifiedFile.AccessUserList.hasOwnProperty(userId)){
            res.status(404).json({status:"ERROR", message: "User has no access to file with specified version", data:null});
            wallet.deleteWallet(walletId);
            return;
        }
        const ownerKeyId = specifiedFile.AccessUserList[userId];

        //Get Key History
        let historyKeyResult = await historyKeyContract.historyKeyAsset(walletId, ownerKeyId);

        if(!historyKeyResult){
            res.status(404).json({status:"ERROR", message: "Key asset is not found", data:null});
            wallet.deleteWallet(walletId);
            return;
        }
        
        let historyKeyData = JSON.parse(historyKeyResult);
        let keyHistory = [];

        if (historyKeyData.length==0) {
            res.status(404).json({status:"ERROR", message: "File asset is not found", data:null});
            wallet.deleteWallet(walletId);
            return;
        } else {
            for(let i=0; i<historyKeyData.length; i++){
                if (Number(fileVersion) == Number(historyKeyData[i].Value.FileVersion)){
                    keyHistory.push({
                        Timestamp: historyKeyData[i].Timestamp.seconds,
                        OwnerKeyID : historyKeyData[i].Value.OwnerKeyID,
                        FileID : historyKeyData[i].Value.FileID,
                        OwnerFileID : historyKeyData[i].Value.OwnerFileID,
                        FileVersion: historyKeyData[i].Value.FileVersion,
                        KeyValue : historyKeyData[i].Value.KeyValue
                    });
                }
            }
            // console.log(keyHistory);
        }

        //Check if version exist
        if (keyHistory.length==0) {
            res.status(404).json({status:"ERROR", message: "File Version is not found", data:null});
            wallet.deleteWallet(walletId);
            return;
        }

        let specifiedKey = keyHistory[0];

        //Create private key
        let shared = []
        shared[0] = Buffer.from(specifiedFile.SharedKey.toString(), 'binary');
        shared[1] = Buffer.from(specifiedKey.KeyValue.toString(), 'binary');

        const privateKey = sss.combine(shared);
        
        //Get files from IPFS
        const buffer = await downloadFileIPFS.downloadIPFS(specifiedFile.IpfsPath.toString());

        //Decrypt file
        const temp_key = encryption.decryptRSA(buffer.slice(0, 684).toString('utf8'), privateKey);
        const temp_iv = buffer.slice(684, 700).toString('utf8');
        const temp_econtent = buffer.slice(700).toString('utf8');
        const temp_ebuf = Buffer.from(temp_econtent, 'hex');
        const temp_content = encryption.decryptAES(temp_ebuf, temp_key, temp_iv);

        //Create download
        var readStream = new stream.PassThrough();
        readStream.end(temp_content);

        res.set('Content-disposition', 'attachment; filename=' + specifiedFile.FileName.toString());
        res.set('Content-Type', specifiedFile.MimeType.toString());

        readStream.pipe(res);

        readStream.on("close", function() {
            res.status(200);
            res.end();
        });
        readStream.on("error", function() {
            res.status(400);
            res.end();
        });
    } catch (err) {
        res.status(500).json({status:"ERROR", message: err, data:null});
    }
    wallet.deleteWallet(walletId);
}