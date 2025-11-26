

// to store the course from the json file 
let courseData = [];

// to store the currently filtered and/or sorted courses
let filteredData = [];


// Course class
class Course {

    // constructor with argument
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.level = data.level;
        this.credits = data.credits;
        this.instructor = data.instructor || "TBA";
        this.semester = data.semester;
        this.department = data.department;
        this.description = data.description;
    }

    // method to display course in a list formant (like toString)
    getSummary() {
        return `${this.id} - ${this.title} (${this.level})`;
    }

    // method to display course info 
    getHTMLDetails() {
        return `
            <h2>${this.title}</h2>
            <p><strong>ID:</strong> ${this.id}</p>
            <p><strong>Department:</strong> ${this.department}</p>
            <p><strong>Level:</strong> ${this.level}</p>
            <p><strong>Credits:</strong> ${this.credits}</p>
            <p><strong>Instructor:</strong> ${this.instructor}</p>
            <p><strong>Semester:</strong> ${this.semester}</p>
            <p><strong>Description:</strong> ${this.description}</p>
        `;
    }
}

// to respond to user input
document.getElementById("fileInput").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    // reading json from the file with errors handling
    const reader = new FileReader();

    reader.onload = function (event) {
        try {
            const json = JSON.parse(event.target.result);

            // creating course objects
            courseData = json.map(obj => new Course(obj));
            filteredData = [...courseData];

            //
            generateDropdowns();
            displayCourses(filteredData);
            showError("");
        } catch (err) {
            showError("Error: Invalid JSON file format.");
        }
    };

    reader.readAsText(file);
});

/* ---------------------------
   DROPDOWN GENERATION
---------------------------- */
function generateDropdowns() {
    fillDropdown("filter-level", new Set(courseData.map(c => c.level)));
    fillDropdown("filter-credits", new Set(courseData.map(c => c.credits)));
    fillDropdown("filter-instructor", new Set(courseData.map(c => c.instructor)));
    fillDropdown("filter-department", new Set(courseData.map(c => c.department)));
    
}

function fillDropdown(id, values) {
    const dropdown = document.getElementById(id);
    dropdown.innerHTML = `<option value="">All</option>`;
    Array.from(values).sort().forEach(val => {dropdown.innerHTML += `<option value="${val}">${val}</option>`;});
}

/* ---------------------------
   FILTERING
---------------------------- */
document
    .querySelectorAll("#filter-section select")
    .forEach(sel => sel.addEventListener("change", applyFilters));

function applyFilters() {
    const level = document.getElementById("filter-level").value;
    const credits = document.getElementById("filter-credits").value;
    const instructor = document.getElementById("filter-instructor").value;
    const department = document.getElementById("filter-department").value;

    filteredData = courseData.filter(course => {
        return (!level || course.level == level) &&
               (!credits || course.credits == credits) &&
               (!instructor || course.instructor === instructor) &&
               (!department || course.department === department);
    });

    applySorting();
    displayCourses(filteredData);
}

/* ---------------------------
   SEMESTER NORMALIZATION
---------------------------- */
function semesterToNumber(str) {
    if (!str) return 0;
    const [season, year] = str.split(" ");
    const order = { Winter: 1, Spring: 2, Summer: 3, Fall: 4 };
    return parseInt(year) * 10 + (order[season] || 0);
}

/* ---------------------------
   SORTING
---------------------------- */
document.getElementById("sort-select").addEventListener("change", applySorting);

function applySorting() {
    const type = document.getElementById("sort-select").value;

    if (type === "title-asc")
        filteredData.sort((a, b) => a.title.localeCompare(b.title));
    else if (type === "title-desc")
        filteredData.sort((a, b) => b.title.localeCompare(a.title));
    else if (type === "id")
        filteredData.sort((a, b) => a.id.localeCompare(b.id));
    else if (type === "date-new")
        filteredData.sort((a, b) => semesterToNumber(b.semester) - semesterToNumber(a.semester));
    else if (type === "date-old")
        filteredData.sort((a, b) => semesterToNumber(a.semester) - semesterToNumber(b.semester));

    displayCourses(filteredData);
}

/* ---------------------------
   COURSE LIST + DETAILS
---------------------------- */
function displayCourses(list) {
    const container = document.getElementById("course-list");
    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = "<p>No courses match the selected filters.</p>";
        return;
    }

    list.forEach(course => {
        const div = document.createElement("div");
        div.classList.add("course-item");
        div.textContent = course.getSummary();
        div.tabIndex = 0; // keyboard accessible

        div.addEventListener("click", () => {
            document.getElementById("course-details").innerHTML = course.getHTMLDetails();

            // Highlight selected course
            container.querySelectorAll(".course-item").forEach(el => el.classList.remove("selected"));
            div.classList.add("selected");
        });

        container.appendChild(div);
    });
}

/* ---------------------------
   ERROR HANDLING
---------------------------- */
function showError(msg) {
    document.getElementById("errorMessage").textContent = msg;
}
