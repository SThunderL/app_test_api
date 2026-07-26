const reply = require("../common/reply")

const apiErrorCode = "InvalidRequest"

module.exports = (req, res, next) => {
    try {
        if (req.method == "POST") {
            // if (req.body == undefined){
            //     throw reply.error({
            //         errorCode: "BodyNotFound",
            //         message: "Please supply a body"
            //     })
            // }
            req.body ??= {}
        }
        next()
    } catch (err) {
        next(reply.passError(apiErrorCode, err))
    }
}