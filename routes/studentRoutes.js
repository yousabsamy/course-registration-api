const express = require("express");
const studentController = require("../controllers/studentController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/me", authController.protect, studentController.getMe);
router.patch(
    "/updateMe",
    authController.protect,
    studentController.uploadStudentPhoto,
    studentController.updateMe
);

router.get("/", authController.protect, authController.restrictTo("admin"), studentController.getAllStudents);
router
    .route("/:id")
    .get(authController.protect, authController.restrictTo("admin"), studentController.getStudent)
    .patch(authController.protect, authController.restrictTo("admin"), studentController.updateStudent)
    .delete(authController.protect, authController.restrictTo("admin"), studentController.deleteStudent);

module.exports = router;
