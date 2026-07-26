const checkInputs = require('../common/checkInputs')
const reply = require('../common/reply')
const cryptoObject = require('../common/cryptoObject')
const SQLData = require('../common/SQLData')
const imposeFromKeys = require('../common/imposeFromKeys')
const ref = require('../../references/ref')

const apiErrorCode = "TokenDecrypt"
module.exports = async (req, res, next) => {
    try {
        const encryptedData = req.headers['access-token']

        try {
            checkInputs({ encryptedData })
        } catch (err) {
            throw reply.error({
                errorCode: `TokenNotFound`,
                message: "انتهت الجلسة, الرجاء تسجيل الدخول مرة اخرى",
                status: 401
            })
        }

        let decrypted = await decryptUserToken(encryptedData)
        req["user"] = decrypted.userData
        req["tokenData"] = decrypted.tokenData
        next()

    } catch (err) {
        next(reply.passError(apiErrorCode, err))
    }
}
async function decryptUserToken(encryptedToken) {
    try {
        const paresedData = cryptoObject.decrypt(encryptedToken)
        return paresedData
        const {
            tokenType, id,
            phoneNumber,
            tokenPetra, tokenExipres,
            tokenLands, tokenLandExpires,
        } = paresedData

        checkInputs({ tokenPetra, tokenExipres, id })

        let userData = await getUserData(id)

        if (tokenExipres < new Date().getTime()) {
            throw reply.error({ errorCode: `ExpiredPetra`, message: "انتهت الجلسة, الرجاء تسجيل الدخول مرة اخرى", status: 401 })
        }
        if (tokenLandExpires < new Date().getTime()) {
            throw reply.error({ errorCode: `ExpiredLand`, message: "انتهت الجلسة, الرجاء تسجيل الدخول مرة اخرى", status: 401 })
        }

        return {
            // phoneNumber,
            userData,
            tokenData: {
                tokenType,
                tokenPetra,
                tokenExipres,
                tokenLands,
                tokenLandExpires,
            }
        }
    } catch (err) {
        throw reply.error({
            errorCode: "InvalidToken",
            message: "",
            status: 401
        })
    }
}
const usersTable = process.env.SQL_TALBE_USERS
async function getUserData(userId) {
    let whereUser = {
        [ref.users.userId]: userId,
        [ref.users.deleted]: 0
    }
    let dbUser = await SQLData.selectTable(usersTable, whereUser)
    if (dbUser.recordset.length === 0) throw reply.error({ errorCode: "UserDoesNotExist", message: "user does not exist", status: 424 })
    if (dbUser.recordset.length > 1) throw reply.error({ errorCode: "MultiUsersFound", status: 424 })
    let imposed = imposeFromKeys(dbUser.recordset[0], ref.users)
    return imposed
}