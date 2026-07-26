const esriAddAttachments = require("./esriAddAttachments")

/**
 * 
 * @param {String} url esri layer link
 * @param {String} objectId feature objectId
 * @param {Object} attachArray array of objects as follows 
 * @returns 
 */
module.exports = async function (
    url, objectId, attachments,
    {
        funECode = "",
        token = ""
    } = {}
) {
    let attachArray = []
    if (attachments && attachments.length) {
        for (const e of attachments) {
            attachArray.push(await esriAddAttachments(url, e, objectId, { funECode, token }))
        }
    }
    let result = await Promise.all(attachArray)
    return result
}
