const fs = require("fs");
const path = require("path");
require("dotenv").config();

const dbConnection = require("../config/database");
dbConnection();

const Student = require("../models/studentModel");
const Category = require("../models/categoryModel");
const Course = require("../models/courseModel");
const Enrollment = require("../models/enrollmentModel");

const readJSON = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, "data", file), "utf-8"));

const categories = readJSON("categories.json");
const courses = readJSON("courses.json");
const students = readJSON("students.json");
const enrollments = readJSON("enrollments.json");

const importData = async () => {
    await Category.deleteMany();
    await Course.deleteMany();
    await Student.deleteMany();
    await Enrollment.deleteMany();

    const createdCategories = await Category.create(categories);
    const categoryByTitle = {};
    createdCategories.forEach((cat) => {
        categoryByTitle[cat.title] = cat._id;
    });

    const coursesWithCategoryIds = courses.map((course) => ({
        ...course,
        category: categoryByTitle[course.category],
    }));
    const createdCourses = await Course.create(coursesWithCategoryIds);
    const courseByTitle = {};
    createdCourses.forEach((course) => {
        courseByTitle[course.title] = course._id;
    });

    const createdStudents = await Student.create(students);
    const studentByEmail = {};
    createdStudents.forEach((student) => {
        studentByEmail[student.email] = student._id;
    });

    const enrollmentsWithIds = enrollments.map((enrollment) => ({
        student: studentByEmail[enrollment.studentEmail],
        course: courseByTitle[enrollment.courseTitle],
    }));
    await Enrollment.create(enrollmentsWithIds);

    console.log("Data imported success");
    process.exit();
};

const deleteData = async () => {
    await Category.deleteMany();
    await Course.deleteMany();
    await Student.deleteMany();
    await Enrollment.deleteMany();

    console.log("Data deleted success");
    process.exit();
};

if (process.argv[2] === "--import") {
    importData();
} else if (process.argv[2] === "--delete") {
    deleteData();
} else {
    console.log("Please specify --import or --delete");
    process.exit();
}
