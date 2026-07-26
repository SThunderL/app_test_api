const { default: axios } = require("axios");
const qs = require("qs");
const reply = require("../reply");
const errorCode = "esriDownloadAttachment"
/**
 * Request Attachments List of a Feature
 * @param {String} apiErrorCode Errors: "_ARCLayerError": 424, "_EsriDownloadAttachment_TokenError": 401,
 * "_EsriDownloadAttachment_TokenMissing": 401, "_EsriDownloadAttachment_LayerError": 500
 */
/**
 * 
 * @param {String} url Feature layer URL automatically adds /query at the end
 * @param {string} parentObjectId feature object id
 * @param {string} attachmentId attachment id
 * {object} funECode: default "", token: default "" should be esri token
 * @returns array of objects, {parentObjectId = objectId, attachmentInfos = [{id, name, contentType}]}
 */
module.exports = async function (url, parentObjectId, attachmentId, { token = "", funECode = "" } = {}) {
    try {
        if (url == undefined) throw "URL Undefined";
        let requestedData = {
            f: "json",
            token: token,
        }
        let tableData = await axios({
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            responseType: 'arraybuffer',
            data: qs.stringify(requestedData),
            url: `${url}/${parentObjectId}/attachments/${attachmentId}`,
        })

        if (tableData.data.error) {
            if (tableData.data.error.code === 498) throw reply.error({ errorCode: `${errorCode}_TokenError`, status: 401, message: "Token Error" })
            if (tableData.data.error.code === 499) throw reply.error({ errorCode: `${errorCode}_TokenMissing`, status: 401, message: "Token Missing" })
            throw reply.error({
                errorCode: `${errorCode}_LayerError`, data: tableData.data.error, status: 500, funECode, internalData: {
                    data: tableData.data,
                }
            })
        }

        return JSON.parse(tableData.data.toString()).Attachment
    } catch (err) {
        if (err.isAxiosError) {
            throw reply.error({ errorCode: `${errorCode}_ARCLayerError`, data: err.response.data, status: 424, funECode })
        }
        throw err;
    }
};
