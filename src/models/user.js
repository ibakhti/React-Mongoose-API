const mongoose = require('mongoose')
const isEmail = require('validator/lib/isEmail')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name: {
        type: String, // type of data, when we type the  number, it will be converted into strings
        required: true, // client has to provide the name
        trim: true, // remove all spaces before and after string
        validate(value) {
            if(!isNaN(parseInt(value))) { // if the incoming value is numbers
                throw new Error("Name cannot be numbers, seriously ?")
            }

        }
    },
    email: { // the order of 'special property' is important
        type: String, //  type of data
        unique: true,
        required: true, // client has to provide the email
        trim: true, // remove all spaces before and after text
        lowercase: true, // change into lowercase
        validate(value) {
            if(!isEmail(value)) {
                throw new Error("Email is invalid")
            }
        }
    }, 
    password: {
        type: String, // type of data 
        required: true, // client has to provide the password
        minlength: 7, // password has atleast 7 characters 
        trim: true, // remove space before and after text
        validate(value) {
            if(value.toLowerCase().includes("password")) { // not allowed to include "password"
                throw new Error('Password doessn\'t allowed to included password word' )
            } 
        }
    },
    age : {
        type: Number, // type of data 
        default: 0, // if don't provided, client will has 0 for age value
        validate(value) { // 
            
            if(value === null){ 
                throw new Error("Age can not be empty string, really ?")
            } else if(value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    },
    avatar: { // Save image in binary
        type: Buffer
    },
    tasks : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task' 
    }]
}, {
    timestamps: true 
})

userSchema.statics.findByCredentials = async (email, password) => { // Model function
    // mencari by email
    const user = await User.findOne({ email })

    if(!user){
        throw new Error("Unable to login")
    }
    // compare password
    const isMatch = await bcrypt.compare(password, user.password) // true or false

    if(!isMatch){
        throw new Error("Unable to login")
    }

    return user

}



// Hash password before saving
userSchema.pre('save', async function(next) {
    const user = this // akses ke user {name, age, email, password}

    if(user.isModified('password')){ // apakah password  mengalami perubahan?
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()

})

const User = mongoose.model('User', userSchema)

module.exports = User