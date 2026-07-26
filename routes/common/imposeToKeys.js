/**
 * turns frontend parameters into database keys, use example
 * ({ "dashboardId": 43 }, "charts")
 * @param {Any} data Either object or array
 * @param {String} dataSet data name in ref like object;
 * @returns object similar to { "DASHBOARD" : 43 }
 */
module.exports = (data, dataSet) => {
    let imposed
    if (Array.isArray(data)) {
        imposed = data.map(e => {
            imposeObject(e, dataSet)
        })
    } else {
        imposed = imposeObject(data, dataSet)
    }

    return imposed
}

function imposeObject(data, dataSet) {
    let miniDashboard = {}
    for (let key in data) {
        if (dataSet[key]) {
            if (data[key] !== undefined) {
                miniDashboard[dataSet[key]] = data[key]
            }
        }
    }

    return miniDashboard
}