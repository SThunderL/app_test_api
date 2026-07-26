const fs = require("fs")
const getToken = require("./getToken")
const reply = require("../reply")
require('dotenv').config({ path: './config/config.env' })
const pathTokenFolder = "./references/token"
const pathToken = `${pathTokenFolder}/tokenCollection.json`

/**
 * Creates and stores a token locally to be used for most api calls throughout a preselected period of time,
 * this would eleminate the need to generate a new token through esri for every request done by a different API
 * several parameters are used to configure the function
 * referer, expires - token time in mins, requestNewToken = false => if true it would request a new token, storeToken = true => if there is a new token then it is stored on creation.
 * @param {Enumerator} tokenName Should be changed to token type used 
 * @returns {token, expires}
 */
async function manageTokens(tokenName, {
    referer = "",
    expires = process.env.Token_Esri_Life,
    requestNewToken = false,
    storeToken = true
} = {}) {
    if (!tokenInfo[tokenName]) {
        throw reply.error({
            errorCode: "InvalidTokenName",
            message: "This token is invalid",
            status: 500
        })
    }

    if (!fs.existsSync(pathToken)) {
        createTokenFile()
    }

    const tokenCollection = JSON.parse(fs.readFileSync(pathToken, 'utf8'))

    if (requestNewToken) {
        return await refreshToken(tokenName, tokenCollection, referer, expires, storeToken)
    }
    if (!tokenCollection[tokenName]) {
        // create it and add it to the collection
        return await refreshToken(tokenName, tokenCollection, referer, expires, storeToken)
    } else {
        // check expiry
        if (tokenCollection[tokenName].expires < getDate15MinutesAgo().getTime()) {
            // request new token to be generated and rewrite the file
            return await refreshToken(tokenName, tokenCollection, referer, expires, storeToken)
        }
    }

    return tokenCollection[tokenName]
}

const enumTokenNames = {
    admin: "admin",
    lands: "lands",
    asezaOnline: "asezaOnline",
}

module.exports = { manageTokens, enumTokenNames: enumTokenNames }

const tokenInfo = {
    admin: {
        url: `${process.env.URL_BASE}/${process.env.URL_END_TOKEN}`,
        username: process.env.ADMIN_USER_NAME,
        password: process.env.ADMIN_USER_PASS,
        name: "admin"
    },
    lands: {
        url: process.env.URL_LANDS_TOKEN,
        username: process.env.ONLINE_USER_NAME,
        password: process.env.ONLINE_USER_PASS,
        name: "lands"
    },
    asezaOnline: {
        url: process.env.URL_LAYERS_EXTRA_LOGIN,
        username: "portaladmin1",
        // username: process.env.ADMIN_USER_NAME,
        password: process.env.ADMIN_USER_PASS,
        name: "asezaOnline"
    },
}

function getDate15MinutesAgo() {
    const date = new Date()
    date.setMinutes(date.getMinutes() + 15) // Subtract 15 minutes
    return date
}

async function refreshToken(tokenName, tokenCollection, referer, expires, storeToken) {
    const { url, username, password } = tokenInfo[tokenName]
    console.log(url)
    let tokenData = await getToken(url, username, password, referer, expires)
    console.log(tokenData)
    tokenCollection[tokenName] = {
        "token": tokenData.token,
        "expires": tokenData.expires
    }

    if (storeToken) {
        createTokenFile(JSON.stringify(tokenCollection, null, 4))
        // fs.mkdirSync(pathToken, { recursive: true })
        // fs.writeFileSync(pathToken, JSON.stringify(tokenCollection, null, 4))
    }

    return tokenData
}

function createTokenFile(fileInfo = "{}") {
    fs.mkdirSync(pathTokenFolder, { recursive: true })
    fs.writeFileSync(pathToken, fileInfo)
}