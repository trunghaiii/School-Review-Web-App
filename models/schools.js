const mongoose = require("mongoose");
const Review = require("../models/reviews")

const imageSchema = new mongoose.Schema({
    url: String,
    filename: String
})

imageSchema.virtual("thumbnail").get(function(){
  return this.url.replace("/upload", "/upload/w_100,h_100")
})
const schoolSchema = new mongoose.Schema({
    name: String,
    images: [imageSchema],
    geometry: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    location: String,
    tuitionFee: Number,
    description: String,
    author:
      {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
    reviews: [
      {
        type : mongoose.Schema.Types.ObjectId,
        ref: "Review" 
      }
    ]
  });


  schoolSchema.post('findOneAndRemove', async function(doc){
   
   if(doc){
     let review = await Review.deleteMany({_id: {$in: doc.reviews}});
   }
   // console.log(doc.reviews);
  })

  const School = mongoose.model("School", schoolSchema);
  module.exports = School;