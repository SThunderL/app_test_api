module.exports = {
    /**
     * @param {Any} data Default = {}, reply object
     * constructs a reply to the user in form of an object containing: errorCode (if any), message, data, apiErrorCode.
     * Methods used are: done, errorCode (if a generic errorCode to be sent)
     * {String} errorCode errorCode code
     * {String} message message to send to the end user
     * {Object} data an object containing reply data to be sent to the user, default {}
     * {Boolean} error, Default is false
     * {Boolean} autoMessage if true auto-generates a message if none provided, default false
     * @returns
     */
    done(
        data = {},
        { errorCode = "", message = "", autoMessage = false, error = false } = {},
    ) {
        if (autoMessage && message == "") {
            if (message == "" && errorCode != "") {
                message = "Access denied or Bad request"
            } else if (message == "" && errorCode == "") {
                message = "Success"
            } else {
                message = "Data Type Error"
            }
        }
        if (data == undefined) {
            data = {}
        }
        return {
            errorCode: errorCode,
            message: message,
            data: data,
            error: error,
        }
    },
    /**
     * creates an error body to be sent to the user
     * {String} errorCode Error Code Name, Should be Unique
     * {String} message Message, Default = "Access Denied"
     * {Object} autoMessage change return message to that in msReply
     * {Object} data Error data object. Optional
     * {Object} sendErrorString used for easy debugging, sends strings indicating where errors
     * @returns
     */
    errorSend({ errorCode = "", funECode = "", message = "", data = {}, status = 0 } = {}) {
        if (funECode != "") {
            errorCode = [funECode, errorCode].join("_")
        }
        if (errorCode == "" && funECode != "") {
            errorCode = funECode
        }

        const errorObject = {
            errorCode: errorCode,
            message: message ? message : "",
            data: data,
            error: true,
            code: 0,
            status: status > 0 ? status : 400,
        }
        return errorObject
    },

    /**
     * creates an error body to be sent to the user
     * {String} errorCode Error Code Name, Should be Unique
     * {String} message Message, Default = "Access Denied"
     * {Object} autoMessage change return message to that in msReply
     * {Object} data Error data object. Optional
     * {Object} internalData data to be logged for aditional debugging and not be sent back to the user
     * {Object} overrideAutoMessage does not allow messages in ref folder to be used
     * @returns
     */
    error({
        errorCode = "",
        funECode = "",
        message = "",
        data = {},
        status = 0,
        internalData = {},
        overrideAutoMessage = false
    } = {}) {
        if (funECode != "") {
            errorCode = [funECode, errorCode].join("_")
        }
        if (errorCode == "" && funECode != "") {
            errorCode = funECode
        }

        const errorObject = {
            errorCode: errorCode,
            message: message ? message : "",
            data: data,
            error: true,
            code: 0,
            status: status > 0 ? status : 400,
            overrideAutoMessage,
            internalData
        }
        return errorObject
    },

    final({
        errorBody = {
            errorCode = "",
            message = "",
            data = {},
            status = 0,
            code = 0,
            overrideAutoMessage = false,
            internalData = {} // ? This is used to store data on log files
        } = {},
        refError = {},
        apiErrorCode = ""
    } = {}) {
        const finalECode = []
        if (apiErrorCode != "") {
            finalECode.push(apiErrorCode)
        }
        if (errorBody.errorCode) {
            finalECode.push(errorBody.errorCode)
        }

        let err = {
            errorCode: finalECode.join("_"),
            message: errorBody.message,
            data: errorBody.data,
            error: true,
            code: errorBody.code,
            status: errorBody.status,
        }
        if (refError != undefined) {
            if (refError.errorCode != undefined) {
                if (apiErrorCode != "") {
                    finalECode = [apiErrorCode, refError.errorCode]
                } else {
                    finalECode = [refError.errorCode]
                }
            }

            let message = errorBody.message || ""
            if (!errorBody.overrideAutoMessage) {
                if (refError.message) {
                    message = refError.message
                } else {
                    message = errorBody.message || ""
                }
            }

            err = {
                errorCode: finalECode.join("_"),
                message: message,
                data: errorBody.data,
                error: true,
                code: refError.code != undefined ? refError.code : errorBody.code,
                status:
                    refError.statusCode > 0 ? refError.statusCode : errorBody.status > 0 ? errorBody.status : 400,
            }
        }
        return err
    },

    /**
     * check if errorBody is a correct reply.error object
     * @param {Object} errorBody should be a valid reply.error object
     * @returns true if errorBody is a correct error object generated by reply.error function
     */
    validateError(errorBody) {
        try {
            if (!("errorCode" in errorBody)) {
                throw "errorCode"
            }
            if (!("message" in errorBody)) {
                throw "message"
            }
            if (!("data" in errorBody)) {
                throw "data"
            }
            if (!("error" in errorBody)) {
                throw "error"
            }
            if (!("code" in errorBody)) {
                throw "code"
            }
            if (!("status" in errorBody)) {
                throw "status"
            }
            return true
        } catch (err) {
            return false
        }
    },

    /**
     * used as a next function
     * @param {String} apiErrorCode Api Error Code Assigned at Api Level
     * @param {Object} replyError error object, could be either a reply.error object or a noraml error object
     * @returns passable error object
     */
    passError(apiErrorCode, replyError) {
        return {
            apiErrorCode,
            errorData: replyError,
        }
    },
}
