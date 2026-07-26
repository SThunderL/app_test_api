/**
 * changes the key names in the object from the database
 * @param {Array} data key value pairs obtained from the database in an array
 * @param {Object} dataSet object reference chart to impose keys, usually obtained from ref.js
 * {Boolean} removeObjectId default: false, remove object id from output object
 * {Boolean} skipUndefined default: false, skips values not defined in the ref model
 * {Boolean} skipNullValues default: false, skips null values in the data set
 * {Boolean} nullToString default: false, changes null values to strings, does not do anything if skipNullValues is true
 * {Array} keys un-imposed from the database to skip, these keys will not appear in the final result
 * {keepKeys} undefined keys to be kept even if skipUndefined is set to true
 * @returns object with the keys altared to frontend key instead of db keys
 */
module.exports = (data, dataSet, {
    removeObjectId = false,
    skipUndefined = false,
    skipNullValues = false,
    nullToString = false,
    skipKeys = [],
    keepKeys = []
} = {}) => {
    let miniDashboard = {}, key

    if (Array.isArray(data)) {
        // array of objects
        let validatedList = []
        data.forEach(e => {
            miniDashboard = {}
            for (let i in e) {
                key = Object.keys(dataSet).find(k => dataSet[k] == i)
                if (skipKeys.includes(i)) continue;
                if (skipNullValues && e[i] == undefined) continue;
                if (nullToString && e[i] == undefined) {
                    e[i] = ""
                }
                if (!skipUndefined || (key != undefined && key != null || keepKeys.includes(i))) {
                    key = key == undefined ? i : key
                    miniDashboard[key] = e[i]
                }
            }
            if (removeObjectId) {
                delete miniDashboard.objectId
            }
            validatedList.push(miniDashboard)
        })
        return validatedList
    } else {
        // single object
        miniDashboard = {}
        for (let i in data) {
            key = Object.keys(dataSet).find(k => dataSet[k] === i)
            if (!skipUndefined || key != undefined || keepKeys.includes(i)) {
                key = key == undefined ? i : key
                if (skipKeys.includes(i)) continue;
                if (skipNullValues && data[i] == undefined) continue;
                if (nullToString && data[i] == undefined) {
                    data[i] = ""
                }
                miniDashboard[key] = data[i]
            }
        }
        if (removeObjectId) {
            delete miniDashboard.objectId
        }
        return miniDashboard
    }
}