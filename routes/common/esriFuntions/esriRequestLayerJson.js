const { default: axios } = require("axios");
const qs = require("qs");
const reply = require("../reply");
const errorCode = "EsriRequestJson"
/**
 * Request Feature layer data
 * @param {String} apiErrorCode Errors: 
  "_EsriRequestJson_TokenError": 401,
  "_EsriRequestJson_TokenMissing": 401, 
  "_EsriRequestJson_Error": 500

 */
/**
 * Requests Feature layer json data
 * Errors: "_EsriRequestJson_TokenError": 401, "_EsriRequestJson_TokenMissing": 401, 
 * "_EsriRequestJson_Error": 500, "_ARCLayerError": 424, 
 * @param {String} url Feature layer URL automatically adds /query at the end
 * {object} funECode: default "", token: default "" should be esri token
 * @returns feature layer object
 */
module.exports = async function (url, { funECode = "", token = "" } = {}) {
    try {
        if (url == undefined) throw "URL Undefined";
        let requestedData = {
            f: "json",
            token: token,
        }
        let tableData = await axios({
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            data: qs.stringify(requestedData),
            url: url,
        });

        if (tableData.data.error) {
            if (tableData.data.error.code === 498) throw reply.error({ errorCode: `${errorCode}_TokenError`, status: 401, message: "Token Error" })
            if (tableData.data.error.code === 499) throw reply.error({ errorCode: `${errorCode}_TokenMissing`, status: 401, message: "Token Missing" })
            throw reply.error({
                errorCode: `${errorCode}_Error`,
                data: tableData.data.error,
                status: 500,
                funECode,
                internalData: {
                    url,
                    requestedData,
                    reply: tableData.data.error
                }
            })
            throw reply.error({ errorCode: `${errorCode}_Json_Error`, data: tableData.data.error, status: 500, funECode })
        }

        return tableData.data
    } catch (err) {
        if (err.isAxiosError) {
            throw reply.error({ errorCode: `${errorCode}_ARCLayerError`, data: err.response?.data, status: 424, funECode })
        }
        throw err
    }
}
