const reply = require("../common/reply")
const path = require('path')
const fs = require('fs')

module.exports = (error, req, res, next) => {
    try {
        if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
            console.log('syntax error')
            logErrors(req, error)
            return res.status(400).send(reply.final({
                errorBody: {
                    errorCode: `InvalidCall`,
                    message: error.message,
                    status: 400
                },
                apiErrorCode
            }))
        }

        const apiErrorCode = error.apiErrorCode
        const errorBody = error.errorData

        // * valid reply errors
        let replyBody = reply.final()
        if (reply.validateError(errorBody)) {
            const folderLocation = "./references/errors"
            const fileLocation = `${folderLocation}/${apiErrorCode}.js`
            let content = {}

            // * Check if there is an error reference
            if (fs.existsSync(folderLocation)) {
                if (fs.existsSync(fileLocation)) {
                    content = require(path.relative(__dirname, fileLocation))
                }
            }
            // * creates new error file 
            if (content != undefined) {
                if (content[`${apiErrorCode}_${errorBody.errorCode}`] != undefined) {
                    replyBody = reply.final({
                        apiErrorCode,
                        errorBody,
                        refError: content[`${apiErrorCode}_${errorBody.errorCode}`]
                    })
                    logErrors(req, errorBody)
                    return res.status(replyBody.status).send(replyBody)
                }
            }
            let errorRefObject = writeDownError(apiErrorCode, errorBody, content)

            replyBody = reply.final({ errorBody, refError: errorRefObject, apiErrorCode })
            logErrors(req, errorBody)
            return res.status(replyBody.status).send(replyBody)
        }

        // * not a reply error, some other error sent
        console.log(error)
        logErrors(req, errorBody)
        return res.status(500).send(reply.errorSend({
            errorCode: `${apiErrorCode}_Error`,
            data: {},
            message: "Server Error"
        }))
    } catch (err) {
        console.log(err)
        console.log('Error dealing with error request ----------------------- ')

        logErrors(req, err)
        return res.status(500).send(reply.final())
    }
}

/**
 * inserts new error to the database
 * @param {String} apiErrorCode Api Error Code usually passed through the next function
 * @param {String} errorBody This should be a valid reply.error object, any other object is rejected
 * @param {Object} content Api Error file content in Object JSON format, it will be edited and re-stored into the original file
 */
function writeDownError(apiErrorCode, errorBody, content = {}) {
    const folderLocation = "./references/errors"
    const fileLocation = `${folderLocation}/${apiErrorCode}.js`

    if (!fs.existsSync(folderLocation)) {
        fs.mkdirSync(folderLocation, { recursive: true })
    }

    const key = `${apiErrorCode}_${errorBody.errorCode}`
    let code = 0

    if (content == undefined || !Object.keys(content).length) {
        const filesCount = fs.readdirSync(folderLocation)
        code = filesCount.length + 1
        content = firstTimeError(apiErrorCode, code)
    } else {
        code = content.fileCode
    }

    content[key] = {
        message: errorBody.message,
        code: `${code}_${Object.keys(content).length + 1}`,
        statusCode: errorBody.status
    }

    fs.writeFileSync(fileLocation, `module.exports = ${JSON.stringify(content, null, 4)}`, 'utf8')
    return content[key]
}

/**
 * adds input checks to first time error files
 * @param {String} apiErrorCode 
 * @param {Number} codeValue file number
 * @returns first time error object with input checks
 */
function firstTimeError(apiErrorCode, codeValue) {
    return {
        "fileCode": codeValue,
        "apiErrorCode": apiErrorCode,
        [`${apiErrorCode}_InputData_NotFound`]: {
            message: "",
            code: `${codeValue}_1`,
            statusCode: 400
        },
        [`${apiErrorCode}_InputData_TypeError`]: {
            message: "",
            code: `${codeValue}_2`,
            statusCode: 400
        },
        [`${apiErrorCode}_InputData_Empty`]: {
            message: "",
            code: `${codeValue}_3`,
            statusCode: 400
        },
    }
}

// * log content type
// * log requested url
// * log request method
// * log sent body content

function logErrors(requestData, errorData) {
    const today = `${new Date().getFullYear()}.${new Date().getMonth() + 1}.${new Date().getDate()}`
    const folderLocation = `./logs/errors/${today}`
    // * create logs folder if not exists
    if (!fs.existsSync(folderLocation)) {
        fs.mkdirSync(folderLocation, { recursive: true })
    }
    let fileContent = ""

    fileContent += `${new Date()} \n\r`
    fileContent += `${requestData.method} - ${requestData.url} \r`

    fileContent += writeErrorString(errorData)
    fileContent += addToLog("Reply Internal", errorData)
    if (requestData.body && Object.keys(requestData.body).length) {
        fileContent += addToLog("Body", requestData.body)
    }
    if (requestData.params && Object.keys(requestData.params).length) {
        fileContent += addToLog("Params", requestData.params)
    }
    if (requestData.query && Object.keys(requestData.query).length) {
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
        fileContent += `${dataObject?.toString() || ""} \r`
        fileContent += `--------------------------- \n\r`
        return fileContent
    } catch (err) {
        console.log(err)
        return ""
    }
}