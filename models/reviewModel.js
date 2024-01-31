const mongoose = require('mongoose')
const Tour = require('./tourModel')
const reviewSchema = mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review cannot be empty']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user']
        }
    },
    {   //when we have virtual property set up and we want to shaow them
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }

);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next();
})
//Turning this off as this is refilling the data in the object
// reviewSchema.pre(/^find/, function (next) {
//     this.populate({
//         path: 'tour',
//         select: 'name'
//     })
//     next();
// })


reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
}

reviewSchema.pre('save', function (next) {
    // Review.calcAverageRatings DOES NOT WORK Review variable is not available
    this.constructor.calcAverageRatings(this.tour)
    next()
})

reviewSchema.post('save', function () {
    // this points to current review
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne();
    // console.log(this.r);
    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    // await this.findOne(); does NOT work here, query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema)
module.exports = Review;