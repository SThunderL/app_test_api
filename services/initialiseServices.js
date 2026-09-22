const { manageTokens, enumTokenNames } = require("../routes/common/token/manageTokens")
const collectLayers = require("./common/collectLayers")

module.exports = async function () {
    try {
        const token = (await manageTokens(enumTokenNames.lands)).token
        await collectLayers(token)

        console.log('Run Complete -- ')
    } catch (err) {
        console.log(err)
        console.log("Error Found")
    }
}