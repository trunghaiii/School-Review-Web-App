const Joi = require('joi');

module.exports.schoolSchema = Joi.object({
    school: Joi.object({
        
        name: Joi.string().required(),
        location: Joi.string().required(),
        // image: Joi.string().required(),
        tuitionFee: Joi.number().min(0).required(),
        description: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        
       comment: Joi.string().required(),
       rating: Joi.number().min(1).max(5).required()
    }).required()
})


