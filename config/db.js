const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb://localhost:27017/VincentChase'); 



        if (conn) {
            console.log('server created succesfully')
        }

    } catch (error) {
        console.log(error.message);
    }

}

module.exports = connectDB;
