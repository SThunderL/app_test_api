const esriDownloadMultiAttach = require("./esriDownloadMultiAttach")
const esriRequestFeatures = require("./esriRequestFeatures")

module.exports = async (url, {
    // linkAttributeName = "images",
    getImagesAsLinks = false,
    where = "1=1",
    returnDistinctValues = false,
    outFields = "*",
    returnGeometry = false,
    outStatistics = null,
    groupBy = null,
    objectIds = null,
    resultOffset = null,
    resultRecordCount = null,
    orderByFields = null,
    returnIdsOnly = null,
    keywords = null,
    token = "",
    outSR = null,
    funECode = "",
}) => {
    let data = await esriRequestFeatures(url, where, {
        funECode,
        returnDistinctValues,
        outFields,
        resultRecordCount,
        resultOffset,
        objectIds,
        token,
        returnIdsOnly,
        returnGeometry,
        orderByFields,
        outStatistics,
        outSR,
        groupBy
    })

    const linkAttributeName = getImagesAsLinks ? "links" : "images"
    const listByObjectId = {}
    const objArray = data.map(e => {
        e[linkAttributeName] = []
        listByObjectId[e["OBJECTID"]] = e
        return e["OBJECTID"]
    })

    let attachList = await esriDownloadMultiAttach(url, objArray, { token, keywords, getImagesAsLinks, funECode })
    if (getImagesAsLinks) {
        attachList.forEach(i => {
            listByObjectId[i.id][linkAttributeName].push({
                info: i.info,
                link: i.file,
            })
        })
    } else {
        attachList.forEach(i => {
            listByObjectId[i.id][linkAttributeName].push({
                info: i.info,
                file: i.file,
            })
        })
    }

    return data
}