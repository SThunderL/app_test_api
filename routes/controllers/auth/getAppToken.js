const reply = require("../../common/reply")
const os = require('os')
const generateToken = require("./common/generateToken")

const apiErrorCode = "AuthToken"

module.exports = async (req, res, next) => {
    try {
        const rawHeaders = req.rawHeaders
        let sendRef = false
        let acceptedIps = rawHeaders.filter(e => {
            if (e.includes(":")) {
                if (!e.includes(process.env.HOST_IP))
                    sendRef = true

                return !isNaN(e.split(":")[1])
            }
            return false
        })

        if (sendRef) {
            const tokenData = await generateToken({ referer: "referer" })
            return res.send(reply.done({
                layers: tokenData,
                ip: "referer"
            }))
        }

        if (!acceptedIps.length) {
            throw reply.error(`${apiErrorCode}_IpNotAccepted`)
        }

        let ip = ""
        let serverIpList = []
        const connections = os.networkInterfaces()
        if (connections)
            for (let con in connections) {
                connections[con].forEach(e => {
                    if (e.family === 'IPv4' && e.internal === false) {
                        serverIpList.push(e.address)
                    }
                })
            }
        if (serverIpList.length) {
            acceptedIps = acceptedIps.filter(e => !serverIpList.includes(e.split(":")[0]))
        }

        if (!acceptedIps.length) {
            throw reply.error(`${apiErrorCode}_IpNotAccepted`)
        }
        ip = acceptedIps[0].split(":")[0]
        const tokenData = await generateToken({ ip })

        return res.send(reply.done({
            // online: tokenData,
            layers: tokenData,
            ip: ip
        }))
    } catch (err) {
        next(reply.passError(apiErrorCode, err))
    }
}