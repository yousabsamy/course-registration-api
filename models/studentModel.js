const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Student must have a name"],
            minlength: [3, "name must be at least 3 characters"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Student must have an email"],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, "Invalid email"],
        },
        photo: String,
        role: {
            type: String,
            enum: { values: ["student", "admin"], message: "role must be student or admin" },
            default: "student",
        },
        password: {
            type: String,
            required: [true, "Student must have a password"],
            minlength: [8, "password must be at least 8 characters"],
            select: false,
        },
        passwordConfirm: {
            type: String,
            required: [true, "Please confirm your password"],
            validate: {
                validator: function (val) {
                    return val === this.password;
                },
                message: "Passwords do not match",
            },
        },
        passwordResetToken: String,
        passwordResetExpires: Date,
    },
    { timestamps: true }
);

studentSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
});

studentSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

studentSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
