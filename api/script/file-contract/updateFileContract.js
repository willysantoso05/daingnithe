const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

exports.updateFileAsset = async(walletID, userID, fileId, fileName, mimeType, ipfsPath, sharedKey) => {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', '..', 'blockchain', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(walletID);
        if (!identity) {
            console.log(`An identity for the user ${walletID} does not exist in the wallet`);
            console.log('Run the registerUser.js application before retrying');
            throw (`An identity for the user ${walletID} does not exist in the wallet`);
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: walletID, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('basic', 'fileAssetContract');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        let dt = new Date().toString();
        const result = await contract.submitTransaction('UpdateFileAsset', userID, fileId, fileName, mimeType, ipfsPath, sharedKey, dt);
        // console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        throw (error);
    }
}