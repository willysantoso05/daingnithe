/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const crypto = require('crypto');
const sss = require('shamirs-secret-sharing');

const encryption = require('../../utils/encryption');
const ipfs = require('../../utils/ipfs');

const readFileContract = require('../../script/file-contract/readFileContract');
const readKeyContract = require('../../script/key-contract/readKeyContract');
const downloadFileIPFS = require('../../utils/ipfs');

var stream = require('stream');
const PATH = "/testing/";

exports.downloadFile = async (req, res, next) => {
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

        let accessUserList = JSON.parse(fileAsset.AccessUserList)
        const ownerKeyId = accessUserList[userId];

        let keyAsset = await readKeyContract.readKeyAsset(walletId, userId, ownerKeyId);
        if (!keyAsset) {
            res.json({status:"error", message: "key asset not found", data:null});
            return;
        }
        keyAsset = JSON.parse(keyAsset);

        //Create private key
        let shared = []
        shared[0] = Buffer.from(fileAsset.SharedKey.toString(), 'binary');
        shared[1] = Buffer.from(keyAsset.KeyValue.toString(), 'binary');

        const privateKey = sss.combine(shared);
        
        //Get files from IPFS
        const buffer = await downloadFileIPFS.downloadIPFS(fileAsset.IpfsPath.toString());

        //Decrypt file
        const temp_key = encryption.decryptRSA(buffer.slice(0, 684).toString('utf8'), privateKey);
        const temp_iv = buffer.slice(684, 700).toString('utf8');
        const temp_econtent = buffer.slice(700).toString('utf8');
        const temp_ebuf = Buffer.from(temp_econtent, 'hex');
        const temp_content = encryption.decryptAES(temp_ebuf, temp_key, temp_iv);

        //Create download
        // var fileContents = Buffer.from(temp_content, "base64");

        var readStream = new stream.PassThrough();
        readStream.end(temp_content);

        res.set('Content-disposition', 'attachment; filename=' + fileAsset.FileName.toString());
        res.set('Content-Type', fileAsset.MimeType.toString());

        readStream.pipe(res);

        // res.json({status:"success", message: "Downloading File", data:null});
    } catch (err) {
        res.json({status:"error", "error while invoke read file/key asset": err, data:null});
    }
}