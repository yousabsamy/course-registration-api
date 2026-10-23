const AppError = require("../utils/appError");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    let error = err;

    if (error.name === "CastError") {
        error = new AppError(`Invalid ${error.path}: ${error.value}`, 400);
    }
    if (error.code === 11000) {
        error = new AppError(`Duplicate field value: ${JSON.stringify(error.keyValue)}`, 400);
    }
    if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((el) => el.message);
        error = new AppError(`Invalid input data. ${messages.join(". ")}`, 400);
    }
    if (error.name === "JsonWebTokenError") {
        error = new AppError("Invalid token. Please log in again.", 401);
    }
    if (error.name === "TokenExpiredError") {
        error = new AppError("Your token has expired. Please log in again.", 401);
    }

    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
