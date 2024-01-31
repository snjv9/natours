const User = require('../models/userModel')
const APIFeatures = require('../utils/apiFeatures')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')


const filterObj = (obj, ...allowedFields) => {
    const newObject = {}
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObject[el] = obj[el];
        }
    })
    return newObject;
}

exports.getMe = async (req, res, next) => {
    req.params.id = req.user.id;
    const user = await User.findById(req.params.id)
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })

}
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find()
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    })
})
exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for updating password. Please use /updateMyPassword'), 400);
    }
    const filteredBody = filterObj(req.body, 'name', 'email')
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true })
    res.status(200).json({
        status: "Success",
        data: {
            user: updatedUser
        }
    })
})
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })
    res.status(204).json({
        status: "success",
        data: null
    })
})

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This is not implemented'
    })
}


exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

//For admin to update for other users
//DO NOt update passwords with this
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)