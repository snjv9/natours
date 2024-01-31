const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell your name']
    },
    email: {
        type: String,
        required: [true, 'Please tell email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'A valid Email']
    },
    photo: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minLength: 8,
        select: false //does not shows up in response
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            //This works only on save and not on update
            validator: function (el) {
                return el === this.password
            },
            message: 'Passwords did not match'
        },
        select: false
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        select: false,
        default: true
    }
})

userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) { return next(); }

    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined
    next()
})
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) { return next(); }
    this.passwordChangeAt = Date.now() - 1000;
    next();
})
userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } })
    next()
})
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changePasswordAfter = function (JWTtimestamp) {
    if (this.passwordChangeAt) {
        const changedTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10)
        return JWTtimestamp < changedTimestamp;
    }
    //FALSE means not changed
    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 600000;
    return resetToken;
}
const User = mongoose.model('User', userSchema);
module.exports = User