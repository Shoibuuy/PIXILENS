const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb+srv://shabzmhmd9:1234@cluster0.a8cdy0y.mongodb.net/pixilens'); 



        if (conn) {
            console.log('server created succesfully')
        }

    } catch (error) {
        console.log(error.message);
    }

}

module.exports = connectDB;
