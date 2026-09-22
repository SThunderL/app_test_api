const layers = require('./layers.json')

module.exports = {
    tableParcelMainCass: layers?.main?.mapServer.links['DLS_Cassini_قطع الاراضي'],
    tableParcelStgCass: layers?.stg?.mapServer.links['DLS_Cassini_قطع الاراضي']
}