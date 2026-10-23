# Online Course Registration System

A backend REST API I built as my summer training final project (FUE / AiTB Node.js Training 2025).

## Summary

This project is the backend for an online course registration platform:

- **Students** can sign up, log in, browse courses, and enroll in or cancel courses.
- **Admins** can manage categories, courses, and students.
- **Security**: passwords are hashed with bcrypt, login uses JWT tokens, and some routes are admin-only.
- **Extra features**: filtering, sorting and pagination of courses, course statistics (aggregation),
  profile photo upload, and forgot/reset password by email.

There is no frontend. All endpoints are tested with the included Postman collection.

## Tech stack

Node.js, Express, MongoDB Atlas, Mongoose, JWT, bcryptjs, Multer, Nodemailer.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `DB_URL` - your MongoDB Atlas connection string
   - `JWT_SECRET` - any long random string
   - `EMAIL_*` - a free [Mailtrap](https://mailtrap.io) sandbox inbox (or Ethereal) for testing
     password-reset emails
3. Seed the database:
   ```
   npm run seed:import
   ```
   This creates 4 categories, 5 courses, and 3 students - one of them a seeded admin
   (`admin@course-registration.com` / `admin1234`), plus 2 sample enrollments.
4. Run the server:
   ```
   npm run dev
   ```
5. Import `postman/Course-Registration-API.postman_collection.json` and
   `postman/Course-Registration-API.postman_environment.json` into Postman, select the
   environment, and start with the "Auth" folder - logging in auto-saves the JWT into
   `{{token}}` for every other request.

To wipe the database: `npm run seed:delete`

## Project structure

```
server.js                  express app, middleware, route mounting, DB connection, listen
config/database.js         mongoose connection
models/                    studentModel, categoryModel, courseModel, enrollmentModel
controllers/                authController, studentController, categoryController,
                            courseController, enrollmentController, errorController
routes/                    authRoutes, studentRoutes, categoryRoutes, courseRoutes,
                            enrollmentRoutes
utils/                      appError, catchAsync, apiFilter, email, requestLogger
dev/                        seed.js + data/*.json fixtures
public/img/students/        uploaded profile photos
postman/                    Postman collection + environment
```

## Data model

- **Student**: name, email, password (hashed), role (`student` | `admin`), photo
- **Category**: title
- **Course**: title, description, category (ref), instructorName, price, durationWeeks,
  capacity, startDate, ratingsAverage
- **Enrollment**: student (ref), course (ref), status (`active` | `cancelled`)

`Category -1:N- Course` and `Student -N:M- Course` (via `Enrollment`, the join collection).
Enrollments are **referenced**, not embedded, in Course - the list of enrolled students is
unbounded and queried independently, so embedding an array on Course would grow without limit.

## Where each session's topic shows up

| Session | Topic | Where |
|---|---|---|
| 1 | HTTP server, routing, `fs` module | `server.js` (routing), `utils/requestLogger.js` (writes each request to `logs/requests.log`) |
| 2 | Async/await, try/catch, NPM | Every controller uses `async/await`; `utils/catchAsync.js` centralizes try/catch |
| 3 | Express & middleware | `server.js` (`express.json()`, `morgan`, mounted routers) |
| 4 | MongoDB/Mongoose setup, dotenv | `config/database.js`, `.env` |
| 5 | Seeding via `process.argv`, MVC | `dev/seed.js` (`--import` / `--delete`), overall `models/ controllers/ routes/` split |
| 6 | Filtering, pagination, field limiting | `utils/apiFilter.js`, used in `courseController.getAllCourses` |
| 7 | Aggregation pipeline | `courseController.getCourseStats` (`$group`, `$lookup`, `$project`) |
| 8 | Virtual fields, Mongoose middleware, validation | `courseModel.js` (virtual `pricePerWeek`, virtual populate `enrollments`, pre-save/pre-find/pre-aggregate hooks), `validator` package in `studentModel.js` |
| 9 | DB design & relationships | `Category`-`Course` (referenced 1:N), `Student`-`Course` via `Enrollment` (referenced N:M) - see Data model above |
| 10 | Custom errors, bcrypt | `utils/appError.js`, `controllers/errorController.js` (global handler), bcrypt hashing in `studentModel.js` |
| 11 | JWT auth, roles, file uploads | `authController.js` (`protect`, `restrictTo`), Multer in `studentController.js` |
| 12 | Forgot/reset password | `authController.forgotPassword` / `resetPassword` (crypto token + Nodemailer) |
