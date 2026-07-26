const { parentPort, workerData } = require("worker_threads")
const translateAttribute = require("../../translateAttribute")
const reply = require("../../reply")

const {
    id,
    token,
    language = "en",
    urlTranslation,
    fieldName,
    fieldData,
    getTranslationsOnly = true
} = workerData

async function doTask() {
    try {
        let translated = await translateAttribute(token, {
            language,
            urlTranslation,
            fieldName,
            fieldData,
            getTranslationsOnly
        })

        parentPort.postMessage(reply.done({ id, body: translated }))
        return process.exit(0)
    } catch (error) {
        parentPort.postMessage(reply.error({ errorCode: "TranslationError", internalData: error }))

        return process.exit(0)
    }
}
doTask()
