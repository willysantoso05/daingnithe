const crypto = require('crypto');

exports.generateKeys = () => {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
		modulusLength: 4096,
		publicKeyEncoding: {
			type: 'pkcs1',
			format: 'pem'
		},
		privateKeyEncoding: {
			type: 'pkcs1',
			format: 'pem',
			cipher: 'aes-256-cbc',
			passphrase: ''
		},
    })

    return {
        "publicKey": publicKey,
        "privateKey": privateKey
    };
}

exports.encryptAES = (buffer, secretKey, iv) => {
	const cipher = crypto.createCipheriv('aes-256-ctr', secretKey, iv);
	const data = cipher.update(buffer);
	const encrypted = Buffer.concat([data, cipher.final()]);
	return encrypted.toString('hex')
}

exports.decryptAES = (buffer, secretKey, iv) => {
	const decipher = crypto.createDecipheriv('aes-256-ctr', secretKey, iv);
	const data = decipher.update(buffer)
	const decrpyted = Buffer.concat([data, decipher.final()]);
	return decrpyted;
}

exports.encryptRSA = (toEncrypt, publicKey) => {
	const buffer = Buffer.from(toEncrypt, 'utf8')
    const encrypted = crypto.publicEncrypt(publicKey, buffer)
    return encrypted.toString('base64')
}

exports.decryptRSA = (toDecrypt, privateKey) => {
	const buffer = Buffer.from(toDecrypt, 'base64')
    const decrypted = crypto.privateDecrypt(
    {
		key: privateKey.toString(),
		passphrase: '',
    },
		buffer,
    )
    return decrypted.toString('utf8')
}