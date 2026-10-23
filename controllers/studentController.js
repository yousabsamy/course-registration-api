const multer = require("multer");

const Student = require("../models/studentModel");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/img/students");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `student-${req.student.id}-${Date.now()}.${ext}`);
    },
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(new AppError("Not an image! Please upload only images.", 400), false);
    }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadStudentPhoto = upload.single("photo");

exports.getMe = catchAsync(async (req, res, next) => {
    res.status(200).json({ message: "success", data: req.student });
});

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("This route is not for password updates. Use /updateMyPassword.", 400));
    }

    const updateData = { name: req.body.name, email: req.body.email };
    if (req.file) updateData.photo = req.file.filename;

    const updatedStudent = await Student.findByIdAndUpdate(req.student.id, updateData, {
        returnDocument: "after",
        runValidators: true,
    });

    res.status(200).json({ message: "success", data: updatedStudent });
});

exports.getAllStudents = catchAsync(async (req, res) => {
    const students = await Student.find();

    res.status(200).json({ message: "success", length: students.length, data: students });
});

exports.getStudent = catchAsync(async (req, res, next) => {
    const student = await Student.findById(req.params.id);

    if (!student) {
        return next(new AppError("No student found with that ID", 404));
    }

    res.status(200).json({ message: "success", data: student });
});

exports.updateStudent = catchAsync(async (req, res, next) => {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
        returnDocument: "after",
        runValidators: true,
    });

    if (!student) {
        return next(new AppError("No student found with that ID", 404));
    }

    res.status(200).json({ message: "success", data: student });
});

exports.deleteStudent = catchAsync(async (req, res, next) => {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
        return next(new AppError("No student found with that ID", 404));
    }

    res.status(204).json();
});
