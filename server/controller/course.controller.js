import Course from "../models/Course.js";


export const getAllCourses = async (req,res) => {
    await Course.find({})
    .then(courses=> res.status(200).json({message:"Course fetched successfully",courses}))
    .catch(err=> res.status(500).json({message:err.message}));
}