const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "..", "logs", "requests.log");

// Session 1 topic: working with the file system using the fs module
module.exports = (req, res, next) => {
    const line = `${new Date().toISOString()} - ${req.method} ${req.originalUrl}\n`;

    fs.appendFile(logFile, line, (err) => {
        if (err) console.error("Failed to write request log:", err.message);
    });

    next();
};
