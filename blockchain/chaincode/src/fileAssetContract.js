/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class fileAssetContract extends Contract {

    // CreateFileAsset
    async CreateFileAsset(ctx, fileId, fileName, mimeType, ipfsPath, sharedKey, ownerID, accessUserList, dt) {
        const fileAsset = {
            ID: fileId,
            FileName: fileName,
            MimeType: mimeType,
            IpfsPath: ipfsPath,
            SharedKey: sharedKey,
            OwnerID: ownerID,
            AccessUserList: accessUserList,
            CreateDateTime: dt,
            LastUpdated: dt
        };
        await ctx.stub.putState(fileId, Buffer.from(JSON.stringify(fileAsset)));
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
    async UpdateFileAsset(ctx, userID, fileId, fileName, mimeType, ipfsPath, sharedKey, dt) {
        const assetString = await this.ReadFileAsset(ctx, fileId);

        let fileAsset;
        try {
            fileAsset = JSON.parse(assetString);
            let accessUserList = JSON.parse(fileAsset.AccessUserList)

            // Check if user who updates the asset has a permission to update (in granted access)
            if (!accessUserList.hasOwnProperty(userID)) {
                throw new Error(` userID = ${userID} has no permission to update`);
            }

            // Update Field
            fileAsset.FileName = fileName;
            fileAsset.MimeType = mimeType;
            fileAsset.IpfsPath = ipfsPath;
            fileAsset.SharedKey = sharedKey;
            fileAsset.LastUpdated = dt;
        } catch (err) {
            throw new Error(`id = ${fileId} data can't be processed\n ${err}`);
        }

        await ctx.stub.putState(fileId, Buffer.from(JSON.stringify(fileAsset)));
        return JSON.stringify(fileAsset);
    }

    // UpdateFileAccessAsset for grant or revoke file access 
    async UpdateFileAccessAsset(ctx, userID, fileId, sharedKey, accessUserList, dt) {
        const assetString = await this.ReadFileAsset(ctx, fileId);

        let fileAsset;
        try {
            fileAsset = JSON.parse(assetString);

            // Check if user who share access the asset has a permission to update (owner only)
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

        await ctx.stub.putState(fileId, Buffer.from(JSON.stringify(fileAsset)));
        return JSON.stringify(fileAsset);
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
        return await ctx.stub.deleteState(fileId);
    }

    // TransferFileAsset
    async TransferFileAsset(ctx, userID, fileId, newOwnerID, dt) {
        const assetString = await this.ReadFileAsset(ctx, fileId);

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
            throw new Error(`id = ${fileId} data can't be processed\n ${err}`);
        }

        await ctx.stub.putState(fileId, Buffer.from(JSON.stringify(fileAsset)));
        return JSON.stringify(fileAsset);
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

    // GetAssetHistory returns the chain of custody for an asset since issuance.
	async GetFileAssetHistory(ctx, fileID) {

		let resultsIterator = await ctx.stub.getHistoryForKey(fileID);
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
}

module.exports = fileAssetContract;