const { default: axios } = require('axios')
const reply = require('../../routes/common/reply')

module.exports = async function (token, urlLayers, {
    dbList = {
        named: {
            "DLS_JTM_Service": {
                name: "DLS_JTM"
            }
        },
        list: []
    },
    folderName = "" } = {}) {
    const layerData = await fabricateLayersJson(token, urlLayers, { dbList, folderName })

    return layerData
}

async function fabricateLayersJson(token, urlLayers, { dbList = { named: {}, list: [] }, folderName }) {
    let i = 0
    const services = await requestServices(token, urlLayers, folderName)
    async function addLayerSet(serviceName, serviceType, obj) {
        if ((dbList.list.length && dbList.list.includes(services[i].name)) || !dbList.list.length || dbList.named[services[i].name]) {
            const serviceTypeCamel = toCamelCase(serviceType)
            obj[serviceTypeCamel] ??= {}

            const infoSet = await requestLayers(urlLayers, serviceName, serviceType, token, dbList.named[services[i].name])
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
async function requestLayers(urlLayers, serviceName, serviceType, token, {
    name
} = {}) {
    if (name == undefined || name == "") {
        name = serviceName
    }
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

        let dataSet = { ids: {}, links: {}, base: { [name]: urlGened } }
        function reducer(obj, e) {
            const ssName = `${name}_${e.name}`
            Object.assign(dataSet.ids, { [ssName]: e.id })
            return { ...obj, [ssName]: `${urlGened}/${e.id}` }
        }
        // I also need the ids
        dataSet.links = result.data.layers?.reduce(reducer, dataSet.links)
        dataSet.links = result.data.tables?.reduce(reducer, dataSet.links)

        // let dataSet = { ...dataLayers, ...dataTables }
        return dataSet
    } catch (err) {
        console.log("unable to get layer ", serviceName)
        console.log(err)
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