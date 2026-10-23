const Category = require("../models/categoryModel");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAllCategories = catchAsync(async (req, res) => {
    const categories = await Category.find();

    res.status(200).json({ message: "success", length: categories.length, data: categories });
});

exports.getCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return next(new AppError("No category found with that ID", 404));
    }

    res.status(200).json({ message: "success", data: category });
});

exports.createCategory = catchAsync(async (req, res) => {
    const newCategory = await Category.create(req.body);

    res.status(201).json({ message: "success", data: newCategory });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        returnDocument: "after",
        runValidators: true,
    });

    if (!category) {
        return next(new AppError("No category found with that ID", 404));
    }

    res.status(200).json({ message: "success", data: category });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
        return next(new AppError("No category found with that ID", 404));
    }

    res.status(204).json();
});
