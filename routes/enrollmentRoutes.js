const express = require("express");
const enrollmentController = require("../controllers/enrollmentController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get("/my-enrollments", enrollmentController.getMyEnrollments);

router
    .route("/")
    .get(authController.restrictTo("admin"), enrollmentController.getAllEnrollments)
    .post(authController.restrictTo("student"), enrollmentController.enrollInCourse);

router
    .route("/:id")
    .get(enrollmentController.getEnrollment)
    .delete(enrollmentController.cancelEnrollment);

module.exports = router;
