const express = require('express')
const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController')
const reviewRouter = require('../routes/reviewRoutes')
const router = express.Router();

router.use('/:tourId/reviews', reviewRouter)
// router.param('id', tourController.checkId)

router.route('/top-5-cheap').get(tourController.aliasTopTour, tourController.getAllTours)
router.route('/tour-stats').get(tourController.getTourStats)
router.route('/monthly-plan/:year').get(authController.protect, authController.restrictTo('user', 'lead-guide', 'guide'), tourController.getMonthlyPlan)
router.route('/').get(authController.protect, tourController.getAllTours).post(tourController.createTour)
router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router.route('/:id').get(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.getTour)
    .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.updateTour)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour)



module.exports = router