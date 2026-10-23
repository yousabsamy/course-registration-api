const Enrollment = require("../models/enrollmentModel");
const Course = require("../models/courseModel");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.enrollInCourse = catchAsync(async (req, res, next) => {
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId);
    if (!course) {
        return next(new AppError("No course found with that ID", 404));
    }

    const existing = await Enrollment.findOne({
        student: req.student.id,
        course: courseId,
        status: "active",
    });
    if (existing) {
        return next(new AppError("You are already enrolled in this course", 400));
    }

    const activeCount = await Enrollment.countDocuments({ course: courseId, status: "active" });
    if (activeCount >= course.capacity) {
        return next(new AppError("This course has reached its enrollment capacity", 400));
    }

    const enrollment = await Enrollment.create({ student: req.student.id, course: courseId });

    res.status(201).json({ message: "success", data: enrollment });
});

exports.getMyEnrollments = catchAsync(async (req, res) => {
    const enrollments = await Enrollment.find({ student: req.student.id });

    res.status(200).json({ message: "success", length: enrollments.length, data: enrollments });
});

exports.getAllEnrollments = catchAsync(async (req, res) => {
    let filter = {};
    if (req.params.courseId) filter = { course: req.params.courseId };

    const enrollments = await Enrollment.find(filter);

    res.status(200).json({ message: "success", length: enrollments.length, data: enrollments });
});

exports.getEnrollment = catchAsync(async (req, res, next) => {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
        return next(new AppError("No enrollment found with that ID", 404));
    }

    if (req.student.role !== "admin" && enrollment.student.id !== req.student.id) {
        return next(new AppError("You do not have permission to view this enrollment", 403));
    }

    res.status(200).json({ message: "success", data: enrollment });
});

exports.cancelEnrollment = catchAsync(async (req, res, next) => {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
        return next(new AppError("No enrollment found with that ID", 404));
    }

    if (req.student.role !== "admin" && enrollment.student.id !== req.student.id) {
        return next(new AppError("You do not have permission to cancel this enrollment", 403));
    }

    enrollment.status = "cancelled";
    await enrollment.save();

    res.status(204).json();
});
