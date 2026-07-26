const { dataTypes, enumTypes } = require("../../references/dataTypes")
const reply = require("./reply")

const funECode = "InputData"
/**
 * check input data for correct data types and values, throws an error if datatype mismatch
 * Error Strings: "_InputDataNotFound": 400, "_InputDataTypeError": 400, 
 * "_InputDataEmpty": 400
 * @param {Object} data data object containing keys and values
 * checkEmpty: true- checks if data sent is not null and by default checks if available 
 * even if checkAvailable is false, arrays and objects are not empty. 
 * checkAvailable: true- checks if paramater is not undefined
 * {Object} checkAvailable 
 * {Object} checkEmpty
 * @returns true if no error is thrown
 */
module.exports = function (data, { checkEmpty = true, checkAvailable = true, typeToCheck = "" } = {}) {
    for (let key in data) {
        const value = data[key]
        let type = dataTypes[key]
        if (enumTypes[typeToCheck] != undefined) {
            type = typeToCheck
        }
        if (isAvailable(value)) {
            checkData(key, value, type, { checkEmpty, checkAvailable })
            return true
        }
        if (checkAvailable) {
            throw errorNotFound(key)
        }
    }
    return true
}
function checkData(key, value, type, { checkEmpty }) {
    switch (type) {
        case enumTypes.date: {
            if (!checkEmpty && (value === "" || value === null || value === undefined)) {
                break
            }

            if (checkEmpty && (value === "" || value === null || value === undefined)) {
                throw errorEmpty(key)
            }

            const isTimestamp = !isNaN(value) && typeof value !== "string"
            const isValidDate = !isNaN(new Date(value).getTime())

            if (!isTimestamp && !isValidDate) {
                throw errorType(key)
            }
            break
        }
        case enumTypes.boolean: {
            if (typeof (value) !== type) {
                if (checkEmpty && (value == undefined || value == null || !value.toString().length)) {
                    throw errorEmpty(key)
                }

                if (checkBool(value)) {
                    break
                } else {
                    throw errorType(key)
                }
            }
            break;
        }
        case enumTypes.string: {
            if (typeof (value) !== type) {
                throw errorType(key)
            }
            if (checkEmpty) {
                if (value.trim().length < 1) {
                    throw errorEmpty(key)
                }
            }
            break;
        }
        case enumTypes.number: {
            if (isNaN(value))
                throw errorType(key)
            if (typeof (Number(value)) !== type) {
                throw errorType(key)
            }
            if (!value.toString().length && checkEmpty) {
                throw errorEmpty(key)
            }
            break;
        }
        case enumTypes.object: {
            if (typeof (value) !== type)
                throw errorType(key)

            if (Array.isArray(value)) {
                // array
                throw errorType(key)
            }
            // object
            if (checkEmpty && Object.values(value).length < 1)
                throw errorEmpty(key)
            break;
        }
        case enumTypes.array: {
            if (typeof (value) !== "object" && !Array.isArray(value))
                throw errorType(key)

            if (Array.isArray(value)) {
                // array
                if (checkEmpty && value.length < 1)
                    throw errorEmpty(key)
            }
            break;
        }
        case enumTypes.base64: {
            if (value) {
                if (!base64regex.test(value)) {
                    throw errorType(key)
                }
                return
            }
            if (checkEmpty) {
                throw errorEmpty(key)
            }
            break
        }
        case enumTypes.email: {
            if (typeof value !== "string") {
                throw errorType(key)
            }
            if (checkEmpty && value.trim().length < 1) {
                throw errorEmpty(key);
            }
            if (!emailRegex.test(value)) {
                throw errorFormat(key) // invalid email
            }
            break;
        }
        case enumTypes.phone: {
            if (typeof value !== "string" && typeof value !== "number") {
                throw errorType(key)
            }
            const phoneStr = String(value).trim();
            if (checkEmpty && phoneStr.length < 1) {
                throw errorEmpty(key)
            }
            if (!phoneRegex.test(phoneStr)) {
                throw errorFormat("Phone Number") // invlaid phone number
            }
            break;
        }
    }
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^(?:\+962|0)(7[789]\d{7}|[2356]\d{7})$/
const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/

function checkBool(value) {
    return value === false || value === true
        || value === 1 || value === 0
        || value === "1" || value === "0"
        || value === "true" || value === "false"
}
function isAvailable(value) {
    return value !== undefined && value !== null
}
function errorFormat(value) {
    throw reply.error({
        errorCode: "Format",
        funECode,
        status: 400,
        message: `Invalid ${value} format.`,
        overrideAutoMessage: true
    })
}
function errorType(value) {
    throw reply.error({
        errorCode: `TypeError`,
        funECode,
        status: 400,
        message: `Incorrect data type => ${value}`,
        overrideAutoMessage: true
    })
}
function errorEmpty(value) {
    throw reply.error({
        errorCode: `Empty`,
        funECode,
        status: 400,
        message: `${value} is empty`,
        overrideAutoMessage: true
    })
}
function errorNotFound(value) {
    throw reply.error({
        errorCode: `NotFound`,
        funECode,
        status: 400,
        message: `${value} is not found`,
        overrideAutoMessage: true
    })
}