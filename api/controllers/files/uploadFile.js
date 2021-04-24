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
const createFileContract = require('../../script/file-contract/createFileContract');
const createKeyContract = require('../../script/key-contract/createKeyContract');

const PATH = "/testing/";

exports.uploadFile = async (req, res, next) => {
    console.log(req.files.file);
    const fileName = req.files.file.name;
    const bufferFile = req.files.file.data;
    const userId = req.user._id;
    const walletId = req.user.username;
    console.log(userId)

    try{
        //generate file id
        const fileID = uuidv4()
        console.log(fileID);

        const ipfsPath = PATH + fileID.toString() + ".data";
    
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

        // const temp_key = encryption.decryptRSA(content.slice(0, 684).toString('utf8'), privateKey)
        // const temp_iv = content.slice(684, 700).toString('utf8')
        // const temp_econtent = content.slice(700).toString('utf8')
        // const temp_ebuf = Buffer.from(temp_econtent, 'hex')
        // const temp_content = encryption.decryptAES(temp_ebuf, temp_key, temp_iv)

        //generate shared key
        const secret = Buffer.from(privateKey)
        const shares = sss.split(secret, { shares: 2, threshold: 2 })

        //upload to IPFS
        ipfs.uploadIPFS(ipfsPath, content);

        //create file transaction
        try {
            createFileContract.createFileAsset(walletId, fileID, fileName, ipfsPath, publicKey, shares[0], userId, JSON.stringify("[]"));
        } catch (err) {
            res.json({status:"error", "error while invoke create file asset": err, data:null});
        }

        const keyID = "KEY_" + uuidv4().toString();

        //create key transaction
        try {
            createKeyContract.createKeyAsset(walletId, keyID, userId, fileID, userId, shares[1]);
        } catch (err) {
            res.json({status:"error", "error while invoke create key asset": err, data:null});
        }

        res.json({status:"success", message: "uploading to IPFS", data:null});
    } catch (err){
        console.log(err);
        res.json({status:"error", "error while uploading to IPFS": err, data:null});
    }
}