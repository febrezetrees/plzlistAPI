const express = require('express')
const router = express.Router()
const registerController = require('../controllers/registerController')
const loginLimiter = require('../middleware/loginLimiter')

router.route('/') // root route as-referred from server.js (e.g. '/auth')
    .post(loginLimiter, registerController.registerNewUser) //order: middleware, controller link

module.exports = router