const fs = require('fs')
const path = require('path');

exports.saveWallet = async (walletData, walletID) => {
    filePath = path.join(process.cwd(), 'wallet')+`/${walletID}.id`;
    console.log(filePath);
    await fs.writeFile(filePath, walletData, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    });
};

exports.deleteWallet = (walletID) => {
    filePath = path.join(process.cwd(), 'wallet')+`/${walletID}.id`;
    
    fs.unlink(filePath, function(){
        console.log(`Wallet ${walletID} was deleted`) // Callback
    });
}