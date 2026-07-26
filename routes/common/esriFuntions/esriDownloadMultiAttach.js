const esriDownloadAttachmentServer = require("./esriDownloadAttachmentServer")
const esriRequestAttachmentsList = require("./esriRequestAttachmentsList")

module.exports = async function (url, objectIdArray, { token = "", keywords = null, getImagesAsLinks = false, funECode = "" }) {
    if (!objectIdArray.length) return []

    let attachList = await esriRequestAttachmentsList(url, objectIdArray, { token, keywords, funECode })
    if (!attachList.length) {
        return []
    }

    let objIds = []
    let links = []

    attachList.forEach(e => (
        e.attachmentInfos.forEach(a => {
            objIds.push({
                id: e["parentObjectId"],
                data: {
                    id: a.id,
                    name: a.name,
                    type: a.contentType,
                    keywords: a.keywords,
                    size: a.size
                }
            })
            if (getImagesAsLinks) {
                links.push(`${url}/${e["parentObjectId"]}/attachments/${a.id}`)
            } else {
                links.push(esriDownloadAttachmentServer(url, e["parentObjectId"], a.id, { token, funECode}))
            }
        })
    ))

    let attachFiles = await Promise.all(links)
    const idToFile = []
    for (let i = 0, j = attachFiles.length; i < j; i++) {
        idToFile.push({ id: [objIds[i].id], file: attachFiles[i], info: objIds[i].data })
    }

    return idToFile
}

// attachList = [
//     {
//         "parentObjectId": 4059,
//         "parentGlobalId": "{01C9533B-EE10-43F6-B9F1-3602DE4F8E97}",
//         "attachmentInfos": [
//             {
//                 "id": 804,
//             },
//             {
//                 id: 34
//             }