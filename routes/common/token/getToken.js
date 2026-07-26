const { default: axios } = require("axios")
const qs = require("qs")
const reply = require("../reply")

/**
 * generates esri token
 * Errors: "_GenerateToken": 400
 * @param {String} username esri login username
 * @param {String} password esri login password
 * @returns object containing an active esri token
 */
module.exports = async function (url, username, password, referer, expireInMins = 300) {
    let data = qs.stringify({
        "username": username,
        "password": password,
        // "referer": referer? referer: process.env.ESRI_REFERER,
        "client": "requestIp",
        "ip": referer,
        "expiration": expireInMins || process.env.Token_Esri_Life,
        "f": "json"
    })
    let esriToken = await axios.post(url, data)
    if (esriToken.data.error) {
        throw reply.error({ errorCode: "GenerateToken", status: 500, message: "خطأ في الدخول", internalData: esriToken.data.error, data: esriToken.data })
    }
    return esriToken.data
}