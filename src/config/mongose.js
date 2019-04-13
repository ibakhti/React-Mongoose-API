const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/jc8ReactMongoose', { // Generate connection to database
    useNewUrlParser: true, // Parsing URL to the form mongodb needs
    useCreateIndex: true, // Auto generate Indexes from mongodb, to get access to the data
    useFindAndModify: false //  deprecated
})