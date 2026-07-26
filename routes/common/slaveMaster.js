const { Worker } = require("worker_threads")
const os = require("os")

/**
 * runs large tasks on a number of different cpu cores
 * dataList array of objects sent to each slave
 * slavePath: slave file location
 * slaveCount: number of slaves to run concurrently, default is the maximum number of available cpu cores
 * @returns object containing {total, failed: {total, list: []}, passed: {total, list}}
 */
module.exports = async ({
    dataList = [],
    slavePath = "",
    slaveCount = os.cpus().length
} = {}) => {
    const maxCount = dataList.length
    let i = 0
    const composed = {
        total: 0,
        failed: {
            total: 0,
            list: []
        },
        passed: {
            total: 0,
            list: []
        }
    }
    async function distributeWorkOnSlaves() {
        let promiseArray = []
        for (let k = 0; k < slaveCount && i < maxCount && dataList.length; k++) {
            promiseArray.push(new Promise((resolve) => {
                const worker = new Worker(slavePath, {
                    // const worker = new Worker("./routes/controllers/licenses/common/geoSlave.js", {
                    // workerData: dataList.shift()
                    workerData: dataList[i]
                })

                worker.on('message', (result) => {
                    composed.total++
                    const resultData = result.data
                    if (result.error) {
                        composed.failed.total++
                        composed.failed.list.push(result)
                    } else {
                        composed.passed.total++
                        composed.passed.list.push(resultData)
                    }
                    resolve()
                })
            }))
            i++
        }
        if (promiseArray.length) {
            await Promise.all(promiseArray)
        }

        if (i >= maxCount) {
            return
        } else {
            return await distributeWorkOnSlaves()
        }
    }
    await distributeWorkOnSlaves()

    return composed
}



