const ipfsClient = require('ipfs-http-client');
const { globSource } = ipfsClient;
const ipfsEndPoint = 'http://localhost:5001'
const ipfs = ipfsClient(ipfsEndPoint);

exports.uploadIPFS = async (ipfspath, bufferFile) => {
    try{
        await ipfs.files.write(
            ipfspath,
            bufferFile,
            {create: true, parents: true}
        );
    } catch (err) {
        console.log(err);
        throw (err);
    }
}

exports.downloadIPFS = async (ipfspath) => {
    try {
        let file_data = await ipfs.files.read(ipfspath);

        let edata = [];
        for await (const chunk of file_data)
            edata.push(chunk);
        edata = Buffer.concat(edata);

        return edata;

    } catch (err) {
        console.log(err);
        throw err;
    }
}