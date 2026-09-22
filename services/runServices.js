// const { manageTokens, enumTokenNames } = require("../routes/common/token/manageTokens")
// const collectLayers = require("./common/collectLayers")

require('dotenv').config({ path: './config/config.env' })
const initialiseServices = require("./initialiseServices")

initialiseServices()
