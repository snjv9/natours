const crypto = require('crypto')
const { promisify } = require('util')
const User = require('../models/userModel');
const jwt = require('jsonwebtoken')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError')
const sendEmail = require('../utils/email')

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}
const createAndSendToken = async (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,//can only be read
        sameSite: "Lax",

    }
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;//can only be sent over https
    }

    res.cookie('jwt', token, cookieOptions);
    //Remove password from outputs
    user.password = undefined;
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    })
}
exports.signup = catchAsync(async (req, res) => {
    //with this we only allow user to enter these fields user can no longer register as an admin
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    createAndSendToken(newUser, 201, res)

});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    //Checking if email and password are entered
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400))
    }
    const user = await User.findOne({ email }).select('+password');
    //Checking if the user actually exists and password is aorrect 

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect Email or Password', 401))
    }
    //If everything is good return token
    createAndSendToken(user, 200, res)

})
exports.logout = catchAsync(async (req, res, next) => {
    res.cookie('jwt', 'loggedOut', {
        expires: new Date(Date.now() + 1000 * 10),
        httpOnly: true
    })
    res.status(200).json({
        status: 'success'
    })
})

exports.isLoggedIn = async (req, res, next) => {
    //Getting the token and checking if it acually exists
    let token
    try {
        if (req.cookies.jwt) {

            //1. Verifies the token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)

            //Check if user still exists(what if user was deleted in meantime)
            const freshUser = await User.findById(decoded.id);
            if (!freshUser) {
                return next();
            }
            //Check if user changed password after token was issued
            if (freshUser.changePasswordAfter(decoded.iat)) {
                return next()
            }

            //There is logged in user
            res.locals.user = freshUser

            return next();
        }
    } catch (err) {
        return next()
    }
    next();
}

exports.protect = catchAsync(async (req, res, next) => {
    //Getting the token and checking if it acually exists
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }
    if (!token) {
        return next(new AppError('You are not logged in! Please log in to continue', 401))
    }
    //Verifying the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    //Check if user still exists(what if user was deleted in meantime)
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(new AppError('The user belonging to this token does not exist', 404))
    }
    //Check if user changed password after token was issued
    if (freshUser.changePasswordAfter(decoded.iat)) {
        return next(new AppError('Password was changed recently, Login again', 401))
    }
    req.user = freshUser;
    res.locals.user = freshUser

    next()
})
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission for this route', 403))
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        next(new AppError('There is no user with that email address', 404))
    }
    const resetToken = user.createPasswordResetToken()
    user.save({ validateBeforeSave: false })

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot password! Submit a patch request with new password and passwordConfirm to: ${resetURL}.If you didn't forgot , Ignore`
    try {
        await sendEmail({
            email: req.body.email,
            subject: `Your password reset Token(Valid for 10 min)`,
            message
        })
        res.status(200).json({
            status: 'Success',
            message: 'Tokensent via Email'
        })
    } catch (err) {
        user.passwordResetToken = undefined,
            user.passwordResetExpires = undefined,
            await user.save({ validateBeforeSave: false })
        return next(new AppError('There is an error sending email', 500))
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken, passwordResetExpires: {
            $gt: Date.now()
        }
    });
    if (!user) {
        return next(new AppError('Token is invalid or expired', 400))
    }
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined

    await user.save();
    createAndSendToken(user, 200, res)

})
exports.updatePassword = catchAsync(async (req, res, next) => {

    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong', 401))
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save()
    createAndSendToken(user, 200, res)


})