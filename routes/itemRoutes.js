const express = require('express')
const router = express.Router()
const itemsController = require('../controllers/itemsController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/') // '/items'
    .get(itemsController.getAllItems)
    .post(itemsController.createNewItem)
    .patch(itemsController.updateItem)
    .delete(itemsController.deleteItem)

module.exports = router