const { default: axios } = require("axios")
const qs = require("qs")
const reply = require("../reply")
const errorCode = "DeleteFeatureAttachments"

/**
 * 
 * @param {String} url feature url to remove attachments from
 * objectId: required, attachmentIds: required,
 * @returns [{ "objectId": 1207, "success": true }]
 */
module.exports = async function (url, { objectId = "", attachmentIds = [], rollBackOnFailure = true, token = "", funECode = "" } = {}) {
    try {
        if (!objectId) {
            throw reply.error({
                errorCode: `${errorCode}_FeatureObjectId`,
                message: "Please provide a feature object Id remove attachments from"
            })
        }

        let requestedData = {
            "f": "json",
            "token": token,
            rollBackOnFailure,
            attachmentIds: attachmentIds.join(",")
        }
        let tableData = await axios({
            "method": "POST",
            "headers":  { "content-type": "application/x-www-form-urlencoded" },
            "data": qs.stringify(requestedData),
            "url": `${url}/${objectId}/deleteAttachments`
        })

        if (tableData.data.error) {
            if (tableData.data.error.code === 498) throw reply.error({ errorCode: `${errorCode}_TokenError`, status: 401, message: "Token Error" })
            if (tableData.data.error.code === 499) throw reply.error({ errorCode: `${errorCode}_TokenMissing`, status: 401, message: "Token Missing" })

            throw reply.error({
                errorCode: `${errorCode}_AttachLayerError`,
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
        tableData = tableData.data.deleteAttachmentResults
        return tableData
    } catch (err) {
        console.log("error delete")
        if (err.isAxiosError)
            throw reply.error({ errorCode: `${errorCode}_ARCLayerError`, data: err.data, status: 424, funECode })
        throw err
    }
}