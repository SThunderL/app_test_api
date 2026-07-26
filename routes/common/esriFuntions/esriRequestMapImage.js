const { default: axios } = require("axios")
const qs = require("qs")
const reply = require("../reply")
const errorCode = "esriRequestMapImage"

/**
 * Request Feature layer data
 * Errors: "_ARCLayerError": 500, "_EsriRequestFeatures_TokenError": 401,
 * "_EsriRequestFeatures_TokenMissing": 401, "_EsriLayerRequestError": 500
 * token Esri token
 * webMapAsJson Object Web Map As Json 
 * templateName the name for print template
 * @param {String} url Feature layer URL automatically adds /query at the end
 * groupBy: null, objectIds: null, returnAttributes: true = only attributes are returned }
 * @returns array of valid features
 */
module.exports = async function (url, {
    token = "",
    webMapAsJson = {},
    funECode = ""
} = {}
) {
    try {
        if (url == undefined) {
            throw reply.error({
                errorCode,
                message: "URL Undefined"
            })
        }
        const printOptions = {
            f: "pjson",
            token: token,
            ...webMapAsJson
        }

        let tableData = await axios({
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            data: qs.stringify(printOptions),
            url: url + "/export",
        })
        
        tableData = tableData.data
        if (tableData.error) {
            if (tableData.error.code === 498) throw reply.error({
                errorCode: `${errorCode}_TokenError`,
                status: 401,
                message: "Token Error",
                internalData: {
                    url,
                    printOptions,
                    reply: tableData.error
                }
            })
            if (tableData.error.code === 499) 
                throw reply.error({ errorCode: `${errorCode}_TokenMissing`, status: 401, message: "Token Missing", funECode })
            throw reply.error({
                errorCode: `${errorCode}_LayerError`,
                data: tableData.error,
                status: 500,
                funECode,
                internalData: {
                    url,
                    printOptions,
                    reply: tableData.error
                }
            })
        }

        return tableData
    } catch (err) {

        if (err.isAxiosError) {
            throw reply.error({
                errorCode: `${errorCode}_ARCLayerError`,
                internalData: {
                    url,
                    reply: err.response?.data,
                    response: err.response,
                    webMapAsJson
                },
                status: 424,
                funECode
            })
        }
        throw err
    }
}