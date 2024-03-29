const AppError = require('../utils/appError')

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}  : ${err.value}`;
    return new AppError(message, 400);
}
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/([""])(\\?.)*?\1/);
    const message = `Duplicate field value ${value}.Please use another field value`;
    return new AppError(message, 400);
}
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};
const handleJWTError = () => new AppError('Invalid Token. Please Log in Again', 401)
const handleJWTExpiredError = () => new AppError('Token Expired. Please log in again.', 401)
const sendErrorDev = (err, req, res) => {
    //API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })

    }
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message
    })

}

const sendErrorProd = (err, req, res) => {
    //Operational Error 
    //console.log(err)
    // A) API
    if (req.originalUrl.startsWith('/api')) {
        // A) Operational, trusted error: send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        // B) Programming or other unknown error: don't leak error details
        // 1) Log error
        console.error('ERROR 💥', err);
        // 2) Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }

    // B) RENDERED WEBSITE
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
        console.log(err);
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.'
    });
}


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err }
        if (err.name === 'CastError') {
            error = handleCastErrorDB(err)
        }
        if (err.code === 11000) {
            error = handleDuplicateFieldsDB(err)
        }
        if (error.name === 'ValidationError') {
            error = handleValidationErrorDB(error);
        }
        if (error.name === 'JsonWebTokenError') {
            error = handleJWTError(error)
        }
        if (error.name === 'TokenExpiredError') {
            error = handleJWTExpiredError(error);
        }
        sendErrorProd(error, req, res);
    }

}