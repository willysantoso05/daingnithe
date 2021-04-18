/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class keyAssetContract extends Contract {

    // CreateKeyAsset
    async CreateKeyAsset(ctx, id, ownerKeyID, fileID, ownerFileID, keyValue){
        let dt = new Date().toString();
        
        const keyAsset = {
            ID: id, 
            OwnerKeyID: ownerKeyID,
            FileID: fileID,
            OwnerFileID: ownerFileID,
            KeyValue: keyValue,
            CreateDateTime: dt,
            LastUpdated: dt
        };
        ctx.stub.putState(id, Buffer.from(JSON.stringify(keyAsset)));
        return JSON.stringify(fileAsset);
    }

    // ReadKeyAsset
    async ReaeKeyAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateKeyAsset
    async UpdateKeyAsset(ctx, userID, id, keyValue) {
        const assetString = await this.ReadAsset(ctx, id);
        
        let dt = new Date().toString();
        let keyAsset;
        try{
            keyAsset = JSON.parse(assetString);
            
            // Check if user who updates the asset has a permission to update
            if(keyAsset.OwnerFileID !== userID) {
                throw new Error(` userID = ${userID} has no permission to update`);
            }

            // Update KeyValue Field
            keyAsset.KeyValue = keyValue;
            keyAsset.LastUpdated = dt;
        } catch (err) {
            throw new Error(`id = ${id} data can't be processed`);
        }

        return ctx.stub.putState(id, Buffer.from(JSON.stringify(keyAsset)));
    }

    // DeleteKeyAsset
    async DeleteKeyAsset(ctx, userID, id) {
        const assetString = await this.ReadAsset(ctx, id);
        let keyAsset;
        try{
            keyAsset = JSON.parse(assetString);
            
            // Check if user who delete the asset is the owner
            if(record.OwnerFileID !== userID) {
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

    // // GetAllAssets returns all assets found in the world state.
    // async GetAllAssets(ctx) {
    //     const allResults = [];
    //     // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    //     const iterator = await ctx.stub.getStateByRange('', '');
    //     let result = await iterator.next();
    //     while (!result.done) {
    //         const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
    //         let record;
    //         try {
    //             record = JSON.parse(strValue);
    //         } catch (err) {
    //             console.log(err);
    //             record = strValue;
    //         }
    //         allResults.push({ Key: result.value.key, Record: record });
    //         result = await iterator.next();
    //     }
    //     return JSON.stringify(allResults);
    // }


}

module.exports = keyAssetContract;
