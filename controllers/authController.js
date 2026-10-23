const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const Student = require("../models/studentModel");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const signToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newStudent = await Student.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    const token = signToken({ id: newStudent._id, role: newStudent.role });

    res.status(201).json({
        message: "success",
        token,
        data: newStudent,
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError("Please provide email and password", 400));
    }

    const student = await Student.findOne({ email }).select("+password");

    if (!student || !(await student.comparePassword(password))) {
        return next(new AppError("Incorrect email or password", 401));
    }

    const token = signToken({ id: student._id, role: student.role });

    res.status(200).json({
        message: "success",
        token,
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
        return next(new AppError("You are not logged in, please login first", 401));
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const student = await Student.findById(decoded.id);
    if (!student) {
        return next(new AppError("This student no longer exists", 401));
    }

    req.student = student;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.student.role)) {
            return next(new AppError("You do not have permission to perform this action", 403));
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const student = await Student.findOne({ email: req.body.email });
    if (!student) {
        return next(new AppError("There is no student with that email address", 404));
    }

    const resetToken = student.createPasswordResetToken();
    await student.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get("host")}/api/auth/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}`;

    try {
        await sendEmail({
            email: student.email,
            subject: "Your password reset token (valid for 10 min)",
            message,
        });

        res.status(200).json({ message: "success", data: "Token sent to email" });
    } catch (err) {
        student.passwordResetToken = undefined;
        student.passwordResetExpires = undefined;
        await student.save({ validateBeforeSave: false });

        return next(new AppError("There was an error sending the email. Try again later.", 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const student = await Student.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!student) {
        return next(new AppError("Token is invalid or has expired", 400));
    }

    student.password = req.body.password;
    student.passwordConfirm = req.body.passwordConfirm;
    student.passwordResetToken = undefined;
    student.passwordResetExpires = undefined;
    await student.save();

    const token = signToken({ id: student._id, role: student.role });

    res.status(200).json({ message: "success", token });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const student = await Student.findById(req.student.id).select("+password");

    if (!(await student.comparePassword(req.body.passwordCurrent))) {
        return next(new AppError("Your current password is wrong", 401));
    }

    student.password = req.body.password;
    student.passwordConfirm = req.body.passwordConfirm;
    await student.save();

    const token = signToken({ id: student._id, role: student.role });

    res.status(200).json({ message: "success", token });
});
