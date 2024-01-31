const mongoose = require('mongoose')
const slugify = require('slugify');

const tourSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxLength: [40, 'A tour length must be less than 40 characters'],
        minLength: [10, 'A tour length must be more than 40 characters'],

    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tou must have max group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },

    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1'],
        max: [5, 'Rating must be below 5']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validator: {
            validate: function (val) {
                return val < this.price
            },
            message: 'Discount price ({VALUE})should be less than price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour musr have a image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false,
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    })

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
})

tourSchema.index({ price: 1, ratingsAverage: -1 })
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

//Virtual Populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangeAt'
    })
    next();
})

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    next();
});
//Embedding
// tourSchema.pre('save', async function (next) {
//     const guidePromises = this.guides.map(async (id) => { return await User.findById(id) });
//     this.guides = await Promise.all(guidePromises)
//     next()
// })

//DOCUMENT MIDDLEWARE: runs when save and create command
// tourSchema.pre('save', function (next) {
//     next();
// })

//Document middleware runs just after save
// tourSchema.post('save',function(doc,next){
//     next()
// })

//QUERY MIDDLEWARE
// tourSchema.pre(/^tour/, function (next) {
//     this.find({ secretTour: { $ne: true } })
//     next();
// })
const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour