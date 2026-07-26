const { default: axios } = require("axios")
const reply = require("../reply")
const errorCode = "EsriRequestFeatureGeo"

/**
 * @param {String} url Feature layer URL automatically adds /query at the end
 * {Object} outFields "*"
 * {Object} where "1=1"
 * {Object} geometry = "31,31", // point geometry or {xmin: -104, ymin: 35.6, xmax: -94.32, ymax: 41} or -104,35.6,-94.32,41
 * {Object} geometryType = enumGeometryType.point,
 * {Object} spatialRelation = enumSpatialRelation.intersects
 * {Object} token = "" Esri token,
 * {Object} funECode = ""
 * @returns array of valid features
 */
async function EsriRequestFeatureGeo(url,
    {
        geometryType = enumGeometryType.point,
        geometry = null,
        spatialRelation = enumSpatialRelation.intersects,
        inSR = "4326",
        outSR = "4326",
        resultOffset = null,
        resultRecordCount = null,
        distance = null,

        where = "1=1",
        outFields = "*",
        token = "",
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
        const requestedData = new FormData()
        requestedData.append("outFields", outFields)
        requestedData.append("returnGeometry", true)
        requestedData.append("where", where)
        requestedData.append("f", "json")
        requestedData.append("token", token)
        requestedData.append("inSR", inSR)
        requestedData.append("outSR", outSR)

        if (geometry) {
            requestedData.append("geometryType", geometryType)
            requestedData.append("geometry", JSON.stringify(geometry))
            requestedData.append("spatialRel", spatialRelation)
        }
        if (resultOffset) {
            requestedData.append("resultOffset", resultOffset)
        }
        if (resultRecordCount) {
            requestedData.append("resultRecordCount", resultRecordCount)
        }
        if (distance) {
            requestedData.append("distance", distance)
            requestedData.append("units", "esriSRUnit_Meter")
        }

        let tableData = await axios({
            method: "POST",
            headers: { 'Content-Type': 'multipart/form-data' },
            data: requestedData,
            url: `${url}/query`
        })

        tableData = tableData.data
        if (tableData.error) {
            if (tableData.error.code === 498) throw reply.error({
                errorCode: `${errorCode}_TokenError`,
                status: 401,
                message: "Token Error",
                internalData: {
                    url,
                    requestedData,
                    reply: tableData.error
                }
            })
            if (tableData.error.code === 499) {
                throw reply.error({ errorCode: `${errorCode}_TokenMissing`, status: 401, message: "Token Missing" })
            }
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

const enumGeometryType = {
    "point": "esriGeometryPoint",
    "multiPoint": "esriGeometryMultipoint",
    "polyline": "esriGeometryPolyline",
    "polygon": "esriGeometryPolygon",
    "envelope": "esriGeometryEnvelope"
}
const enumSpatialRelation = {
    intersects: "esriSpatialRelIntersects",
    contains: "esriSpatialRelContains",
    crosses: "esriSpatialRelCrosses",
    intersectsEnvelope: "esriSpatialRelEnvelopeIntersects",
    intersectsIndex: "esriSpatialRelIndexIntersects",
    overlaps: "esriSpatialRelOverlaps",
    touches: "esriSpatialRelTouches",
    within: "esriSpatialRelWithin"
}

module.exports = { EsriRequestFeatureGeo, enumGeometryType, enumSpatialRelation }