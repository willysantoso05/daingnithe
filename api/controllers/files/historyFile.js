'use strict';

const historyFileContract = require('../../script/file-contract/historyFileContract');
const wallet = require('../../script/wallet');

exports.historyFile = async (req,res) => {
    const walletId = req.user.username;
    const fileId = req.params.fileId;
    const walletData = req.wallet;

    await wallet.saveWallet(walletData, walletId);
    
    try {
        let result = await historyFileContract.historyFileAsset(walletId, fileId);

        if(!result){
            res.json({status:"SUCCESS", message: "Get history file asset", data:null});
            wallet.deleteWallet(walletId);
            return;
        }
        
        let data = JSON.parse(result);
        
        if (data.length==0) {
            res.json({status:"SUCCESS", message: "Get history file asset", data:null});
            wallet.deleteWallet(walletId);
            return;
        } else {
            let temp = [];
            for(let i=0; i<data.length; i++){
                temp[i] = {
                    Timestamp: data[i].Timestamp.seconds,
                    ID : data[i].Value.ID,
                    FileName : data[i].Value.FileName,
                    OwnerID : data[i].Value.OwnerID,
                    AccessUserList : JSON.parse(data[i].Value.AccessUserList)
                }
            }
            res.json({status:"SUCCESS", message: "Get history file asset", data:temp});
        }
    } catch (err) {
        res.json({status:"ERROR", message: err, data:null});
    }
    wallet.deleteWallet(walletId);
};