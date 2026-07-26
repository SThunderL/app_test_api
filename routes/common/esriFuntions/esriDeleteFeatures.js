const { default: axios } = require("axios")
const qs = require("qs")
const reply = require("../reply")
const errorCode = "DeleteFeatures"

/**
 * 
 * @param {String} url feature layer url
 * {Array} objectIds array of object ids to be deleted
 * {Array} where string
 * @returns object containing {success: true/false}
 */
module.exports = async function (url, { objectIds = [], where = "", token = "", funECode = "" } = {}) {
    try {
        let requestedData = {
            "f": "json",
            "token": token
        }
        if (objectIds) {
            requestedData["objectIds"] = objectIds.join(', ')
        }
        if (where) {
            requestedData["where"] = where
        }
        let tableData = await axios({
            "method": "POST",
            "headers": { "content-type": "application/x-www-form-urlencoded" },
            "data": qs.stringify(requestedData),
            "url": url + '/deleteFeatures'
        })


        if (tableData.data.error) {
            if (tableData.data.error.code === 498) throw reply.error({ errorCode: `${errorCode}_TokenError`, status: 401, message: "Token Error" })
            if (tableData.data.error.code === 499) throw reply.error({ errorCode: `${errorCode}_TokenMissing`, status: 401, message: "Token Missing" })

            throw reply.error({
                errorCode: `${errorCode}_DeleteLayerError`,
                data: tableData.error,
                status: 500,
                funECode,
                internalData: {
                    url,
                    requestedData,
                    reply: tableData.error
                }
            })
        }

        tableData = tableData.data
        return tableData
    } catch (err) {
        console.log("error delete")
        if (err.isAxiosError)
            throw reply.error({ errorCode: `${errorCode}_ARCLayerError`, data: err.data, status: 424, funECode })
        // console.log(err)
        throw err
    }
}