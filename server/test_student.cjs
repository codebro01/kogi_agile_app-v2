const mongoose = require('mongoose');
const { Student } = require('./models/index.js');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const students = await Student.find({
        accountNumber: { $nin: [null, '', ' '] }
    }).limit(5).select('_id presentClass');
    console.log("Found students:", students);
    process.exit(0);
}).catch(console.error);
