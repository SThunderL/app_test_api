const { manageTokens, enumTokenNames } = require("./manageTokens")

module.exports = async function () {
    return (await manageTokens(enumTokenNames.lands, { expires: process.env.Token_Lands })).token
}