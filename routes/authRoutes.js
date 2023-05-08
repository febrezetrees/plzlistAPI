const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const loginLimiter = require('../middleware/loginLimiter')

router.route('/') // root route as-referred from server.js (e.g. '/auth')
    .post(loginLimiter, authController.login) //order: middleware, controller link

router.route('/refresh') // '/auth/refresh' from server.js
    .get(authController.refresh) //order: controller link

router.route('/logout') // '/auth/logout' from server.js
    .post(authController.logout) //order: controller link

module.exports = router