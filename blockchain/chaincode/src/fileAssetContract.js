/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class fileAssetContract extends Contract {

    // CreateFileAsset
    async CreateFileAsset(ctx, fileId, fileName, ipfsPath, publicKey, sharedKey, ownerID, accessUserList) {
        let dt = new Date().toString();

        const fileAsset = {
            ID: fileId,
            FileName: fileName,
            IpfsPath: ipfsPath,
            PublicKey: publicKey,
            SharedKey: sharedKey,
            OwnerID: ownerID,
            AccessUserList: accessUserList,
            CreateDateTime: dt,
            LastUpdated: dt
        };
        ctx.stub.putState(fileId, Buffer.from(JSON.stringify(fileAsset)));
        return JSON.stringify(fileAsset);
    }

    // ReadFileAsset
    async ReadFileAsset(ctx, fileId) {
        const assetJSON = await ctx.stub.getState(fileId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${fileId} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateFileAsset
    async UpdateFileAsset(ctx, userID, fileId, fileName, ipfsPath, publicKey, sharedKey) {
        const assetString = await this.ReadFileAsset(ctx, fileId);

        let dt = new Date().toString();
        let fileAsset;
        try {
            fileAsset = JSON.parse(assetString);

            // Check if user who updates the asset has a permission to update
            if (fileAsset.OwnerID !== userID && fileAsset.GrantedUserList.includes(userID)) {
                throw new Error(` userID = ${userID} has no permission to update`);
            }

            // Update Field
            fileAsset.FileName = fileName;
            fileAsset.IpfsPath = ipfsPath;
            fileAsset.PublicKey = publicKey;
            fileAsset.SharedKey = sharedKey;
            fileAsset.LastUpdated = dt;
        } catch (err) {
            throw new Error(`id = ${fileId} data can't be processed`);
        }

        return ctx.stub.putState(fileId, Buffer.from(JSON.stringify(fileAsset)));
    }

    // UpdateFileAccessAsset for grant or revoke file access 
    async UpdateFileAccessAsset(ctx, userID, fileId, sharedKey, accessUserList) {
        const assetString = await this.ReadFileAsset(ctx, fileId);

        let dt = new Date().toString();
        let fileAsset;
        try {
            fileAsset = JSON.parse(assetString);

            // Check if user who updates the asset has a permission to update
            if (fileAsset.OwnerID !== userID) {
                throw new Error(` userID = ${userID} has no permission to update access`);
            }

            // Update Field
            fileAsset.SharedKey = sharedKey;
            fileAsset.AccessUserList = accessUserList;
            fileAsset.LastUpdated = dt;
        } catch (err) {
            throw new Error(`id = ${fileId} data can't be processed`);
        }

        return ctx.stub.putState(fileId, Buffer.from(JSON.stringify(fileAsset)));
    }

    // DeleteFileAsset
    async DeleteFileAsset(ctx, userID, fileId) {
        const assetString = await this.ReadFileAsset(ctx, fileId);
        let fileAsset;
        try {
            fileAsset = JSON.parse(assetString);

            // Check if user who delete the asset is the owner
            if (fileAsset.OwnerID !== userID) {
                throw new Error(` userID = ${userID} has no permission to delete`);
            }
        } catch (err) {
            throw new Error(`id = ${fileId} data can't be processed`);
        }
        return ctx.stub.deleteState(fileId);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, fileId) {
        const assetJSON = await ctx.stub.getState(fileId);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferFileAsset
    async TransferFileAsset(ctx, userID, fileId, newOwnerID) {
        const assetString = await this.ReadFileAsset(ctx, fileId);

        let dt = new Date().toString();
        let fileAsset;
        try {
            fileAsset = JSON.parse(assetString);

            // Check if user who transfers the asset is the owner
            if (fileAsset.OwnerID !== userID) {
                throw new Error(` userID = ${userID} has no permission to transfer`);
            }

            // Update Owner Field
            fileAsset.OwnerID = newOwnerID;
            fileAsset.LastUpdated = dt;
        } catch (err) {
            throw new Error(`id = ${fileId} data can't be processed`);
        }

        return ctx.stub.putState(fileId, Buffer.from(JSON.stringify(fileAsset)));
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllFileAssets(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (Object.keys(record).length == 9){
                allResults.push({ Key: result.value.key, Record: record });
            }
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = fileAssetContract;