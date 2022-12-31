const express = require('express')
const router = express.Router()

const School = require("../models/schools")
const Review = require("../models/reviews")
const { catchAsync } = require("../utils/catchAsync")
const {isLoggedIn, schoolValidate,isAuthor} = require("../middleware");

const multer  = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({ storage })
const cloudinary = require('cloudinary').v2;
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});


router.get("/", async (req, res) => {
    let school = await School.find({});
    res.render("school/index", { school });

})

router.get("/new",isLoggedIn, (req, res) => {
    res.render("school/new");
})

router.post("/", isLoggedIn,upload.array('image'),schoolValidate, catchAsync(async (req, res) => {

    const geoData = await geocoder.forwardGeocode({
        query: req.body.school.location,
        limit: 1
    }).send()


    let s = new School(req.body.school);
    s.geometry = geoData.body.features[0].geometry;
    s.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    s.author = req.user._id;
    await s.save();
    console.log(s);
    req.flash('success', 'Create The School Successfully!!!');
    res.redirect(`/schools/${s._id}`);

}))

// router.post("/",upload.array('image'), (req,res) =>{
//     res.send("It Worked");
//     console.log(req.body, req.files);
// })

router.get("/topschool", catchAsync(async (req, res) => {
    let list = {};
    let listTop = [];
    let school = await School.find({});
    
    for(let i = 0; i < school.length; i++){
        let schoolName = school[i].name;
        let averageStar = 0;
        let sum = 0;
        for(let j = 0; j < school[i].reviews.length; j++){  
            let star = await Review.findById(school[i].reviews[j]);
            //console.log(star.rating);
            sum += star.rating;
        }

        averageStar = Number((sum/school[i].reviews.length).toFixed(1));
        if(!averageStar) averageStar = 0;
        list[schoolName] = averageStar;
        // console.log(schoolName,averageStar);
    }
     console.log(list);

     for(let h = 0; h < 5; h++){
        let max = Object.keys(list).reduce((a, b) => list[a] > list[b] ? a : b);
        listTop.push([max,list[max]]);
        delete list[max];
     }

     //console.log(listTop);
     res.render("school/topSchool", {listTop});
    
}))

router.get("/:id", catchAsync(async (req, res, next) => {
    let school = await School.findById(req.params.id).populate({
        path:'reviews',
        populate: {
            path: 'author'
        }
    
    }).populate('author');
    //console.log(school);
    if (!school) {
        req.flash('error', 'Cannot Find The School!!');
        return res.redirect("/schools");
    }
    res.render("school/show", { school });

}))

router.get("/:id/edit",isLoggedIn,isAuthor, catchAsync(async (req, res) => {
    let school = await School.findById(req.params.id);
    if (!school) {
        req.flash('error', 'Cannot Find The School!!');
        return res.redirect("/schools");
    }
    res.render("school/edit", { school });
}))

router.put("/:id",isAuthor,isLoggedIn,upload.array('image'),schoolValidate, catchAsync(async (req, res) => {
    const {id} = req.params;
    // console.log(req.body);
    let s = await School.findByIdAndUpdate(id, req.body.school);
    let imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    s.images.push(...imgs);
    await s.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }

        await s.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
    }
    req.flash('success', 'Update The School Successfully!!!');
    res.redirect(`/schools/${req.params.id}`);
}))

router.delete("/:id",isLoggedIn,isAuthor, catchAsync(async (req, res) => {
    let s = await School.findByIdAndRemove(req.params.id);
    req.flash('success', 'Delete The School Successfully!!!');
    res.redirect("/schools");
}))

router.post("/search", catchAsync(async (req, res) => {
    let school = await School.find({});
    let searchSchoolList = school.filter(s => s.name.toLowerCase().includes(req.body.search.toLowerCase()));

    res.render("school/searchIndex", { searchSchoolList });
    // console.log(searchSchoolList);
    // res.send("It work Hai a");
    //console.log(req.body.search);
}))

module.exports = router;