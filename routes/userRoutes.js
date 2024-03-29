const express = require('express')
const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController')
const reviewController = require('./../controllers/reviewController')


const router = express.Router();


router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logout)

router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

router.patch('/updateMyPassword', authController.protect, authController.updatePassword)
router.patch('/updateMe', authController.protect, userController.updateMe)

router.get('/me', authController.protect, userController.getMe)
router.delete('/deleteMe', authController.protect, userController.deleteMe)
router.route('/').get(authController.protect, userController.getAllUsers).post(userController.createUser)
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser)


module.exports = router