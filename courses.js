// Course Management JavaScript

// At the top of students.js, teachers.js, courses.js, timetable.js
// Replace the local data arrays with calls to dataManager

// For students.js - replace studentsData with:
let studentsData = window.dataManager.getStudents();
let filteredStudents = [...studentsData];

// Subscribe to data changes
window.dataManager.subscribe('studentAdded', (student) => {
    studentsData = window.dataManager.getStudents();
    filteredStudents = [...studentsData];
    renderStudentsTable();
    updateStatistics();
});

window.dataManager.subscribe('studentUpdated', (student) => {
    studentsData = window.dataManager.getStudents();
    filteredStudents = [...studentsData];
    renderStudentsTable();
});

window.dataManager.subscribe('studentDeleted', (student) => {
    studentsData = window.dataManager.getStudents();
    filteredStudents = [...studentsData];
    renderStudentsTable();
    updateStatistics();
});

// Update the addStudent function to use dataManager:
function addStudent() {
    const form = document.getElementById('addStudentForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    
    const newStudent = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        dateOfBirth: formData.get('dateOfBirth'),
        gender: formData.get('gender'),
        department: formData.get('department'),
        year: parseInt(formData.get('year')),
        status: 'active',
        photo: 'https://via.placeholder.com/40',
        enrollmentDate: formData.get('enrollmentDate'),
        address: formData.get('address'),
        emergencyContact: formData.get('emergencyContact'),
        gpa: 0.0,
        credits: 0,
        enrolledCourses: []
    };

    showNotification('Adding student...', 'info');

    setTimeout(() => {
        window.dataManager.addStudent(newStudent);
        closeModal('addStudentModal');
        showNotification('Student added successfully!', 'success');
    }, 1500);
}
// Sample course data
let coursesData = [
    {
        id: 'CS101',
        code: 'CS101',
        name: 'Introduction to Programming',
        department: 'computer-science',
        credits: 3,
        level: 100,
        status: 'active',
        instructor: 'Dr. Sarah Johnson',
        instructorId: 'T001',
        assistantInstructor: null,
        maxEnrollment: 50,
        currentEnrollment: 45,
        schedule: {
            days: ['monday', 'wednesday', 'friday'],
            startTime: '09:00',
            endTime: '10:00',
            room: 'A101',
            roomType: 'lecture'
        },
        description: 'An introduction to computer programming using Python. Covers basic programming concepts, data structures, and algorithms.',
        prerequisites: [],
        corequisites: [],
        syllabus: 'Basic programming concepts, variables, control structures, functions, arrays, file I/O',
        textbook: 'Python Programming: An Introduction to Computer Science by John Zelle',
        created: '2024-08-15',
        lastModified: '2024-09-10',
        enrolledStudents: [
            { id: 'CS2024001', name: 'John Smith', status: 'enrolled' },
            { id: 'CS2024002', name: 'Jane Doe', status: 'enrolled' },
            { id: 'CS2024003', name: 'Mike Wilson', status: 'waitlist' }
        ]
    },
    {
        id: 'MATH201',
        code: 'MATH201',
        name: 'Calculus II',
        department: 'mathematics',
        credits: 4,
        level: 200,
        status: 'active',
        instructor: 'Prof. Michael Chen',
        instructorId: 'T002',
        assistantInstructor: null,
        maxEnrollment: 40,
        currentEnrollment: 38,
        schedule: {
            days: ['tuesday', 'thursday'],
            startTime: '11:00',
            endTime: '12:30',
            room: 'B205',
            roomType: 'lecture'
        },
        description: 'Continuation of Calculus I. Topics include integration techniques, applications of integration, sequences and series.',
        prerequisites: ['MATH101'],
        corequisites: [],
        syllabus: 'Integration techniques, applications of integration, sequences, series, Taylor polynomials',
        textbook: 'Calculus: Early Transcendentals by James Stewart',
        created: '2024-08-20',
        lastModified: '2024-09-15',
        enrolledStudents: [
            { id: 'MATH2024001', name: 'Emily Johnson', status: 'enrolled' },
            { id: 'MATH2024002', name: 'David Brown', status: 'enrolled' }
        ]
    },
    {
        id: 'PHY301',
        code: 'PHY301',
        name: 'Quantum Physics',
        department: 'physics',
        credits: 3,
        level: 300,
        status: 'inactive',
        instructor: 'Dr. Emily Davis',
        instructorId: 'T003',
        assistantInstructor: null,
        maxEnrollment: 30,
        currentEnrollment: 22,
        schedule: {
            days: ['monday', 'wednesday'],
            startTime: '14:00',
            endTime: '15:30',
            room: 'C301',
            roomType: 'lecture'
        },
        description: 'Introduction to quantum mechanics, wave-particle duality, Schrödinger equation, and quantum systems.',
        prerequisites: ['PHY201', 'MATH201'],
        corequisites: ['MATH301'],
        syllabus: 'Wave-particle duality, uncertainty principle, Schrödinger equation, quantum harmonic oscillator',
        textbook: 'Introduction to Quantum Mechanics by David J. Griffiths',
        created: '2024-07-10',
        lastModified: '2024-08-25',
        enrolledStudents: [
            { id: 'PHY2024001', name: 'Alex Thompson', status: 'enrolled' },
            { id: 'PHY2024002', name: 'Sarah Lee', status: 'enrolled' }
        ]
    },
    {
        id: 'CHEM101',
        code: 'CHEM101',
        name: 'General Chemistry I',
        department: 'chemistry',
        credits: 4,
        level: 100,
        status: 'active',
        instructor: 'Dr. Robert Kim',
        instructorId: 'T004',
        assistantInstructor: 'TA001',
        maxEnrollment: 60,
        currentEnrollment: 55,
        schedule: {
            days: ['monday', 'wednesday', 'friday'],
            startTime: '10:00',
            endTime: '11:00',
            room: 'CHEM101',
            roomType: 'lab'
        },
        description: 'Introduction to general chemistry principles including atomic structure, chemical bonding, and stoichiometry.',
        prerequisites: ['MATH100'],
        corequisites: ['CHEM101L'],
        syllabus: 'Atomic structure, periodic table, chemical bonding, molecular geometry, stoichiometry',
        textbook: 'Chemistry: The Central Science by Brown, LeMay, Bursten',
        created: '2024-08-10',
        lastModified: '2024-09-05',
        enrolledStudents: [
            { id: 'CHEM2024001', name: 'Lisa Garcia', status: 'enrolled' },
            { id: 'CHEM2024002', name: 'Tom Anderson', status: 'enrolled' }
        ]
    }
];

