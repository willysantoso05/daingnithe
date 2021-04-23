/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class fileAssetContract extends Contract {

    // CreateFileAsset
    async CreateFileAsset(ctx, id, fileName, hashIPFS, ownerID, publicKey, sharedKey, grantedUserList) {
        let dt = new Date().toString();

        const fileAsset = {
            ID: id,
            FileName: fileName,
            HashIPFS: hashIPFS,
            OwnerID: ownerID,
            PublicKey: publicKey,
            SharedKey: sharedKey,
            GrantedUserList: grantedUserList,
            CreateDateTime: dt,
            LastUpdated: dt
        };
        ctx.stub.putState(id, Buffer.from(JSON.stringify(fileAsset)));
        return JSON.stringify(fileAsset);
    }

    // ReadFileAsset
    async ReadFileAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateFileAsset
    async UpdateFileAsset(ctx, userID, id, fileName, hashIPFS, publicKey, sharedKey) {
        const assetString = await this.ReadAsset(ctx, id);

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
            fileAsset.HashIPFS = hashIPFS;
            fileAsset.PublicKey = publicKey;
            fileAsset.SharedKey = sharedKey;
            fileAsset.LastUpdated = dt;
        } catch (err) {
            throw new Error(`id = ${id} data can't be processed`);
        }

        return ctx.stub.putState(id, Buffer.from(JSON.stringify(fileAsset)));
    }

    // UpdateFileAccessAsset for grant or revoke file access 
    async UpdateFileAccessAsset(ctx, userID, id, sharedKey, grantedUserList) {
        const assetString = await this.ReadAsset(ctx, id);

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
            fileAsset.GrantedUserList = grantedUserList;
            fileAsset.LastUpdated = dt;
        } catch (err) {
            throw new Error(`id = ${id} data can't be processed`);
        }

        return ctx.stub.putState(id, Buffer.from(JSON.stringify(fileAsset)));
    }

    // DeleteFileAsset
    async DeleteFileAsset(ctx, userID, id) {
        const assetString = await this.ReadAsset(ctx, id);
        let fileAsset;
        try {
            fileAsset = JSON.parse(assetString);

            // Check if user who delete the asset is the owner
            if (fileAsset.OwnerID !== userID) {
                throw new Error(` userID = ${userID} has no permission to delete`);
            }
        } catch (err) {
            throw new Error(`id = ${id} data can't be processed`);
        }
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferFileAsset
    async TransferAsset(ctx, userID, id, newOwnerID) {
        const assetString = await this.ReadAsset(ctx, id);

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
            throw new Error(`id = ${id} data can't be processed`);
        }

        return ctx.stub.putState(id, Buffer.from(JSON.stringify(fileAsset)));
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
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
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = fileAssetContract;