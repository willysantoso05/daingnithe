/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const fileAssetContract = require('./src/fileAssetContract');
const keyAssetContract = require('./src/keyAssetContract');

module.exports.FileAssetContract = fileAssetContract;
module.exports.KeyAssetContract = keyAssetContract;

module.exports.contracts = [fileAssetContract, keyAssetContract];