let filteredCourses = [...coursesData];
let currentPage = 1;
const coursesPerPage = 10;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeCoursesPage();
    renderCoursesTable();
    updateStatistics();
    updatePagination();
});

function initializeCoursesPage() {
    // Add sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    setupEventListeners();
    filteredCourses = [...coursesData];
}

function setupEventListeners() {
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
        });
    });

    // Add event listeners for checkboxes
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('course-checkbox')) {
            updateSelectAllCheckbox();
        }
    });
}

// Search and filter functions
function searchCourses() {
    const searchTerm = document.getElementById('courseSearch').value.toLowerCase();
    
    filteredCourses = coursesData.filter(course => {
        return course.code.toLowerCase().includes(searchTerm) ||
               course.name.toLowerCase().includes(searchTerm) ||
               course.instructor.toLowerCase().includes(searchTerm) ||
               course.description.toLowerCase().includes(searchTerm);
    });

    applyFilters();
    currentPage = 1;
    renderCoursesTable();
    updatePagination();
}

function filterCourses() {
    filteredCourses = [...coursesData];
    applyFilters();
    currentPage = 1;
    renderCoursesTable();
    updatePagination();
}

function applyFilters() {
    const departmentFilter = document.getElementById('departmentFilter').value;
    const levelFilter = document.getElementById('levelFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    filteredCourses = filteredCourses.filter(course => {
        return (!departmentFilter || course.department === departmentFilter) &&
               (!levelFilter || course.level.toString() === levelFilter) &&
               (!statusFilter || course.status === statusFilter);
    });
}

