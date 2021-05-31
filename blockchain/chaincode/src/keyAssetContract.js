/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class keyAssetContract extends Contract {

    // CreateKeyAsset
    async CreateKeyAsset(ctx, id, ownerKeyID, fileID, ownerFileID, fileVersion, keyValue, dt) {
        const keyAsset = {
            ID: id,
            OwnerKeyID: ownerKeyID,
            FileID: fileID,
            OwnerFileID: ownerFileID,
            FileVersion: fileVersion,
            KeyValue: keyValue,
            CreateDateTime: dt,
            LastUpdated: dt
        };
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(keyAsset)));
        return JSON.stringify(keyAsset);
    }

    // ReadKeyAsset
    async ReadKeyAsset(ctx, userID, id) {
        let assetJSON = await ctx.stub.getState(id);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }

        try{
            assetJSON = assetJSON.toString();
            // Check if user who read the asset has a permission to read (only ownerkey)
            if (JSON.parse(assetJSON).OwnerKeyID !== userID && JSON.parse(assetJSON).OwnerFileID !== userID) {
                throw new Error(` userID = ${userID} has no permission to read`);
            }
            return assetJSON;
        } catch (err) {
            throw new Error(`The asset ${id} does not exist`);
        }
    }

    // UpdateKeyAsset
    async UpdateKeyAsset(ctx, userID, id, fileVersion, keyValue, dt) {
        try{
            const assetString = await this.ReadKeyAsset(ctx, userID, id);
    
            let keyAsset;
            try {
                keyAsset = JSON.parse(assetString);
    
                // Check if user who updates the asset has a permission to update
                if (keyAsset.OwnerFileID !== userID) {
                    throw new Error(` userID = ${userID} has no permission to update`);
                }
    
                // Update KeyValue Field
                keyAsset.FileVersion = fileVersion;
                keyAsset.KeyValue = keyValue;
                keyAsset.LastUpdated = dt;
            } catch (err) {
                throw new Error(`id = ${id} data can't be processed`);
            }
    
            await ctx.stub.putState(id, Buffer.from(JSON.stringify(keyAsset)));
            return JSON.stringify(keyAsset);

        } catch (err) {
            throw new Error(`The asset ${id} does not exist`);
        }
    }

    // DeleteKeyAsset
    async DeleteKeyAsset(ctx, userID, id) {
        const assetString = await this.ReadKeyAsset(ctx, userID, id);
        let keyAsset;
        try {
            keyAsset = JSON.parse(assetString);

            // Check if user who delete the asset is the owner
            if (keyAsset.OwnerFileID !== userID) {
                throw new Error(` userID = ${userID} has no permission to delete`);
            }
        } catch (err) {
            throw new Error(`id = ${id} data can't be processed`);
        }
        return await ctx.stub.deleteState(id);
    }

    // GetKeyAssetHistory returns the chain of custody for an asset since issuance.
	async GetKeyAssetHistory(ctx, id) {

		let resultsIterator = await ctx.stub.getHistoryForKey(id);
		let results = await this.GetAllResults(resultsIterator, true);

		return JSON.stringify(results);
	}

    async GetAllResults(iterator, isHistory) {
		let allResults = [];
		let res = await iterator.next();
		while (!res.done) {
			if (res.value && res.value.value.toString()) {
				let jsonRes = {};
				console.log(res.value.value.toString('utf8'));
				if (isHistory && isHistory === true) {
					jsonRes.TxId = res.value.tx_id;
					jsonRes.Timestamp = res.value.timestamp;
					try {
						jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
					} catch (err) {
						console.log(err);
						jsonRes.Value = res.value.value.toString('utf8');
					}
				} else {
					jsonRes.Key = res.value.key;
					try {
						jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
					} catch (err) {
						console.log(err);
						jsonRes.Record = res.value.value.toString('utf8');
					}
				}
				allResults.push(jsonRes);
			}
			res = await iterator.next();
		}
		iterator.close();
		return allResults;
	}

    //DEBUG ONLY
    // GetAllAssets returns all assets found in the world state.
    async GetAllKeyAssets(ctx) {
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
            if (Object.keys(record).length == 8){
                allResults.push({ Key: result.value.key, Record: record });
            }
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = keyAssetContract;