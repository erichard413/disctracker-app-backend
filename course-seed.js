const courseData = require("./data/courses");
const course = require('./models/course');

// running this file will seed the database with courses

async function doAdd(data) {
    await course.addCourse(data);
}

for (let c of courseData) {
    doAdd(c)
}

