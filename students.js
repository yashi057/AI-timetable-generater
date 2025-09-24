// ... other code above 

function renderStudentsTable() {
    const table = document.getElementById('studentsTable');
    table.innerHTML = ''; // Clear existing content

    // Assuming students is an array of student objects
    students.forEach(student => {
        const row = document.createElement('tr');

        // Create Class column
        const classCell = document.createElement('td');
        classCell.textContent = student.class;
        row.appendChild(classCell);

        // Create empty Class Capacity column
        const classCapacityCell = document.createElement('td');
        classCapacityCell.textContent = ''; // Empty cell
        row.appendChild(classCapacityCell);

        // Create Department column
        const departmentCell = document.createElement('td');
        departmentCell.textContent = student.department;
        row.appendChild(departmentCell);

        // Append the row to the table
        table.appendChild(row);
    });
}

// ... other code below