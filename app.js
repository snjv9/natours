const express = require('express')
const path = require('path')
const morgan = require('morgan')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const compression = require('compression')
const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))


//Serving static file
app.use(express.static(path.join(__dirname, 'public')))

//MIDDLEWARES
//Set security headers
app.use(cookieParser())
app.use(helmet({
    contentSecurityPolicy: false,
}))

app.use(cors())
//Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}
//Limit request from single IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,//100 requests per hours
    message: 'too many requests from this IP. Please try agian in an hour'
})
app.use('/api', limiter)

//BodyParser, Middleware to read request-body 
app.use(express.json({
    limit: '10kb'
}))

//Data Sanitization against NOSQL query injection
app.use(mongoSanitize());

//Data Sanitization against XSS attacks
app.use(xss())

//Prevent parameter pollution
app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}))

app.use(compression())
//using custom global middleware
app.use((req, res, next) => {
    const requestTime = new Date().toISOString();
    req.reqAt = requestTime;
    //console.log('From app', req.cookies)
    next();
})


//Routes
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.all('*', (req, res, next) => {
    if (req.originalUrl === '/bundle.js.map') {
        next()
    } else {
        next(new AppError(`Can't find ${req.originalUrl} on the server.`, 404))
    }
})
app.use(globalErrorHandler)
module.exports = app