const express = require('express')
// const favicon = require('serve-favicon')
// const path = require('path')
const ddos = require('ddos')
const morgan = require('morgan')
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config({ path: './config/config.env' })
const app = express()

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')) // shows requested urls
}
app.set('etag', false)
app.use(cors())
app.use(new ddos({ burst: 10, limit: 15 }).express)
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }))

app.use('/', require('./routes/index'))
app.use((req, res, next) => res.status(404).send())
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).send({ status: 404, message: err.message })
    } next()
})
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

const PORT = process.env.PORT || 4001
app.listen(PORT, "0.0.0.0", console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))