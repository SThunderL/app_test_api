const { tableAttractionTypeTranslation } = require("../../../references/dbTables")
const ref = require("../../../references/ref")
const os = require("os")
const { Worker } = require("worker_threads")

module.exports = async function (token, {
    translationRequestArray = [{
        id: "something",
        language: "en",
        urlTranslation: tableAttractionTypeTranslation,
        fieldName: ref.attractions.typeId,
        fieldData: [],
        getTranslationsOnly: true
    }],
    slaveCount = os.cpus().length
} = {}) {

    const composed = {
        passed: {
            total: 0,
            list: { collection: {} }
        },
        failed: {
            total: 0,
            list: { collection: {} }
        },
    }
    const workQueue = translationRequestArray
    async function whipASlave(token, requiredData = {
        id,
        language,
        urlTranslation,
        fieldName,
        fieldData,
        getTranslationsOnly
    }) {
        if(!requiredData.id) requiredData.id = "collection" 
        return new Promise((resolve) => {
            const worker = new Worker("./routes/common/slaves/common/slaveTranslator.js", {
                workerData: {
                    token,
                    ...requiredData
                }
            })
            worker.on('message', (result) => {
                const resultData = result.data.body
                const id = result.data.id

                if (result.error) {
                    composed.failed.total++
                    composed.failed.list[id] ??= { ...resultData, ...composed.failed.list?.[id] }
                    // composed.failed.list = { ...resultData, ...composed.failed.list }
                } else {
                    composed.passed.total++
                    composed.passed.list[id] ??= { ...resultData, ...composed.passed.list?.[id] }
                }
            })

            worker.on('exit', (code) => {
                if (code !== 0) {
                    console.warn(`Worker ${objectId} exited with code ${code}`)
                }
                resolve()
            })
        })
    }

    async function startSingleSlave(token, info) {
        await whipASlave(token, info)
        if (workQueue.length) {
            await startSingleSlave(token, workQueue.shift())
        }
    }
    async function runSlaves() {
        const active = []
        for (let i = 0; i < slaveCount && workQueue.length > 0; i++) {
            active.push(await startSingleSlave(token, workQueue.shift()))
        }
        await Promise.all(active).catch(err => {
            console.log('error awaiting slaves')
        })
    }
    await runSlaves()

    return composed
}