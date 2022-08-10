const express = require('express')
const router = express.Router()

const Review = require("../models/reviews")
const School = require("../models/schools")
const {catchAsync} = require("../utils/catchAsync")
const ExpressError = require("../utils/ExpressError")
const {reviewSchema} = require("../schemas");
const {reviewValidate, isLoggedIn, isReviewAuthor} = require("../middleware")


router.post("/:id/review",isLoggedIn,reviewValidate,catchAsync(async(req,res) =>{
    
    const review = new Review(req.body.review);
    const school = await School.findById(req.params.id);
    
    review.author = req.user._id;
    school.reviews.push(review);

    await review.save();
    await school.save()
    req.flash('success', 'Created A New Comment!');
    res.redirect(`/schools/${school._id}`);
    // console.log(school);
    // console.log(review);
}))

router.delete("/:id/review/:reviewId",isLoggedIn,isReviewAuthor, catchAsync(async(req,res)=>{
    const {id,reviewId} = req.params;

    const review = await Review.findByIdAndDelete(reviewId);
    const school = await School.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});

    // await review.save();
    // await school.save();
    // console.log(school);
    req.flash('success', 'Delete The Comment Successfully!!!');
    res.redirect(`/schools/${id}`);
}))

module.exports = router;