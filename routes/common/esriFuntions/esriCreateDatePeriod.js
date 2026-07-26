
/**
 * 
 * @param {String} fieldName Esri Field Name
 * {Date} startDate 
 * {Date} endDate 
 * {Integer} periodDays 
 * @returns 
 */
 module.exports = (fieldName, { startDate, endDate, periodDays = 7 } = {}) => {
    if (startDate == undefined && endDate == undefined) {
        endDate = new Date(new Date().setDate(new Date().getDate() + 1))
        startDate = new Date(new Date().setDate(endDate.getDate() - periodDays))
    } else if (startDate == undefined && endDate != undefined) {
        endDate = new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1))
        // startDate = new Date(new Date().setDate(endDate.getDate() - periodDays))
        return `${fieldName} <= date '${esriDate(endDate)}'`
    } else if (startDate != undefined && endDate == undefined) {
        startDate = new Date(startDate)
        // endDate = new Date(new Date().setDate(startDate.getDate() + periodDays + 1))
        return `${fieldName} >= date '${esriDate(startDate)}'`
    } else {
        console.log('both dates are provided')
        endDate = new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1))
    }
    return `${fieldName} >= date '${esriDate(startDate)}' AND ${fieldName} <= date '${esriDate(endDate)}'`
}

function esriDate(date) {
    date = new Date(date)
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 00:00:00`
}