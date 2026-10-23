const express = require("express");
const categoryController = require("../controllers/categoryController");
const courseController = require("../controllers/courseController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/:categoryId/courses", courseController.getAllCourses);

router
    .route("/")
    .get(categoryController.getAllCategories)
    .post(authController.protect, authController.restrictTo("admin"), categoryController.createCategory);

router
    .route("/:id")
    .get(categoryController.getCategory)
    .patch(authController.protect, authController.restrictTo("admin"), categoryController.updateCategory)
    .delete(authController.protect, authController.restrictTo("admin"), categoryController.deleteCategory);

module.exports = router;
