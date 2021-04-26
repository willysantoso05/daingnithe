/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {v4 : uuidv4} = require('uuid')
const crypto = require('crypto');
const sss = require('shamirs-secret-sharing');

const encryption = require('../../utils/encryption');
const ipfs = require('../../utils/ipfs');
const createFileContract = require('../../script/file-contract/createFileContract');
const createKeyContract = require('../../script/key-contract/createKeyContract');

const PATH = "/testing/";

exports.uploadFile = async (req, res, next) => {
    console.log(req.files.file);
    const fileName = req.files.file.name;
    const bufferFile = req.files.file.data;
    const userId = req.user._id;
    const walletId = req.user.username;

    try{
        //generate file id
        const fileID = "FILE_" + uuidv4().toString();
        const keyID = "KEY_" + uuidv4().toString();

        let grantedUserList = {};
        grantedUserList[userId] = keyID;
        // let grantedUserList = [jsonObj];

        const ipfsPath = PATH + fileID + ".data";
    
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
        ])

        //generate shared key
        const secret = Buffer.from(privateKey)
        const shares = sss.split(secret, { shares: 2, threshold: 2 })

        //upload to IPFS
        ipfs.uploadIPFS(ipfsPath, content);

        //create file transaction
        try {
            console.log("---CREATE FILE ASSET");
            createFileContract.createFileAsset(walletId, fileID, fileName, ipfsPath, publicKey, shares[0].toString('binary'), userId, JSON.stringify(grantedUserList));
        } catch (err) {
            res.json({status:"error", "error while invoke create file asset": err, data:null});
            return;
        }

        //create key transaction
        try {
            console.log("---CREATE KEY ASSET");
            createKeyContract.createKeyAsset(walletId, keyID, userId, fileID, userId, shares[1].toString('binary'));
        } catch (err) {
            res.json({status:"error", "error while invoke create key asset": err, data:null});
            return;
        }

        res.json({
            status:"success",
            message: "uploading to IPFS",
            data:{
                FileID : fileID,
                OwnerID : userId,
                GrantedUserList : grantedUserList
            }
        });
    } catch (err){
        console.log(err);
        res.json({status:"error", "error while uploading": err, data:null});
    }
}