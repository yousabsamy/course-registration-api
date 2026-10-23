const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.ObjectId,
            ref: "Student",
            required: [true, "Enrollment must belong to a student"],
        },
        course: {
            type: mongoose.Schema.ObjectId,
            ref: "Course",
            required: [true, "Enrollment must belong to a course"],
        },
        status: {
            type: String,
            enum: ["active", "cancelled"],
            default: "active",
        },
    },
    { timestamps: true }
);

enrollmentSchema.pre(/^find/, function () {
    this.populate({ path: "student", select: "name email" }).populate({
        path: "course",
        select: "title price startDate",
    });
});

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

module.exports = Enrollment;
