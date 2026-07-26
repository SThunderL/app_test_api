const { default: axios } = require("axios")
const qs = require("qs")
const urlUtil = `${process.env.URL_LAYERS}${process.env.URL_UTILIIES}`
const errorCode = "EsriCalculateDistance"
/**
 * 
 * You can use geoBuilder along with geometryType enum to constuct geo1 and 2, measues aerial distance
 * @returns distance in meters (number)
 */
const calculateDistance = async ({
    geo1, geo2,
    wkid = "102158",
    token = "",
    fixDigits = 1
}) => {
    const data = {
        geodesic: false,
        sr: wkid,
        "geometry1": JSON.stringify(geo1),
        "geometry2": JSON.stringify(geo2),
        token,
        f: "json"
    }
    let options = {
        "method": "POST",
        // "headers": { "content-type": "application/x-www-form-urlencoded" },
        "data": qs.stringify(data),
        "url": `${urlUtil}/Geometry/GeometryServer/distance`
    }
    try {
        const result = await axios(options)

        if (result.data.error) {
            if (result.data.error.code === 498) throw reply.error({
                errorCode: `${errorCode}_TokenError`,
                status: 401,
                message: "Token Error",
                internalData: {
                    url,
                    requestedData,
                    reply: result.data.error
                }
            })
            if (result.data.error.code === 499) {
                throw reply.error({ errorCode: `${errorCode}_TokenMissing`, status: 401, message: "Token Missing" })
            }
            throw reply.error({
                errorCode: `${errorCode}_LayerError`,
                data: result.data.error,
                status: 500,
                funECode,
                internalData: {
                    url,
                    requestedData,
                    reply: result.data.error
                }
            })
        }
        let distance = result.data.distance.toFixed(fixDigits)
        
        return distance
    } catch (err) {
        if (err.isAxiosError) {
            throw reply.error({
                errorCode: `${errorCode}_ARCLayerError`,
                internalData: {
                    url,
                    data,
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

function buildGeo(x, y, geoType = "esriGeometryPoint") {
    return {
        "geometryType": geoType,
        "geometry": {
            "x": x,
            "y": y
        }
    }
}

module.exports = { calculateDistance, enumGeometryType, buildGeo }