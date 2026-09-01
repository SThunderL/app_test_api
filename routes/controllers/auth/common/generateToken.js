const { default: axios } = require("axios")
const qs = require("qs")
const reply = require("../../../common/reply")

const url = process.env.URL_LANDS_TOKEN
const username = process.env.ONLINE_USER_NAME
const password = process.env.ONLINE_USER_PASS
/**
 * generates esri token
 * @returns object containing an active esri token
 */
module.exports = async function ({ ip = "", referer = "" } = {}) {
    let data = {
        "username": username,
        "password": password,
        "referer":  referer,
        "client": referer? "referer": "ip",
        "ip": ip,
        "expiration": 600,
        "f": "json"
    }

    data = qs.stringify(data)
    try {
        let esriToken = await axios.post(url, data)
        if (esriToken.data.error) throw reply.error({ errorCode: `GenerateToken`, data: esriToken.data.error })
        return esriToken.data
    } catch (err) {
        // if (esriToken.data.error) throw reply.error({ errorCode: `GenerateToken`, data: esriToken.data.error })
        throw err
    }
}
