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
    const fileName = req.files.file.name;
    const mimeType = req.files.file.mimetype;
    const bufferFile = req.files.file.data;
    const userId = req.user._id;
    const walletId = req.user.username;

    try{
        //generate file id
        const fileID = "FILE_" + uuidv4().toString();
        const keyID = "KEY_" + uuidv4().toString();

        let grantedUserList = {};
        grantedUserList[userId] = keyID;

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
            await createFileContract.createFileAsset(walletId, fileID, fileName, mimeType, ipfsPath, shares[0].toString('binary'), userId, JSON.stringify(grantedUserList));
        } catch (err) {
            res.json({status:"ERROR", message: `Error while invoking file asset\n ${err}`, data:null});
            return;
        }

        //create key transaction
        try {
            console.log("---CREATE KEY ASSET");
            await createKeyContract.createKeyAsset(walletId, keyID, userId, fileID, userId, shares[1].toString('binary'));
        } catch (err) {
            res.json({status:"ERROR", message: `Error while invoking key asset\n ${err}`, data:null});
            return;
        }

        res.json({
            status:"SUCCESS",
            message: "Uploading file to IPFS",
            data:{
                FileID : fileID,
                OwnerID : userId,
                GrantedUserList : grantedUserList
            }
        });
    } catch (err){
        res.json({status:"ERROR", message: `Error while invoking file asset\n ${err}`, data:null});
    }
}