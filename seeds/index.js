const express = require('express')
const mongoose = require("mongoose")
const school = require("../models/schools")
const theSchools = require("./data")
const app = express()


mongoose.connect('mongodb://localhost:27017/schoolDB',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
    console.log("Connected successfully");
});


const seedDB = async () => {
    await school.deleteMany({});
    for (let i = 0; i < 14; i++) {
        let s = new school({
            author: "62e94fb5e8b9af8f2d9bd42f",
            name: theSchools[i].name,
            location: theSchools[i].location,
            images:  [
                {
                  url: 'https://res.cloudinary.com/dbljsakpb/image/upload/v1659562143/schoolReview/a0xwa1cr5kbla654x0fj.jpg',
                  filename: 'schoolReview/a0xwa1cr5kbla654x0fj'
                },
                {
                  url: 'https://res.cloudinary.com/dbljsakpb/image/upload/v1659562143/schoolReview/xrw88ze7uy3fyuxyxm7e.jpg',
                  filename: 'schoolReview/xrw88ze7uy3fyuxyxm7e'
                }
              ],
            geometry:  { type: 'Point', coordinates: [ 105.75, 21 ] },
            tuitionFee: 20000,
            description: "is simply dudfjdsh also the leap into electronic typesetting, remaining essentially unchanged."

        });
        await s.save();
    }
}

seedDB();