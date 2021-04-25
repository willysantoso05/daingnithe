/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {v4 : uuidv4} = require('uuid')
const crypto = require('crypto');
const sss = require('shamirs-secret-sharing')

const encryption = require('../../utils/encryption');
const ipfs = require('../../utils/ipfs');
const updateFileContract = require('../../script/file-contract/updateFileContract');
const updateKeyContract = require('../../script/key-contract/updateKeyContract');

exports.updateFile = async (req, res, next) => {
    console.log(req.files.file);
    const fileName = req.files.file.name;
    const bufferFile = req.files.file.data;
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

        const ipfsPath = fileAsset.IpfsPath;
        let accessUserList = JSON.parse(fileAsset.AccessUserList)
        const totalGrantedUser = Object.keys(accessUserList).length;
        console.log(totalGrantedUser);

        //generate keys
        const {publicKey, privateKey} = encryption.generateKeys();

        //encryption process
        const key = crypto.randomBytes(16).toString('hex'); // 16 bytes -> 32 chars
        const iv = crypto.randomBytes(8).toString('hex');   // 8 bytes -> 16 chars
        const ekey = encryption.encryptRSA(key, publicKey); // 32 chars -> 684 chars
        const ebuff = encryption.encryptAES(bufferFile, key, iv);

        const content = Buffer.concat([ // headers: encrypted key and IV (len: 700=684+16)
            Buffer.from(ekey, 'utf8'),   // char length: 684
            Buffer.from(iv, 'utf8'),     // char length: 16
            Buffer.from(ebuff, 'utf8')
        ]);

        //generate shared key
        const secret = Buffer.from(privateKey);
        const shares = sss.split(secret, { shares: totalGrantedUser+1, threshold: 2 });

        //upload to IPFS
        ipfs.uploadIPFS(ipfsPath, content);

        //create file transaction
        try {
            console.log("---UPDATEFILE ASSET");
            updateFileContract.updateFileAsset(walletId, userId, fileId, fileName, ipfsPath, publicKey, shares[0].toString('binary'));
        } catch (err) {
            res.json({status:"error", "error while invoke update file asset": err, data:null});
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
                updateKeyContract.updateKeyAsset(walletId, userId, key, shares[i+1].toString('binary'));
            } catch (err) {
                res.json({status:"error", "error while invoke create key asset": err, data:null});
                return;
            }
        }

    } catch (err){
        console.log(err);
        res.json({status:"error", "error while uploading": err, data:null});
    }
}