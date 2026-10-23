const Course = require("../models/courseModel");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const ApiFilter = require("../utils/apiFilter");

exports.getTopCheapCourses = catchAsync(async (req, res) => {
    const courses = await Course.find()
        .sort("price")
        .limit(5)
        .select("title price ratingsAverage durationWeeks category");

    res.status(200).json({ message: "success", length: courses.length, data: courses });
});

exports.getAllCourses = catchAsync(async (req, res) => {
    let filter = {};
    if (req.params.categoryId) filter = { category: req.params.categoryId };

    const features = new ApiFilter(Course.find(filter), req.query).filter().sort().fields().pagination();

    const courses = await features.query;

    res.status(200).json({ message: "success", length: courses.length, data: courses });
});

exports.getCourse = catchAsync(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate("enrollments");

    if (!course) {
        return next(new AppError("No course found with that ID", 404));
    }

    res.status(200).json({ message: "success", data: course });
});

exports.createCourse = catchAsync(async (req, res) => {
    const newCourse = await Course.create(req.body);

    res.status(201).json({ message: "success", data: newCourse });
});

exports.updateCourse = catchAsync(async (req, res, next) => {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        returnDocument: "after",
        runValidators: true,
    });

    if (!course) {
        return next(new AppError("No course found with that ID", 404));
    }

    res.status(200).json({ message: "success", data: course });
});

exports.deleteCourse = catchAsync(async (req, res, next) => {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
        return next(new AppError("No course found with that ID", 404));
    }

    res.status(204).json();
});

// aggregation pipeline: summary report grouped by category
exports.getCourseStats = catchAsync(async (req, res) => {
    const stats = await Course.aggregate([
        {
            $group: {
                _id: "$category",
                numCourses: { $sum: 1 },
                avgRating: { $avg: "$ratingsAverage" },
                avgPrice: { $avg: "$price" },
            },
        },
        {
            $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "_id",
                as: "category",
            },
        },
        { $unwind: "$category" },
        {
            $project: {
                _id: 0,
                category: "$category.title",
                numCourses: 1,
                avgRating: { $round: ["$avgRating", 2] },
                avgPrice: { $round: ["$avgPrice", 2] },
            },
        },
        { $sort: { avgPrice: 1 } },
    ]);

    res.status(200).json({ message: "success", length: stats.length, data: stats });
});
