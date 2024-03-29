const express = require('express')
const viewController = require('../controllers/viewsController')
const authController = require('../controllers/authController')
const router = express.Router()


router.get('/', authController.isLoggedIn, viewController.getOverview)
router.get('/tour/:tourSlug', authController.isLoggedIn, viewController.getTours)
router.get('/login', authController.isLoggedIn, viewController.getLoginForm)
router.get('/me', authController.protect, viewController.getAccount)
module.exports = router