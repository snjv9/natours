const Tour = require('../models/tourModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
exports.getOverview = catchAsync(async (req, res, next) => {

    const tours = await Tour.find();
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    })
})

exports.getTours = catchAsync(async (req, res, next) => {

    const tour = await Tour.findOne({ slug: req.params.tourSlug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    })
})

exports.getLoginForm = (req, res, next) => {

    res.status(200).render('login', {
        title: 'Log into your account'
    })
}

exports.getAccount = (req, res, next) => {
    res.status(200).render('account', {
        title: 'Your account',

    })
}