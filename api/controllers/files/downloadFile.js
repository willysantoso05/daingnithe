/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const sss = require('shamirs-secret-sharing');
const encryption = require('../../utils/encryption');

const readFileContract = require('../../script/file-contract/readFileContract');
const readKeyContract = require('../../script/key-contract/readKeyContract');
const downloadFileIPFS = require('../../utils/ipfs');
const wallet = require('../../script/wallet');

var stream = require('stream');

exports.downloadFile = async (req, res, next) => {
    const fileId = req.params.fileId;
    const userId = req.user._id;
    const walletId = req.user.username;
    const walletData = req.wallet;

    await wallet.saveWallet(walletData, walletId);

    try {
        let fileAsset = await readFileContract.readFileAsset(walletId, fileId);
        if (!fileAsset) {
            res.status(404).json({status:"ERROR", message: "File asset is not found", data:null});
            wallet.deleteWallet(walletId);
            return;
        }
        fileAsset = JSON.parse(fileAsset);

        let accessUserList = JSON.parse(fileAsset.AccessUserList)
        const ownerKeyId = accessUserList[userId];

        let keyAsset = await readKeyContract.readKeyAsset(walletId, userId, ownerKeyId);
        if (!keyAsset) {
            res.status(404).json({status:"ERROR", message: "Key asset is not found", data:null});
            wallet.deleteWallet(walletId);
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
        var readStream = new stream.PassThrough();
        readStream.end(temp_content);

        res.set('Content-disposition', 'attachment; filename=' + fileAsset.FileName.toString());
        res.set('Content-Type', fileAsset.MimeType.toString());

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