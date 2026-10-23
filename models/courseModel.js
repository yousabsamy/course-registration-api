const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Course must have a title"],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Course must have a description"],
        },
        category: {
            type: mongoose.Schema.ObjectId,
            ref: "Category",
            required: [true, "Course must belong to a category"],
        },
        instructorName: {
            type: String,
            required: [true, "Course must have an instructor name"],
        },
        price: {
            type: Number,
            required: [true, "Course must have a price"],
            min: [0, "Price must be a positive number"],
        },
        durationWeeks: {
            type: Number,
            required: [true, "Course must have a duration in weeks"],
        },
        capacity: {
            type: Number,
            required: [true, "Course must have a capacity"],
        },
        startDate: {
            type: Date,
            required: [true, "Course must have a start date"],
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, "Rating must be above 1.0"],
            max: [5, "Rating must be below 5.0"],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// virtual field
courseSchema.virtual("pricePerWeek").get(function () {
    return Math.round((this.price / this.durationWeeks) * 100) / 100;
});

// virtual populate (referencing, not embedding - enrollments are unbounded)
courseSchema.virtual("enrollments", {
    ref: "Enrollment",
    foreignField: "course",
    localField: "_id",
});

// document middleware
courseSchema.pre("save", function () {
    this.title = this.title.trim();
});

// query middleware
courseSchema.pre(/^find/, function () {
    this.populate({ path: "category", select: "title" });
});

// aggregation middleware
courseSchema.pre("aggregate", function () {
    this.pipeline().unshift({ $match: { ratingsAverage: { $gte: 1 } } });
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
