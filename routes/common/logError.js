const fs = require('fs')

/**
 * 
 * @param {Object} errorBody reply data body
 */
module.exports = function (errorBody, {
    headers = "", url = "", method = "",
    body = "", params = "", query = "",
    folderName = "errors",
} = {}) {
    logErrors({ headers, url, method, body, params, query }, errorBody, { folderName })
}

function logErrors(requestData, errorData, {
    folderName = "errors",
} = {}) {
    const today = `${new Date().getFullYear()}.${new Date().getMonth() + 1}.${new Date().getDate()}`
    const folderLocation = `./logs/${folderName}/${today}`
    // * create logs folder if not exists
    if (!fs.existsSync(folderLocation)) {
        fs.mkdirSync(folderLocation, { recursive: true })
    }
    let fileContent = ""

    fileContent += `${new Date()} \n\r`
    fileContent += `${requestData.method} - ${requestData.url} \r`

    fileContent += writeErrorString(errorData)
    fileContent += addToLog("Reply Internal", errorData)
    if (Object.keys(requestData.body).length) {
        fileContent += addToLog("Body", requestData.body)
    }
    if (Object.keys(requestData.params).length) {
        fileContent += addToLog("Params", requestData.params)
    }
    if (Object.keys(requestData.query).length) {
        fileContent += addToLog("Query", requestData.query)
    }
    fileContent += addToLog("Headers", requestData.headers)

    const filesCount = (fs.readdirSync(folderLocation)).length + 1
    const fileLocation = `${folderLocation}/${filesCount}-${requestData.method}-${requestData.url.split("?")[0].split("/").join("_")}.txt`

    fs.writeFileSync(fileLocation, fileContent, 'utf8')
}

function addToLog(title, dataObject) {
    let fileContent = `${title} \r`
    fileContent += `${JSON.stringify(dataObject, null, 4)} \r`
    fileContent += `--------------------------- \n\r`
    return fileContent
}
function writeErrorString(dataObject) {
    try {
        let fileContent = `Error As String \r`
        fileContent += `${dataObject.toString()} \r`
        fileContent += `--------------------------- \n\r`
        return fileContent
    } catch (err) {
        console.log(err)
        return ""
    }
}