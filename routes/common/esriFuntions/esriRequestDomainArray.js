const { default: axios } = require("axios");
const qs = require("qs");
const reply = require("../reply");
const errorCode = "EsriRequestDomains"

/**
 * creates a list of domain data
 * Errors: "_EsriRequestDomains_DomainLayerError": 500,
 * urlErrors: "_ARCLayerError": 424, "_EsriRequestDomains_TokenError": 401, "_EsriRequestDomains_TokenMissing": 401, "_EsriRequestDomains_Error": 500,
 * 
 * Either provide a layerJson or url, if both are provided then layerJson will be used, if layerJson is an invalid layer json data an error will be thrown
 * 
 * fieldNameArray: [] used to get filtered fields
 * getNonFiltered: true gets non filtered fields
 * getNonDomains: false gets none domains in returned data
 * funECode adds to reply error data
 * token: esri token required for url call
 * domainOnly: false if true returns domain values only without field alias
 * asLookup: false returns data as an array of {name, code} objects
 * @returns depending on parameters sent either a list of fields with array of domains or list of fields with list of domains with code as key {code: name}
 */
module.exports = async function ({
    url = "",
    layerJson = {},
    fieldNameArray = [],
    getNonFiltered = true,
    getNonDomains = false,
    funECode = "",
    token = "",
    domainOnly = false,
    asLookup = false,
    getLayerJson = false
} = {}) {
    try {
        if (layerJson == undefined || Object.keys(layerJson).length == 0) {

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
            })

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
                throw reply.error({ errorCode: `${errorCode}_LayerError`, data: tableData.data.error, status: 500, funECode })
            }

            layerJson = tableData.data
        }

        const domainsFiltered = {}, domainsAll = {}
        layerJson.fields.forEach(e => {
            if (!getNonDomains && e.domain == null)
                return

            if (fieldNameArray.includes(e.name)) {
                if (!domainsFiltered[e.name]) {
                    domainsFiltered[e.name] = addDomain(e, domainOnly, asLookup)
                }
            }
            if (getNonFiltered) {
                domainsAll[e.name] = addDomain(e, domainOnly, asLookup)
            }
        })
        if (getLayerJson) return { domainsAll, domainsFiltered, layerJson }
        return { domainsAll, domainsFiltered }
    } catch (err) {
        if (err.isAxiosError) {
            throw reply.error({ errorCode: `${errorCode}_ARCLayerError`, data: err.response.data, status: 424, funECode })
        }
        throw reply.error({ errorCode: `${errorCode}_DomainLayerError`, data: err, status: 500, funECode })
    }
}

function addDomain(fieldInfo, domOnly, asLookup) {
    if (asLookup) {
        if (domOnly) {
            let subObject = []
            if (fieldInfo.domain) {
                subObject = fieldInfo.domain.codedValues
            }
            return subObject
        } else {
            let subObject = {
                alias: fieldInfo.alias,
                hasDomain: fieldInfo.domain != null,
                domain: []
            }
            if (fieldInfo.domain) {
                subObject.domain = fieldInfo.domain.codedValues
            }
            return subObject
        }
    }

    if (domOnly) {
        let subObject = {}
        if (fieldInfo.domain) {
            subObject = fieldInfo.domain.codedValues.reduce((obj, e) => ({ ...obj, [e.code]: e.name }), {})
        }
        return subObject
    } else {
        let subObject = {
            alias: fieldInfo.alias,
            hasDomain: fieldInfo.domain != null,
            domain: {}
        }
        if (fieldInfo.domain) {
            subObject.domain = fieldInfo.domain.codedValues.reduce((obj, e) => ({ ...obj, [e.code]: e.name }), {})
        }
        return subObject
    }
}