// Table rendering
function renderCoursesTable() {
    const tbody = document.getElementById('coursesTableBody');
    tbody.innerHTML = '';

    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    const coursesToShow = filteredCourses.slice(startIndex, endIndex);

    coursesToShow.forEach(course => {
        const row = document.createElement('tr');
        row.dataset.courseId = course.id;
        
        const enrollmentPercentage = Math.round((course.currentEnrollment / course.maxEnrollment) * 100);
        const scheduleText = `${course.schedule.days.map(d => d.charAt(0).toUpperCase()).join('')} ${course.schedule.startTime}-${course.schedule.endTime}`;
        
        row.innerHTML = `
            <td><input type="checkbox" class="course-checkbox" value="${course.id}"></td>
            <td><strong class="course-code">${course.code}</strong></td>
            <td>${course.name}</td>
            <td>${getDepartmentName(course.department)}</td>
            <td>${course.credits}</td>
            <td>${course.instructor}</td>
            <td>
                <div class="enrollment-info">
                    <span>${course.currentEnrollment}/${course.maxEnrollment}</span>
                    <div class="enrollment-bar">
                        <div class="enrollment-progress" style="width: ${enrollmentPercentage}%"></div>
                    </div>
                </div>
            </td>
            <td><span class="schedule-info">${scheduleText}</span></td>
            <td><span class="status-badge ${course.status}">${course.status.charAt(0).toUpperCase() + course.status.slice(1)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewCourse('${course.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editCourse('${course.id}')" title="Edit Course">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="manageEnrollment('${course.id}')" title="Manage Enrollment">
                        <i class="fas fa-users"></i>
                    </button>
                    <button class="btn-icon danger" onclick="deleteCourse('${course.id}')" title="Delete Course">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });

    updateSelectAllCheckbox();
}

// Helper functions
function getDepartmentName(departmentCode) {
    const departments = {
        'computer-science': 'Computer Science',
        'mathematics': 'Mathematics',
        'physics': 'Physics',
        'chemistry': 'Chemistry'
    };
    return departments[departmentCode] || departmentCode;
}

function getLevelName(level) {
    return `${level} Level`;
}

// Pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
    const paginationInfo = document.querySelector('.pagination-info');
    const startIndex = (currentPage - 1) * coursesPerPage + 1;
    const endIndex = Math.min(currentPage * coursesPerPage, filteredCourses.length);
    
    if (paginationInfo) {
        paginationInfo.textContent = `Showing ${startIndex}-${endIndex} of ${filteredCourses.length} courses`;
    }

    // Update page buttons
    const pageNumbers = document.querySelector('.page-numbers');
    if (pageNumbers) {
        pageNumbers.innerHTML = '';
        
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            const button = document.createElement('button');
            button.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            button.textContent = i;
            button.onclick = () => changePage(i);
            pageNumbers.appendChild(button);
        }

        if (totalPages > 5) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            pageNumbers.appendChild(dots);

            const lastButton = document.createElement('button');
            lastButton.className = 'page-btn';
            lastButton.textContent = totalPages;
            lastButton.onclick = () => changePage(totalPages);
            pageNumbers.appendChild(lastButton);
        }
    }
}

function changePage(page) {
    currentPage = page;
    renderCoursesTable();
    updatePagination();
}

// Select all functionality
function toggleSelectAllCourses() {
    const selectAllCheckbox = document.getElementById('selectAllCourses');
    const courseCheckboxes = document.querySelectorAll('.course-checkbox');
    
    courseCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllCourses');
    const courseCheckboxes = document.querySelectorAll('.course-checkbox');
    const checkedBoxes = document.querySelectorAll('.course-checkbox:checked');
    
    if (selectAllCheckbox && courseCheckboxes.length > 0) {
        selectAllCheckbox.checked = checkedBoxes.length === courseCheckboxes.length;
        selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < courseCheckboxes.length;
    }
}

// Course actions
function viewCourse(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    if (!course) {
        showNotification('Course not found', 'error');
        return;
    }

    // Update modal title
    document.getElementById('courseDetailsTitle').textContent = `${course.code} - ${course.name}`;

    // Generate course details HTML
    const detailsContent = document.getElementById('courseDetailsContent');
    detailsContent.innerHTML = generateCourseDetailsHTML(course);

    // Open modal
    openModal('courseDetailsModal');
}

function generateCourseDetailsHTML(course) {
    const scheduleText = course.schedule.days.map(day => 
        day.charAt(0).toUpperCase() + day.slice(1)
    ).join(', ') + ` ${course.schedule.startTime}-${course.schedule.endTime}`;

    return `
        <div class="course-details">
            <div class="course-overview">
                <h4>Course Overview</h4>
                <div class="detail-item">
                    <span class="detail-label">Course Code:</span>
                    <span class="detail-value">${course.code}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Course Name:</span>
                    <span class="detail-value">${course.name}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Department:</span>
                    <span class="detail-value">${getDepartmentName(course.department)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Credits:</span>
                    <span class="detail-value">${course.credits}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Level:</span>
                    <span class="detail-value">${getLevelName(course.level)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">
                        <span class="status-badge ${course.status}">${course.status.charAt(0).toUpperCase() + course.status.slice(1)}</span>
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Instructor:</span>
                    <span class="detail-value">${course.instructor}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Max Enrollment:</span>
                    <span class="detail-value">${course.maxEnrollment} students</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Current Enrollment:</span>
                    <span class="detail-value">${course.currentEnrollment} students</span>
                </div>
            </div>
            <div class="course-schedule">
                <h4>Schedule Information</h4>
                <div class="schedule-item">
                    <div class="schedule-time">${course.schedule.startTime}-${course.schedule.endTime}</div>
                    <div class="schedule-days">${scheduleText}</div>
                    <div class="schedule-room">${course.schedule.room}</div>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Room Type:</span>
                    <span class="detail-value">${course.schedule.roomType.charAt(0).toUpperCase() + course.schedule.roomType.slice(1)}</span>
                </div>
            </div>
        </div>
        <div class="course-description">
            <h4>Description</h4>
            <p>${course.description}</p>
        </div>
        <div class="course-requirements">
            <h4>Prerequisites & Co-requisites</h4>
            <div class="detail-item">
                <span class="detail-label">Prerequisites:</span>
                <div class="prerequisites">
                    ${course.prerequisites.length > 0 ? 
                        course.prerequisites.map(prereq => `<span class="prerequisite-tag">${prereq}</span>`).join('') :
                        '<span class="detail-value">None</span>'
                    }
                </div>
            </div>
            <div class="detail-item">
                <span class="detail-label">Co-requisites:</span>
                <div class="prerequisites">
                    ${course.corequisites.length > 0 ? 
                        course.corequisites.map(coreq => `<span class="prerequisite-tag">${coreq}</span>`).join('') :
                        '<span class="detail-value">None</span>'
                    }
                </div>
            </div>
        </div>
        <div class="enrollment-section">
            <h4>Enrollment Information</h4>
            <div class="enrollment-stats">
                <div class="enrollment-stat">
                    <div class="enrollment-number">${course.currentEnrollment}</div>
                    <div class="enrollment-label">Enrolled</div>
                </div>
                <div class="enrollment-stat">
                    <div class="enrollment-number">${course.maxEnrollment - course.currentEnrollment}</div>
                    <div class="enrollment-label">Available</div>
                </div>
                <div class="enrollment-stat">
                    <div class="enrollment-number">${Math.round((course.currentEnrollment / course.maxEnrollment) * 100)}%</div>
                    <div class="enrollment-label">Capacity</div>
                </div>
            </div>
            <div class="student-list">
                ${course.enrolledStudents.map(student => `
                    <div class="student-item">
                        <img src="https://via.placeholder.com/32" alt="${student.name}" class="student-avatar">
                        <div class="student-info">
                            <div class="student-name">${student.name}</div>
                            <div class="student-id">${student.id}</div>
                        </div>
                        <div class="enrollment-status ${student.status}">${student.status.charAt(0).toUpperCase() + student.status.slice(1)}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="course-additional">
            <h4>Additional Information</h4>
            <div class="detail-item">
                <span class="detail-label">Syllabus:</span>
                <span class="detail-value">${course.syllabus}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Textbook:</span>
                <span class="detail-value">${course.textbook}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Created:</span>
                <span class="detail-value">${new Date(course.created).toLocaleDateString()}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Last Modified:</span>
                <span class="detail-value">${new Date(course.lastModified).toLocaleDateString()}</span>
            </div>
        </div>
    `;
}

function editCourse(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    if (!course) {
        showNotification('Course not found', 'error');
        return;
    }

    // Populate form with course data
    populateCourseForm(course);
    
    // Change modal title and button text
    document.querySelector('#addCourseModal .modal-header h3').textContent = 'Edit Course';
    document.querySelector('#addCourseModal .btn.primary').textContent = 'Update Course';
    document.querySelector('#addCourseModal .btn.primary').onclick = () => updateCourse(courseId);

    openModal('addCourseModal');
}

function populateCourseForm(course) {
    document.getElementById('courseCode').value = course.code;
    document.getElementById('courseName').value = course.name;
    document.getElementById('courseDepartment').value = course.department;
    document.getElementById('courseCredits').value = course.credits;
    document.getElementById('courseLevel').value = course.level;
    document.getElementById('maxEnrollment').value = course.maxEnrollment;
    document.getElementById('courseDescription').value = course.description;
    document.getElementById('primaryInstructor').value = course.instructorId;
    document.getElementById('assistantInstructor').value = course.assistantInstructor || '';
    document.getElementById('startTime').value = course.schedule.startTime;
    document.getElementById('endTime').value = course.schedule.endTime;
    document.getElementById('preferredRoom').value = course.schedule.room;
    document.getElementById('roomType').value = course.schedule.roomType;
    document.getElementById('prerequisites').value = course.prerequisites.join(', ');
    document.getElementById('corequisites').value = course.corequisites.join(', ');

    // Clear all meeting day checkboxes first
    document.querySelectorAll('input[name="meetingDays"]').forEach(cb => cb.checked = false);
    
    // Set meeting days checkboxes
    course.schedule.days.forEach(day => {
        const checkbox = document.querySelector(`input[name="meetingDays"][value="${day}"]`);
        if (checkbox) checkbox.checked = true;
    });
}

function updateCourse(courseId) {
    const form = document.getElementById('addCourseForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    const courseIndex = coursesData.findIndex(c => c.id === courseId);
    
    if (courseIndex === -1) {
        showNotification('Course not found', 'error');
        return;
    }

    const meetingDays = Array.from(document.querySelectorAll('input[name="meetingDays"]:checked'))
        .map(cb => cb.value);

    if (meetingDays.length === 0) {
        showNotification('Please select at least one meeting day', 'error');
        return;
    }

    const prerequisites = formData.get('prerequisites') ? 
        formData.get('prerequisites').split(',').map(p => p.trim()).filter(p => p) : [];
    const corequisites = formData.get('corequisites') ? 
        formData.get('corequisites').split(',').map(c => c.trim()).filter(c => c) : [];

    // Update course data
    coursesData[courseIndex] = {
        ...coursesData[courseIndex],
        code: formData.get('courseCode'),
        name: formData.get('courseName'),
        department: formData.get('courseDepartment'),
        credits: parseInt(formData.get('courseCredits')),
        level: parseInt(formData.get('courseLevel')),
        maxEnrollment: parseInt(formData.get('maxEnrollment')),
        description: formData.get('courseDescription'),
        instructor: getInstructorName(formData.get('primaryInstructor')),
        instructorId: formData.get('primaryInstructor'),
        assistantInstructor: formData.get('assistantInstructor') || null,
        schedule: {
            ...coursesData[courseIndex].schedule,
            days: meetingDays,
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            room: formData.get('preferredRoom'),
            roomType: formData.get('roomType')
        },
        prerequisites: prerequisites,
        corequisites: corequisites,
        lastModified: new Date().toISOString().split('T')[0]
    };

    showNotification('Updating course...', 'info');

    setTimeout(() => {
        closeModal('addCourseModal');
        resetAddCourseModal();
        filteredCourses = [...coursesData];
        renderCoursesTable();
        updateStatistics();
        showNotification('Course updated successfully!', 'success');
    }, 1500);
}

function deleteCourse(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    if (!course) {
        showNotification('Course not found', 'error');
        return;
    }

    if (!confirm(`Are you sure you want to delete ${course.code} - ${course.name}? This action cannot be undone.`)) {
        return;
    }

    showNotification('Deleting course...', 'info');

    setTimeout(() => {
        // Remove from data array
        const index = coursesData.findIndex(c => c.id === courseId);
        if (index !== -1) {
            coursesData.splice(index, 1);
            filteredCourses = filteredCourses.filter(c => c.id !== courseId);
        }

        renderCoursesTable();
        updatePagination();
        updateStatistics();
        showNotification('Course deleted successfully!', 'success');
    }, 1500);
}

function manageEnrollment(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    if (!course) {
        showNotification('Course not found', 'error');
        return;
    }

    showNotification(`Opening enrollment management for ${course.code}`, 'info');
    
    // Create and show enrollment management modal
    showEnrollmentModal(course);
}

function showEnrollmentModal(course) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('enrollmentModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal large';
        modal.id = 'enrollmentModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="enrollmentModalTitle">Enrollment Management</h3>
                    <button class="modal-close" onclick="closeModal('enrollmentModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="enrollmentModalContent"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn secondary" onclick="closeModal('enrollmentModal')">Close</button>
                    <button class="btn primary" onclick="saveEnrollmentChanges('${course.id}')">Save Changes</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Update modal content
    document.getElementById('enrollmentModalTitle').textContent = `Enrollment - ${course.code}`;
    document.getElementById('enrollmentModalContent').innerHTML = generateEnrollmentHTML(course);
    
    openModal('enrollmentModal');
}

function generateEnrollmentHTML(course) {
    return `
        <div class="enrollment-management">
            <div class="enrollment-overview">
                <div class="enrollment-stat">
                    <div class="enrollment-number">${course.currentEnrollment}</div>
                    <div class="enrollment-label">Current Enrollment</div>
                </div>
                <div class="enrollment-stat">
                    <div class="enrollment-number">${course.maxEnrollment}</div>
                    <div class="enrollment-label">Maximum Capacity</div>
                </div>
                <div class="enrollment-stat">
                    <div class="enrollment-number">${course.maxEnrollment - course.currentEnrollment}</div>
                    <div class="enrollment-label">Available Spots</div>
                </div>
            </div>
            <div class="enrolled-students">
                <h4>Enrolled Students</h4>
                <div class="student-list">
                    ${course.enrolledStudents.map(student => `
                        <div class="student-item">
                            <img src="https://via.placeholder.com/40" alt="${student.name}" class="student-avatar">
                            <div class="student-info">
                                <div class="student-name">${student.name}</div>
                                <div class="student-id">${student.id}</div>
                            </div>
                            <div class="enrollment-status ${student.status}">${student.status.charAt(0).toUpperCase() + student.status.slice(1)}</div>
                            <div class="student-actions">
                                <button class="btn-icon" onclick="removeStudentFromCourse('${course.id}', '${student.id}')" title="Remove Student">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="add-student-section">
                <h4>Add New Student</h4>
                <div class="add-student-form">
                    <input type="text" id="newStudentId" placeholder="Enter Student ID" class="form-control">
                    <button class="btn primary" onclick="addStudentToCourse('${course.id}')">
                        <i class="fas fa-plus"></i>
                        Add Student
                    </button>
                </div>
            </div>
        </div>
    `;
}

function removeStudentFromCourse(courseId, studentId) {
    if (!confirm('Are you sure you want to remove this student from the course?')) {
        return;
    }

    const course = coursesData.find(c => c.id === courseId);
    if (course) {
        course.enrolledStudents = course.enrolledStudents.filter(s => s.id !== studentId);
        course.currentEnrollment = course.enrolledStudents.length;
        
        // Refresh the enrollment modal
        showEnrollmentModal(course);
        showNotification('Student removed from course', 'success');
    }
}

function addStudentToCourse(courseId) {
    const studentId = document.getElementById('newStudentId').value.trim();
    if (!studentId) {
        showNotification('Please enter a student ID', 'error');
        return;
    }

    const course = coursesData.find(c => c.id === courseId);
    if (!course) {
        showNotification('Course not found', 'error');
        return;
    }

    // Check if student is already enrolled
    if (course.enrolledStudents.find(s => s.id === studentId)) {
        showNotification('Student is already enrolled in this course', 'error');
        return;
    }

    // Check capacity
    if (course.currentEnrollment >= course.maxEnrollment) {
        showNotification('Course is at maximum capacity', 'error');
        return;
    }

    // Add student (in real app, would validate student exists)
    course.enrolledStudents.push({
        id: studentId,
        name: `Student ${studentId}`, // Would get real name from database
        status: 'enrolled'
    });
    course.currentEnrollment = course.enrolledStudents.length;

    // Clear input and refresh modal
    document.getElementById('newStudentId').value = '';
    showEnrollmentModal(course);
    showNotification('Student added to course', 'success');
}

function saveEnrollmentChanges(courseId) {
    showNotification('Enrollment changes saved', 'success');
    closeModal('enrollmentModal');
    renderCoursesTable();
    updateStatistics();
}

// Department course views
function viewDepartmentCourses(department) {
    // Set the department filter and apply
    document.getElementById('departmentFilter').value = department;
    filterCourses();
    
    showNotification(`Showing courses for ${getDepartmentName(department)}`, 'info');
    
    // Scroll to courses table
    document.querySelector('.courses-table-section').scrollIntoView({ behavior: 'smooth' });
}

// Add new course
function openAddCourseModal() {
    resetAddCourseModal();
    openModal('addCourseModal');
}

function resetAddCourseModal() {
    // Reset modal title and button
    document.querySelector('#addCourseModal .modal-header h3').textContent = 'Add New Course';
    document.querySelector('#addCourseModal .btn.primary').textContent = 'Add Course';
    document.querySelector('#addCourseModal .btn.primary').onclick = addCourse;
    
    // Reset form
    document.getElementById('addCourseForm').reset();
    
    // Clear all checkboxes
    document.querySelectorAll('input[name="meetingDays"]').forEach(cb => cb.checked = false);
}

function addCourse() {
    const form = document.getElementById('addCourseForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    
    // Check if course code already exists
    const existingCourse = coursesData.find(c => c.code === formData.get('courseCode'));
    if (existingCourse) {
        showNotification('Course code already exists', 'error');
        return;
    }

    const meetingDays = Array.from(document.querySelectorAll('input[name="meetingDays"]:checked'))
        .map(cb => cb.value);

    if (meetingDays.length === 0) {
        showNotification('Please select at least one meeting day', 'error');
        return;
    }

    const prerequisites = formData.get('prerequisites') ? 
        formData.get('prerequisites').split(',').map(p => p.trim()).filter(p => p) : [];
    const corequisites = formData.get('corequisites') ? 
        formData.get('corequisites').split(',').map(c => c.trim()).filter(c => c) : [];

    const newCourse = {
        id: formData.get('courseCode'),
        code: formData.get('courseCode'),
        name: formData.get('courseName'),
        department: formData.get('courseDepartment'),
        credits: parseInt(formData.get('courseCredits')),
        level: parseInt(formData.get('courseLevel')),
        status: 'active',
        instructor: getInstructorName(formData.get('primaryInstructor')),
        instructorId: formData.get('primaryInstructor'),
        assistantInstructor: formData.get('assistantInstructor') || null,
        maxEnrollment: parseInt(formData.get('maxEnrollment')),
        currentEnrollment: 0,
        schedule: {
            days: meetingDays,
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            room: formData.get('preferredRoom'),
            roomType: formData.get('roomType')
        },
        description: formData.get('courseDescription'),
        prerequisites: prerequisites,
        corequisites: corequisites,
        syllabus: 'To be updated',
        textbook: 'To be assigned',
        created: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        enrolledStudents: []
    };

    showNotification('Adding course...', 'info');

    setTimeout(() => {
        coursesData.push(newCourse);
        filteredCourses = [...coursesData];
        closeModal('addCourseModal');
        renderCoursesTable();
        updatePagination();
        updateStatistics();
        showNotification('Course added successfully!', 'success');
    }, 1500);
}

function getInstructorName(instructorId) {
    // This would typically come from a teachers lookup
    const instructors = {
        'T001': 'Dr. Sarah Johnson',
        'T002': 'Prof. Michael Chen',
        'T003': 'Dr. Emily Davis',
        'T004': 'Dr. Robert Kim'
    };
    return instructors[instructorId] || 'TBD';
}

// Import/Export functions
function importCourses() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv,.xlsx,.json';
    
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            showNotification(`Importing courses from ${file.name}...`, 'info');
            
            // Simulate import process
            setTimeout(() => {
                showNotification('Courses imported successfully!', 'success');
                updateStatistics();
                renderCoursesTable();
            }, 3000);
        }
    };
    
    fileInput.click();
}

function exportCourses() {
    showNotification('Preparing export...', 'info');
    
    setTimeout(() => {
        const csvContent = generateCoursesCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `courses-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        showNotification('Courses exported successfully!', 'success');
    }, 1500);
}

function generateCoursesCSV() {
    const headers = ['Code', 'Name', 'Department', 'Credits', 'Level', 'Instructor', 'Max Enrollment', 'Current Enrollment', 'Status'];
    const rows = coursesData.map(course => [
        course.code,
        course.name,
        getDepartmentName(course.department),
        course.credits,
        course.level,
        course.instructor,
        course.maxEnrollment,
        course.currentEnrollment,
        course.status
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function manageCurriculum() {
    showNotification('Opening curriculum management interface...', 'info');
    // This would open a comprehensive curriculum management view
}

function editCurrentCourse() {
    showNotification('Opening edit form...', 'info');
}

// Statistics
function updateStatistics() {
    const totalCourses = coursesData.length;
    const activeCourses = coursesData.filter(c => c.status === 'active').length;
    const totalEnrollments = coursesData.reduce((sum, course) => sum + course.currentEnrollment, 0);
    const departments = new Set(coursesData.map(c => c.department)).size;

    // Update DOM (if stat cards exist)
    const statElements = document.querySelectorAll('.stat-card h3');
    if (statElements.length >= 4) {
        statElements[0].textContent = totalCourses;
        statElements[1].textContent = activeCourses;
        statElements[2].textContent = totalEnrollments.toLocaleString();
        statElements[3].textContent = departments;
    }
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Reset form if it exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-left: 4px solid ${getNotificationColor(type)};
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        border-radius: 8px;
        padding: 1rem;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 300px;
        animation: slideInRight 0.3s ease;
    `;

    // Add to DOM
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function getNotificationColor(type) {
    switch(type) {
        case 'success': return '#38a169';
        case 'error': return '#e53e3e';
        case 'warning': return '#ed8936';
        default: return '#667eea';
    }
}

// Export functions for global use
window.coursesAPI = {
    searchCourses,
    filterCourses,
    viewCourse,
    editCourse,
    deleteCourse,
    manageEnrollment,
    addCourse,
    importCourses,
    exportCourses,
    manageCurriculum,
    viewDepartmentCourses,
    toggleSelectAllCourses,
    openAddCourseModal,
    showNotification
};

console.log('Course management system loaded successfully!');