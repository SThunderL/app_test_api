const esriRequestLayerJson = require('./esriRequestLayerJson');

module.exports = async function ({
    url, 
    token = "",
    layerJson = {}
} = {}) {
    if (!layerJson || Object.keys(layerJson)?.length == 0) {
        layerJson = await esriRequestLayerJson(url, { token })
    }

    const composed = {
        "typeFieldPrimary": layerJson.typeIdField,
        "typeFieldSub": layerJson.subtypeField,
        "typesList": fixData(layerJson.types),
    }

    return composed
}

function fixData(typesArray) {
    let byId = {}, byName = {}

    typesArray.forEach(e => {
        const { id, name, domains } = e
        if (!byId[id]) {
            const codeBlock = {
                id: id,
                name: name,
                domains: {}
            }
            byId[id] = codeBlock
            byName[name] = codeBlock
        }

        for (let i in domains) {
            if (domains[i].codedValues != undefined) {
                const codeBlock = {
                    name: domains[i].name,
                    type: domains[i].type,
                    list: domains[i].codedValues
                }
                byId[id].domains[i] = codeBlock
                byName[name].domains[i] = codeBlock
            }
        }
    })
    return { byId, byName }
}