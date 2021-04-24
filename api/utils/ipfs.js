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

// async function downloadFileEncrypted(ipfspath) {
//     try {
//         let file_data = await ipfs.files.read(ipfspath);

//         let edata = [];
//         for await (const chunk of file_data)
//             edata.push(chunk);
//         edata = Buffer.concat(edata);

//         const key = decryptRSA(edata.slice(0, 684).toString('utf8'));
//         const iv = edata.slice(684, 700).toString('utf8');
//         const econtent = edata.slice(700).toString('utf8');
//         const ebuf = Buffer.from(econtent, 'hex');
//         const content = decryptAES(ebuf, key, iv);
        
//         console.log(' ');
//         console.log('DECRYPTION --------');
//         console.log('key:', key, 'iv:', iv);
//         console.log('contents:', content.length, 'encrypted:', econtent.length);
//         console.log('downloaded:', edata.length);

//         return content;

//     } catch (err) {
//         console.log(err);
//         throw err;
//     }
// }