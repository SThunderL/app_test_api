const { default: axios } = require("axios");
const qs = require("qs");
const reply = require("../reply");
const errorCode = "EsriRequestAttachmentsList"

/**
 * Request Attachments List of a Feature
 * @param {String} apiErrorCode Errors: "_ARCLayerError": 424, "_EsriAttachmentsList_TokenError": 401,
 * "_EsriAttachmentsList_TokenMissing": 401, "_EsriAttachmentsList_LayerError": 500
 */

/**
 * 
 * @param {String} url Feature layer URL automatically adds /query at the end
 * @param {Array} objectIds features object ids
 * {object} funECode: default "", token: default "" should be esri token, keywords: (optional) string
 * @returns array of objects, {parentObjectId = objectId, attachmentInfos = [{id, name, contentType}]}
 */
module.exports = async function (url, objectIds, { funECode = "", token = "", keywords = null } = {}) {
    try {
        if (url == undefined) throw "URL Undefined";
        let requestedData = {
            objectIds: objectIds.join(', '),
            keywords,
            f: "json",
            token: token,
        };
        let tableData = await axios({
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            data: qs.stringify(requestedData),
            url: url + "/queryAttachments",
        });

        if (tableData.data.error) {
            if (tableData.data.error.code === 498) throw reply.error({ errorCode: `${errorCode}_TokenError`, status: 401, message: "Token Error" })
            if (tableData.data.error.code === 499) throw reply.error({ errorCode: `${errorCode}_TokenMissing`, status: 401, message: "Token Missing" })
            throw reply.error({
                errorCode: `${errorCode}_LayerError`,
                data: tableData.error,
                status: 500,
                funECode,
                internalData: {
                    url,
                    requestedData,
                    response: tableData.error,
                    message: "Check if has attachments is true"
                }
            })
        }

        return tableData.data.attachmentGroups;
    } catch (err) {
        if (err.isAxiosError) {
            throw reply.error({ errorCode: `${errorCode}_ARCLayerError`, data: err.response.data, status: 424, funECode })
        }
        throw err;
    }
};
