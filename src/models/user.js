const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')




const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,

        validate(value) {

            if(!validator.isEmail(value)) {
                throw new Error("Email is invalid.")
            }
        }
    },
    age: {
        type: Number,
        default: 17,
        validate(value) {
            if (value < 16) {
                throw new Error("Must be at least 17 to sign-up.")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value) {
            
            if(value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain the word password')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})


//THESE ARE SCHEMA FUNCTIONS, they ONLY work when we define the object model via
// a schema instead of inline

//a virtual property is like a temp property - not saved to db and only lasts as long as the call to it does

//virtual property
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

//The difference between .methods. and .statics. are that statics are model-level functions
// and methods are instance-level functions

userSchema.methods.generateAuthToken = async function() {

    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    await user.save()
    return token

}

//returns User objects as missing password and tokens by default
userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject

}

//finds the user by their email and password
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email: email.toLowerCase()})
    if(!user) {
        throw new Error('Unable to login.')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) {
        throw new Error('Login process did not work.')
    }
    return user
}


//hash the password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

//delete user's tasks when user is removed

userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({ owner: user._id})

})


const User = mongoose.model('User', userSchema)

module.exports = User