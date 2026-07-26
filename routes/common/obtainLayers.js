const { default: axios } = require('axios')
const reply = require('../../routes/common/reply')

module.exports = async function (token, urlLayers, { dbList = [], folderName = "" } = {}) {
    const layerData = await fabricateLayersJson(token, urlLayers, { dbList, folderName })

    return layerData
}

async function fabricateLayersJson(token, urlLayers, { dbList, folderName }) {
    let i = 0
    const services = await requestServices(token, urlLayers, folderName)
    async function addLayerSet(serviceName, serviceType, obj) {
        if ((dbList.length && dbList.includes(services[i].name)) || !dbList.length) {
            const serviceTypeCamel = toCamelCase(serviceType)
            if (!obj[serviceTypeCamel]) {
                obj[serviceTypeCamel] = {}
            }
            const infoSet = await requestLayers(urlLayers, serviceName, serviceType, token)
            if (Object.keys(obj[serviceTypeCamel]).length) {
                for (let k in obj[serviceTypeCamel]) {
                    obj[serviceTypeCamel][k] = { ...obj[serviceTypeCamel][k], ...infoSet[k] }
                }
            } else {
                obj[serviceTypeCamel] = infoSet
            }
        }
        i++

        if (services[i] === undefined) {
            return obj
        }
        return addLayerSet(services[i].name, services[i].type, obj)
    }

    const finalDataSet = addLayerSet(services[0].name, services[0].type, {})
    return finalDataSet
}
async function requestLayers(urlLayers, serviceName, serviceType, token) {
    let urlGened = `${urlLayers}/${serviceName}/${serviceType}`
    try {
        const result = await axios.get(urlGened, {
            params: { token: token, f: "pJson" },
            timeout: 10000
        })
        if (result.data.error) {
            console.log(result.data.error)
            console.log("Error")
            return {}
        }

        let dataSet = { ids: {}, links: {}, base: { [serviceName]: urlGened } }
        // I also need the ids
        dataSet.links = result.data.layers?.reduce((obj, e) => {
            Object.assign(dataSet.ids, { [e.name]: e.id })
            return { ...obj, [e.name]: `${urlGened}/${e.id}` }
        }, {})
        dataSet.links = result.data.tables?.reduce((obj, e) => {
            Object.assign(dataSet.ids, { [e.name]: e.id })
            return { ...obj, [e.name]: `${urlGened}/${e.id}` }
        }, dataSet.links)

        // const dataLayers = result.data.layers?.reduce((obj, e) => { return { ...obj, [e.name]: `${urlGened}/${e.id}` } }, {})
        // const dataTables = result.data.tables?.reduce((obj, e) => { return { ...obj, [e.name]: `${urlGened}/${e.id}` } }, {})

        // let dataSet = { ...dataLayers, ...dataTables }
        return dataSet
    } catch (err) {
        console.log("unable to get layer ", serviceName)
        return {
            layers: {},
            tables: {}
        }
    }
}
async function requestServices(token, urlLayers, folder = "") {
    let url = urlLayers
    if (folder != "") {
        url += `/${folder}`
    }

    const result = await axios.get(url, {
        params: { token, f: "pJson" }
    })
    if (result.data.error) throw reply.error({
        errorCode: "LayersJson_BaseServicesRequestError",
        data: result.data.error
    })
    return result.data.services
}

function toCamelCase(input) {
    let words = input.split(/(?=[A-Z])/);
    return words.map((word, index) => index === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase()).join('');
}