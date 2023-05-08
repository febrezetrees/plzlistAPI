// rate limiter for logins (vs. brute force, DoS, web scraping)
const rateLimit = require('express-rate-limit')
const { logEvents } = require('./logger')

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min windows
    max: 5, // limit to 5 logins from same IP per window
    message:
    {
        message: 'Too many login attempts. Please try again in 1 minute'
    },
    handler: (req, res, next, options) => {
        logEvents(`Too many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
    },
    //headers per middleware documentation
    standardHeaders: true, // Return rate limit info in the 'RateLimit-*' headers
    legacyHeaders: false // Disable the 'X-RateLimit-*' headers
})

module.exports = loginLimiter