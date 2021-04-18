/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const fileAssetTransfer = require('fileAssetTransfer');
const keyAssetTransfer = require('keyAssetTransfer');

module.exports.FileAssetTransfer = fileAssetTransfer;
module.exports.KeyAssetTransfer = keyAssetTransfer;

module.exports.contracts = [fileAssetTransfer, keyAssetTransfer];
