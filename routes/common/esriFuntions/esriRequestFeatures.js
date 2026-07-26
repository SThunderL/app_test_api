const { default: axios } = require("axios")
const qs = require("qs")
const reply = require("../reply")
const errorCode = "esriRequestFeatures"

/**
 * 
 * @param {String} url Feature layer URL automatically adds /query at the end
 * @param {String} where Valid SQL where statment
 * {Object} returnDistinctValues: false, If true, it returns distinct values based on the fields specified in outFields.
 * {Object} outFields
 * {Object} returnGeometry 
 * {Object} outStatistics
 * {Array} objectIds array of object ids
 * {Object} groupBy
 * {Object} returnAttributes 
 * {Object} orderByFields field ASC or DESC => FieldName ASC
 * {Object} options other options to add { outFields: "*", returnGeometry: false, outStatistics: null,
 * groupBy: null, objectIds: null, returnAttributes: true = only attributes are returned, 
 * resultOffset = skips the specified number of records and starts from the next record after them, used with resultRecordCount
 * resultRecordCount = max records returned, returnIdsOnly = only returns objectIds }
 * {Object} token = "" Esri token,
 * {Object} returnCountOnly = false, if ture all other data will be ignored
 * {Object} funECode = ""
 * @returns array of valid features
 */
module.exports = async function (url, where = "1=1",
    {
        returnDistinctValues = false,
        outFields = "*",
        returnGeometry = false,
        returnExtentOnly = false,
        outStatistics = null,
        geometry = null,
        groupBy = null,
        objectIds = null,
        returnAttributes = true,
        resultOffset = null,
        resultRecordCount = null,
        orderByFields = null,
        returnIdsOnly = null,
        outSR = null,
        token = "",
        returnCountOnly = false,
        funECode = "",
        logData = false,
    } = {}
) {
    let requestedData = {
        returnDistinctValues,
        outStatistics,
        groupByFieldsForStatistics: groupBy,
        outFields: outFields,
        returnGeometry: returnGeometry,
        geometry: geometry,
        returnExtentOnly: returnExtentOnly,
        where: where,
        orderByFields: orderByFields,
        resultRecordCount: resultRecordCount,
        returnIdsOnly: returnIdsOnly,
        returnCountOnly,
        resultOffset,
        outSR,
        f: "json",
        token,
    }
    // let requestedData = Object.fromEntries(Object.entries(requestedDataNotClean).filter(([_, v]) => v != null)) // ? remove nulls
    try {
        if (url == undefined) throw "URL Undefined"
        if (objectIds && objectIds.length)
            requestedData["objectIds"] = objectIds.join(", ")

        let tableData = await axios({
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            data: qs.stringify(requestedData),
            url: url + "/query",
        })
        tableData = tableData.data
        if (!tableData) {
            throw reply.error({ errorCode: `${errorCode}_LayersAreDown`, data: tableData.error, status: 500, massage: "Database is down" })
        }
        if (logData) {
            console.log("url   -> ", url)
            console.log("where -> ", where)
            console.log('Data ---- ')
            console.log(tableData)
            console.log('==== ---- ')
            console.log(requestedData)
        }
        if (tableData.error) {
            if (tableData.error.code === 498) throw reply.error({ errorCode: `${errorCode}_TokenError`, status: 401, message: "Token Error" })
            if (tableData.error.code === 499) throw reply.error({ errorCode: `${errorCode}_TokenMissing`, status: 401, message: "Token Missing" })
            throw reply.error({
                errorCode: `${errorCode}_LayerError`,
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
        if (returnCountOnly) {
            return tableData.count
        }
        if (returnExtentOnly) {
            return tableData
        }
        if (tableData.features != undefined && returnAttributes) {
            if (returnGeometry) {
                return tableData.features.map((e) => ({
                    ...e.attributes, "geometry": {
                        geometryType: tableData.geometryType,
                        spatialReference: tableData.spatialReference,
                        ...e.geometry,
                    }
                }))
            }
            return tableData.features.map(e => e.attributes)
        }

        return tableData
    } catch (err) {
        if (err.isAxiosError) {
            throw reply.error({
                errorCode: `${errorCode}_ARCLayerError`,
                internalData: {
                    url,
                    requestedData,
                    reply: err.response?.data
                },
                status: 424,
                funECode
            })
        }
        throw err
    }
}