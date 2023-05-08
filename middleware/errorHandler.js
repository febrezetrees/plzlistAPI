// this will only receive err.message - not the error status. This middleware sets a catch-all error status of 500, if not determined beforehand

const { logEvents } = require('./logger')

const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
    console.log(err.stack)
    res.status(500).send(err.message)

    const status = res.statusCode ? res.statusCode : 500

    res.status(status)

    res.json({ message: err.message, isError: true })
}

module.exports = errorHandler