const ipfsClient = require('ipfs-http-client');
const { globSource } = ipfsClient;
const ipfsEndPoint = 'http://localhost:5001'
const ipfs = ipfsClient(ipfsEndPoint);

const crypto = require('crypto');

const {encryptAES, decryptAES, encryptRSA, decryptRSA} = require("./encryption");

async function uploadFileEncrypted(bufferFile, ipfspath) {
    try {
        const key = crypto.randomBytes(16).toString('hex'); // 16 bytes -> 32 chars
        const iv = crypto.randomBytes(8).toString('hex');   // 8 bytes -> 16 chars
        const ekey = encryptRSA(key); // 32 chars -> 684 chars
        const ebuff = encryptAES(bufferFile, key, iv);  
        const content = Buffer.concat([ // headers: encrypted key and IV (len: 700=684+16)
            Buffer.from(ekey, 'utf8'),   // char length: 684
            Buffer.from(iv, 'utf8'),     // char length: 16
            Buffer.from(ebuff, 'utf8')
        ]);
    
        await ipfs.files.write(
            ipfspath,
            content,
            {create: true, parents: true}
        );

        console.log('ENCRYPTION --------');
        console.log('key:', key, 'iv:', iv, 'ekey:', ekey.length);
        console.log('contents:', buff.length, 'encrypted:', ebuff.length);
        console.log(' ');

    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function downloadFileEncrypted(ipfspath) {
    try {
        let file_data = await ipfs.files.read(ipfspath);

        let edata = [];
        for await (const chunk of file_data)
            edata.push(chunk);
        edata = Buffer.concat(edata);

        const key = decryptRSA(edata.slice(0, 684).toString('utf8'));
        const iv = edata.slice(684, 700).toString('utf8');
        const econtent = edata.slice(700).toString('utf8');
        const ebuf = Buffer.from(econtent, 'hex');
        const content = decryptAES(ebuf, key, iv);
        
        console.log(' ');
        console.log('DECRYPTION --------');
        console.log('key:', key, 'iv:', iv);
        console.log('contents:', content.length, 'encrypted:', econtent.length);
        console.log('downloaded:', edata.length);

        return content;

    } catch (err) {
        console.log(err);
        throw err;
    }
}

module.exports.uploadFileEncrypted = uploadFileEncrypted;
module.exports.downloadFileEncrypted = downloadFileEncrypted;