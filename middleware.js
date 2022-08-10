const { schoolSchema,reviewSchema } = require("./schemas")
const School = require("./models/schools")
const ExpressError = require("./utils/ExpressError");
const Review = require("./models/reviews");



module.exports.isLoggedIn = (req,res,next) =>{
    
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You Must Be Signed In First!!");
        return res.redirect("/login");
    }
    next();
}




module.exports.schoolValidate = (req, res, next) => {
    const result = schoolSchema.validate(req.body);
    if (result.error) {
        const msg = result.error.details[0].message;
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isAuthor = async (req,res,next) => {
    const {id} = req.params;
    let theSchool = await School.findById(id);
    if(!(theSchool.author._id.equals(req.user._id))){
           req.flash("error", "You do not have permission to do that!!!")
           return res.redirect(`/schools/${id}`)
    }
    next();
}

module.exports.isReviewAuthor = async (req,res,next) => {
    const {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    // console.log(req.user);
    if(!(review.author._id.equals(req.user._id))){
           req.flash("error", "You do not have permission to do that!!!")
           return res.redirect(`/schools/${id}`)
    }
    next();
}

module.exports.reviewValidate = (req,res,next) =>{
    const result = reviewSchema.validate(req.body);
    if(result.error){
         const msg = result.error.details[0].message;
         throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
