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

            // creating dropdown options and display the course list
            generateDropdowns();
            displayCourses(filteredData);
            showError("");
        } catch (err) {
            showError("Error: Invalid JSON file format.");
        }
    };

    // read file text
    reader.readAsText(file);
});


// creates the contents of dropdowns using unique dataset values
function generateDropdowns() {
    fillDropdown("filter-level", new Set(courseData.map(c => c.level)));
    fillDropdown("filter-credits", new Set(courseData.map(c => c.credits)));
    fillDropdown("filter-instructor", new Set(courseData.map(c => c.instructor)));
    fillDropdown("filter-department", new Set(courseData.map(c => c.department)));
    
}

// helper function to fill a dropdown with <option> tags
function fillDropdown(id, values) {
    const dropdown = document.getElementById(id);
    dropdown.innerHTML = `<option value="">All</option>`;
    Array.from(values).sort().forEach(val => {dropdown.innerHTML += `<option value="${val}">${val}</option>`;});
}


// when any dropdown chnages, refilter the data
document
    .querySelectorAll("#filter-section select")
    .forEach(sel => sel.addEventListener("change", applyFilters));


function applyFilters() {

    // gets the user selected filter values
    const level = document.getElementById("filter-level").value;
    const credits = document.getElementById("filter-credits").value;
    const instructor = document.getElementById("filter-instructor").value;
    const department = document.getElementById("filter-department").value;

    // apply all filters at once
    filteredData = courseData.filter(course => {
        return (!level || course.level == level) &&
               (!credits || course.credits == credits) &&
               (!instructor || course.instructor === instructor) &&
               (!department || course.department === department);
    });

    // reapply sorting after filtering and show filtered courses
    applySorting();
    displayCourses(filteredData);
}


// converts semester strings into sortable numbers
function semesterToNumber(str) {
    if (!str) return 0;
    const [season, year] = str.split(" ");

    // mapping seasons to a numeric order
    const order = { Winter: 1, Spring: 2, Summer: 3, Fall: 4 };

    // return year and season
    return parseInt(year) * 10 + (order[season] || 0);
}




// when user selects sort type, update sorting
document.getElementById("sort-select").addEventListener("change", applySorting);

function applySorting() {
    const type = document.getElementById("sort-select").value;

    // choose the correct sorting behavior based on selection
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

    // after sorting, update the list
    displayCourses(filteredData);
}



// shows the list of courses on the left side
function displayCourses(list) {
    const container = document.getElementById("course-list");

    // clear previous results
    container.innerHTML = "";

    // empty result message
    if (list.length === 0) {
        container.innerHTML = "<p>No courses match the selected filters.</p>";
        return;
    }

    // display each course as a clickable item
    list.forEach(course => {

        // create a div for each course
        const div = document.createElement("div");
        div.classList.add("course-item");
        
        // set text content using getSummary()
        div.textContent = course.getSummary();

        // allow keyboard focus (important for accessibility)
        div.tabIndex = 0;

        // when the user clicks on a course , show full details
        div.addEventListener("click", () => {
            document.getElementById("course-details").innerHTML =
                course.getHTMLDetails();

            // remove highlight from all courses
            container.querySelectorAll(".course-item")
                     .forEach(el => el.classList.remove("selected"));

            // highlight the clicked course
            div.classList.add("selected");
        });

        // add course to the list container
        container.appendChild(div);
    });
}

// display an error message to the user
function showError(msg) {
    document.getElementById("errorMessage").textContent = msg;
}
