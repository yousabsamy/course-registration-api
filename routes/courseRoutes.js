const express = require("express");
const courseController = require("../controllers/courseController");
const authController = require("../controllers/authController");
const enrollmentRouter = require("./enrollmentRoutes");

const router = express.Router();

router.use("/:courseId/enrollments", enrollmentRouter);

router.get("/top-5-cheap", courseController.getTopCheapCourses);
router.get("/stats", courseController.getCourseStats);

router
    .route("/")
    .get(courseController.getAllCourses)
    .post(authController.protect, authController.restrictTo("admin"), courseController.createCourse);

router
    .route("/:id")
    .get(courseController.getCourse)
    .patch(authController.protect, authController.restrictTo("admin"), courseController.updateCourse)
    .delete(authController.protect, authController.restrictTo("admin"), courseController.deleteCourse);

module.exports = router;
