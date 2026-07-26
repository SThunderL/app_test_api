const { default: axios } = require("axios")
const FormData = require('form-data')
const reply = require("../reply")
const archiver = require('archiver');
const { PassThrough } = require('stream');

const signatures = {
    "N3o": "7z",
    "UklGRg": "aif",
    "AVI": "avi",
    "Qk0": "bmp",
    "Q1NWSw": "csv",
    "0M8R4w": "dot",
    "RUNT": "ecw",
    "AAABAAEA": "emf",
    "PSER": "eps",
    "R0VPSg": "geojson",
    "R0lGODdh": "gif",
    "R0lGODlh": "gif",
    "iVBORw0KGgo": "png",
    "H4sI": "gtar",
    "H4sI": "gz",
    "J2k": "j2k",
    "/9j/": "jpeg",
    "/9j/": "jpg",
    "ewo": "json",
    "TVRo": "m4a",
    "0M8R4w": "mdb",
    "TVRo": "mid",
    "AAAAGGZ0": "mov",
    "TVRo": "mp2",
    "TVRo": "mp3",
    "AAAAFGZ0": "mp4",
    "TVRo": "mpa",
    "TVRo": "mpe",
    "TVRo": "mpeg",
    "TVRo": "mpg",
    "TVRo": "mpv2",
    "iVBORw0KGgo": "png",
    "PSER": "ps",
    "8BPS": "psd",
    "AAAAGGZ0": "qt",
    "UMFYI": "ra",
    "UmFt": "ram",
    "UkFX": "raw",
    "TVRo": "rmi",
    "U0lE": "sid",
    "TVRo": "tar",
    "H4sI": "tgz",
    "SUkqAA": "tif",
    "SUkqAA": "tiff",
    "VGV4dA": "txt",
    "VFdM": "vrml",
    "UklGRg": "wav",
    "U1ZQ": "wma",
    "TUlN": "wmf",
    "AAAAFGZ0": "wmv",
    "8BPS": "wps",
    "JVBERi0": "pdf",
    "0M8R4w": "doc",
    "UEsDB": "docx",
    "UEsDB": "jp2",
    "UEsDB": "jpc",
    "UEsDB": "jpf",
    "UEsDB": "ppt",
    "UEsDB": "pptx",
    "UEsDB": "xls",
    "UEsDB": "xlsx",
    "UEsDB": "xlt",
    "UEsDB": "xml",
    "UEsFBgAAAA": "zip",
}

const signaturesSet = new Set([
    "7z", "aif", "avi", "bmp", "csv", "dot", "ecw", "emf", "eps", "geojson", "gif", "gif",
    "png", "gtar", "gz", "j2k", "jpeg", "jpg", "json", "m4a", "mdb", "mid", "mov", "mp2",
    "mp3", "mp4", "mpa", "mpe", "mpeg", "mpg", "mpv2", "png", "ps", "psd", "qt", "ra",
    "ram", "raw", "rmi", "sid", "tar", "tgz", "tif", "tiff", "txt", "vrml", "wav", "wma",
    "wmf", "wmv", "wps", "pdf", "doc", "docx", "jp2", "jpc", "jpf",
    "ppt", "pptx", "xls", "xlsx", "xlt", "xml",
    "zip",
])

const rejectedFileTypes = new Set([
    'KMZ', 'KML', 'RAR'
])

const errorCode = "EsriAttachmentFeatures"
/**
 * Async: adds and attachment to the feature with supplied object id on the provided layer url
 * Error Strings: "_ARCLayerError": 424, "_EsriAttachmentFeatures_TokenError": 401,
 * "_EsriAttachmentFeatures_TokenMissing": 401, "_EsriAttachmentFeatures_Error": 500,
 */

/**
 * Async: adds and attachment to the feature with supplied object id on the provided layer url
 * @param {string} url feature layer url, the method will automatically add "/addFeatures" at the end
 * @param {string} attachment base64 encoded attachment with name {name, base} name => test.pdf, and base is the base64 encoded doc
 * @param {number} objectId object of feature to attach the image to 
 * {object} funECode: default "", token: default "" should be esri token
 * @returns object containing the add results { addAttachmentResult: { objectId: 12, success: true/false }}
 */
module.exports = async function (url, attachment, objectId, { funECode = "", token = "" } = {}) {
    try {
        let sendForm = new FormData()
        sendForm.append("token", token)
        sendForm.append("f", "json")
        const nameArray = attachment.name.split(".")
        let fileType = nameArray.pop()
        let fileBuffer = Buffer.from(attachment.base, "base64")
        if (!signaturesSet.has(fileType.toLowerCase())) {
            if (fileType.toLowerCase() === 'rar') {
                fileType = 'zip'
                attachment.name = nameArray.join(".")
            } else if (rejectedFileTypes.has(fileType.toUpperCase())) {
                fileType = `zip`
                fileBuffer = await compressFile(fileBuffer, attachment.name)
                attachment.name = nameArray.join(".")
            } else {
                // file potentially has no fileType with it thus do not change name
                fileType = detectMimeType(attachment.base)
            }
        } else if (nameArray.length) {
            attachment.name = nameArray.join(".")
        }
        sendForm.append("attachment", fileBuffer, `${attachment.name}.${fileType}`)

        if (attachment.keywords) {
            sendForm.append("keywords", attachment.keywords)
        }
        let options = {
            "method": "POST",
            "headers": sendForm.getHeaders(),
            "data": sendForm,
            "url": `${url}/${objectId}/addAttachment`
        }
        const result = await axios(options)
        if (result.data.error) {
            if (result.data.error.code === 498) throw reply.error({ errorCode: `${errorCode}_TokenError`, status: 401, message: "Token Error" })
            if (result.data.error.code === 499) throw reply.error({ errorCode: `${errorCode}_TokenMissing`, status: 401, message: "Token Missing" })
            if (result.data.error.code === 403) throw reply.error({ errorCode: `${errorCode}_FileError`, status: 400, message: "خطأ في رفع المرفق, حجم او نوع المرفق غير مناسب" })
            throw reply.error({ errorCode: `${errorCode}_Error`, data: result.data.error, status: 500, funECode })
        }

        return result.data
    } catch (err) {
        console.log(err)
        if (!reply.validateError(err)) {
            throw reply.error({
                errorCode: `${errorCode}_ARCLayerError`,
                data: err.data,
                status: 500,
                funECode
            })
        }
        throw err
    }
}
function detectMimeType(b64) {
    for (var s in signatures) {
        if (b64.indexOf(s) === 0) {
            return signatures[s];
        }
    }
}

async function compressFile(kmzPuffer, kmzName) {
    const zipStream = new PassThrough();
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(zipStream);
    archive.append(kmzPuffer, { name: kmzName });
    archive.finalize();
    return new Promise((resolve, reject) => {
        const chunks = [];
        zipStream.on('data', chunk => chunks.push(chunk));
        zipStream.on('end', () => resolve(Buffer.concat(chunks)));
        zipStream.on('error', err => reject(err));
    });
}