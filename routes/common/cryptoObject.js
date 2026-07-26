const crypto = require('crypto')
const reply = require('./reply')

function encrypt(dataObject) {
    try {
        let encrypt = crypto.createCipheriv(process.env.CRYPTO_ALGORITHM, process.env.CRYPTO_KEY, process.env.CRYPTO_IV)
        let encrypted = encrypt.update(JSON.stringify(dataObject), 'utf8', 'base64')
        encrypted += encrypt.final('base64')

        return encrypted
    } catch (err) {
        throw reply.error({ errorCode: "CipherError", message: "Unable to cipher object", status: 500, internalData: err })
    }
}
function decrypt(dataString) {
    try {
        let deEncrypt = crypto.createDecipheriv(process.env.CRYPTO_ALGORITHM, process.env.CRYPTO_KEY, process.env.CRYPTO_IV)
        let deKey = deEncrypt.update(dataString, 'base64', 'utf8')
        deKey += deEncrypt.final('utf8')

        return JSON.parse(deKey)
    } catch (err) {
        throw reply.error({ errorCode: "DecipherError", message: "Unable to decipher string", status: 500, internalData: err })
    }
}

module.exports = { encrypt: encrypt, decrypt }