// Teacher Management JavaScript
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
// Sample teacher data
let teachersData = [
    {
        id: 'T001',
        firstName: 'Sarah',
        lastName: 'Johnson',
        title: 'professor',
        email: 'sarah.johnson@university.edu',
        phone: '+1 (555) 123-4567',
        department: 'computer-science',
        status: 'active',
        photo: 'https://via.placeholder.com/100',
        joinDate: '2018-08-15',
        qualification: 'phd',
        experience: 12,
        maxHours: 24,
        preferredDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        subjects: ['CS101', 'CS201', 'CS301', 'CS401'],
        currentHours: 24,
        totalStudents: 180,
        officeHours: 'MWF 2:00-4:00 PM',
        officeLocation: 'Building A, Room 205',
        schedule: {
            'Monday': {
                '09:00-10:00': 'CS101',
                '10:00-11:00': 'CS201',
                '14:00-15:00': 'CS301'
            },
            'Tuesday': {
                '09:00-10:00': 'CS102',
                '11:00-12:00': 'CS401',
                '15:00-16:00': 'Office Hours'
            },
            'Wednesday': {
                '09:00-10:00': 'CS101',
                '10:00-11:00': 'CS201',
                '14:00-15:00': 'CS301'
            },
            'Thursday': {
                '10:00-11:00': 'CS401',
                '14:00-15:00': 'Research',
                '15:00-16:00': 'Office Hours'
            },
            'Friday': {
                '09:00-10:00': 'CS101',
                '11:00-12:00': 'Faculty Meeting',
                '14:00-15:00': 'Office Hours'
            }
        }
    },
    {
        id: 'T002',
        firstName: 'Michael',
        lastName: 'Chen',
        title: 'associate-professor',
        email: 'michael.chen@university.edu',
        phone: '+1 (555) 234-5678',
        department: 'mathematics',
        status: 'active',
        photo: 'https://via.placeholder.com/100',
        joinDate: '2020-01-10',
        qualification: 'phd',
        experience: 8,
        maxHours: 20,
        preferredDays: ['monday', 'tuesday', 'thursday', 'friday'],
        subjects: ['MATH101', 'MATH201', 'MATH301'],
        currentHours: 20,
        totalStudents: 145,
        officeHours: 'TTh 1:00-3:00 PM',
        officeLocation: 'Building B, Room 301',
        schedule: {
            'Monday': {
                '10:00-11:00': 'MATH101',
                '11:00-12:00': 'MATH201',
                '14:00-15:00': 'MATH301'
            },
            'Tuesday': {
                '09:00-10:00': 'MATH101',
                '13:00-14:00': 'Office Hours',
                '15:00-16:00': 'MATH201'
            },
            'Wednesday': {
                '10:00-11:00': 'Research',
                '14:00-15:00': 'Committee Meeting'
            },
            'Thursday': {
                '10:00-11:00': 'MATH101',
                '13:00-14:00': 'Office Hours',
                '15:00-16:00': 'MATH301'
            },
            'Friday': {
                '11:00-12:00': 'MATH201',
                '14:00-15:00': 'Faculty Seminar'
            }
        }
    },
    {
        id: 'T003',
        firstName: 'Emily',
        lastName: 'Davis',
        title: 'assistant-professor',
        email: 'emily.davis@university.edu',
        phone: '+1 (555) 345-6789',
        department: 'physics',
        status: 'on-leave',
        photo: 'https://via.placeholder.com/100',
        joinDate: '2021-09-01',
        qualification: 'phd',
        experience: 5,
        maxHours: 18,
        preferredDays: ['monday', 'wednesday', 'friday'],
        subjects: ['PHY101', 'PHY201', 'PHY301'],
        currentHours: 0,
        totalStudents: 0,
        officeHours: 'On Leave',
        officeLocation: 'Building C, Room 105',
        schedule: {}
    }
];

let filteredTeachers = [...teachersData];
let currentView = 'grid';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeTeachersPage();
    renderTeachersView();
    updateStatistics();
});

function initializeTeachersPage() {
    // Add sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    setupEventListeners();
    filteredTeachers = [...teachersData];
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
}

// View switching
function switchView(viewType) {
    currentView = viewType;
    
    // Update view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="switchView('${viewType}')"]`).classList.add('active');
    
    renderTeachersView();
}

function renderTeachersView() {
    const container = document.getElementById('teachersGrid');
    
    if (currentView === 'grid') {
        container.className = 'teachers-grid';
        renderGridView(container);
    } else {
        container.className = 'teachers-list';
        renderListView(container);
    }
}

function renderGridView(container) {
    container.innerHTML = '';
    
    filteredTeachers.forEach(teacher => {
        const card = document.createElement('div');
        card.className = 'teacher-card';
        card.dataset.teacherId = teacher.id;
        
        card.innerHTML = `
            <div class="teacher-photo">
                <img src="${teacher.photo}" alt="${teacher.firstName} ${teacher.lastName}">
                <div class="status-indicator ${teacher.status}"></div>
            </div>
            <div class="teacher-info">
                <h3>Dr. ${teacher.firstName} ${teacher.lastName}</h3>
                <p class="title">${getTitleName(teacher.title)}</p>
                <p class="department">${getDepartmentName(teacher.department)}</p>
                <div class="contact-info">
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <span>${teacher.email}</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span>${teacher.phone}</span>
                    </div>
                </div>
                <div class="teacher-stats">
                    <div class="stat-item">
                        <span class="stat-number">${teacher.subjects.length}</span>
                        <span class="stat-label">Subjects</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${teacher.currentHours}</span>
                        <span class="stat-label">Hours/Week</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${teacher.totalStudents}</span>
                        <span class="stat-label">Students</span>
                    </div>
                </div>
            </div>
            <div class="teacher-actions">
                <button class="btn-icon" onclick="viewTeacher('${teacher.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" onclick="editTeacher('${teacher.id}')" title="Edit Teacher">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="viewSchedule('${teacher.id}')" title="View Schedule">
                    <i class="fas fa-calendar"></i>
                </button>
                <button class="btn-icon" onclick="assignSubjects('${teacher.id}')" title="Assign Subjects">
                    <i class="fas fa-book"></i>
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function renderListView(container) {
    container.innerHTML = '';
    
    filteredTeachers.forEach(teacher => {
        const item = document.createElement('div');
        item.className = 'teacher-list-item';
        item.dataset.teacherId = teacher.id;
        
        item.innerHTML = `
            <div class="teacher-list-photo">
                <img src="${teacher.photo}" alt="${teacher.firstName} ${teacher.lastName}">
                <div class="status-indicator ${teacher.status}"></div>
            </div>
            <div class="teacher-list-info">
                <div class="teacher-basic-info">
                    <h4>Dr. ${teacher.firstName} ${teacher.lastName}</h4>
                    <p>${getTitleName(teacher.title)} - ${getDepartmentName(teacher.department)}</p>
                </div>
                <div class="teacher-contact">
                    <div>${teacher.email}</div>
                    <div>${teacher.phone}</div>
                </div>
                <div class="teacher-workload">
                    <div class="workload-hours">${teacher.currentHours}/${teacher.maxHours}</div>
                    <div class="workload-label">Hours/Week</div>
                </div>
                <div class="teacher-actions">
                    <button class="btn-icon" onclick="viewTeacher('${teacher.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editTeacher('${teacher.id}')" title="Edit Teacher">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="viewSchedule('${teacher.id}')" title="View Schedule">
                        <i class="fas fa-calendar"></i>
                    </button>
                    <button class="btn-icon" onclick="assignSubjects('${teacher.id}')" title="Assign Subjects">
                        <i class="fas fa-book"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// Helper functions
function getTitleName(titleCode) {
    const titles = {
        'professor': 'Professor',
        'associate-professor': 'Associate Professor',
        'assistant-professor': 'Assistant Professor',
        'lecturer': 'Lecturer',
        'instructor': 'Instructor'
    };
    return titles[titleCode] || titleCode;
}

function getDepartmentName(departmentCode) {
    const departments = {
        'computer-science': 'Computer Science',
        'mathematics': 'Mathematics',
        'physics': 'Physics',
        'chemistry': 'Chemistry'
    };
    return departments[departmentCode] || departmentCode;
}

// Search and filter functions
function searchTeachers() {
    const searchTerm = document.getElementById('teacherSearch').value.toLowerCase();
    
    filteredTeachers = teachersData.filter(teacher => {
        return teacher.firstName.toLowerCase().includes(searchTerm) ||
               teacher.lastName.toLowerCase().includes(searchTerm) ||
               teacher.id.toLowerCase().includes(searchTerm) ||
               teacher.email.toLowerCase().includes(searchTerm);
    });

    applyFilters();
    renderTeachersView();
}

function filterTeachers() {
    filteredTeachers = [...teachersData];
    applyFilters();
    renderTeachersView();
}

function applyFilters() {
    const departmentFilter = document.getElementById('departmentFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    filteredTeachers = filteredTeachers.filter(teacher => {
        return (!departmentFilter || teacher.department === departmentFilter) &&
               (!statusFilter || teacher.status === statusFilter);
    });
}

// Teacher actions
function viewTeacher(teacherId) {
    const teacher = teachersData.find(t => t.id === teacherId);
    if (!teacher) {
        showNotification('Teacher not found', 'error');
        return;
    }

    showNotification(`Viewing details for ${teacher.firstName} ${teacher.lastName}`, 'info');
    
    // Create and show teacher details modal
    showTeacherDetails(teacher);
}

function showTeacherDetails(teacher) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('teacherDetailsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal large';
        modal.id = 'teacherDetailsModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="teacherDetailsTitle">Teacher Details</h3>
                    <button class="modal-close" onclick="closeModal('teacherDetailsModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="teacherDetailsContent"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn secondary" onclick="closeModal('teacherDetailsModal')">Close</button>
                    <button class="btn primary" onclick="editTeacher('${teacher.id}')">Edit Teacher</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Update modal content
    document.getElementById('teacherDetailsTitle').textContent = `Dr. ${teacher.firstName} ${teacher.lastName}`;
    document.getElementById('teacherDetailsContent').innerHTML = generateTeacherDetailsHTML(teacher);
    
    openModal('teacherDetailsModal');
}

function generateTeacherDetailsHTML(teacher) {
    return `
        <div class="teacher-details">
            <div class="teacher-profile">
                <div class="teacher-avatar">
                    <img src="${teacher.photo}" alt="${teacher.firstName} ${teacher.lastName}">
                    <h3>Dr. ${teacher.firstName} ${teacher.lastName}</h3>
                    <p class="teacher-title">${getTitleName(teacher.title)}</p>
                    <span class="status-badge ${teacher.status}">${teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}</span>
                </div>
                <div class="teacher-stats-detailed">
                    <div class="stat-detailed">
                        <div class="stat-number">${teacher.subjects.length}</div>
                        <div class="stat-label">Subjects Teaching</div>
                    </div>
                    <div class="stat-detailed">
                        <div class="stat-number">${teacher.currentHours}</div>
                        <div class="stat-label">Current Hours</div>
                    </div>
                    <div class="stat-detailed">
                        <div class="stat-number">${teacher.totalStudents}</div>
                        <div class="stat-label">Total Students</div>
                    </div>
                    <div class="stat-detailed">
                        <div class="stat-number">${teacher.experience}</div>
                        <div class="stat-label">Years Experience</div>
                    </div>
                </div>
            </div>
            <div class="teacher-info-detailed">
                <div class="info-section">
                    <h4>Contact Information</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Email:</label>
                            <span>${teacher.email}</span>
                        </div>
                        <div class="info-item">
                            <label>Phone:</label>
                            <span>${teacher.phone}</span>
                        </div>
                        <div class="info-item">
                            <label>Office Location:</label>
                            <span>${teacher.officeLocation}</span>
                        </div>
                        <div class="info-item">
                            <label>Office Hours:</label>
                            <span>${teacher.officeHours}</span>
                        </div>
                    </div>
                </div>
                <div class="info-section">
                    <h4>Professional Information</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Department:</label>
                            <span>${getDepartmentName(teacher.department)}</span>
                        </div>
                        <div class="info-item">
                            <label>Join Date:</label>
                            <span>${new Date(teacher.joinDate).toLocaleDateString()}</span>
                        </div>
                        <div class="info-item">
                            <label>Qualification:</label>
                            <span>${teacher.qualification.toUpperCase()}</span>
                        </div>
                        <div class="info-item">
                            <label>Experience:</label>
                            <span>${teacher.experience} years</span>
                        </div>
                    </div>
                </div>
                <div class="info-section">
                    <h4>Teaching Load</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Current Hours:</label>
                            <span>${teacher.currentHours} hours/week</span>
                        </div>
                        <div class="info-item">
                            <label>Maximum Hours:</label>
                            <span>${teacher.maxHours} hours/week</span>
                        </div>
                        <div class="info-item">
                            <label>Preferred Days:</label>
                            <span>${teacher.preferredDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}</span>
                        </div>
                        <div class="info-item">
                            <label>Subjects:</label>
                            <span>${teacher.subjects.join(', ')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function editTeacher(teacherId) {
    const teacher = teachersData.find(t => t.id === teacherId);
    if (!teacher) {
        showNotification('Teacher not found', 'error');
        return;
    }

    // Populate form with teacher data
    populateTeacherForm(teacher);
    
    // Change modal title and button text
    document.querySelector('#addTeacherModal .modal-header h3').textContent = 'Edit Teacher';
    document.querySelector('#addTeacherModal .btn.primary').textContent = 'Update Teacher';
    document.querySelector('#addTeacherModal .btn.primary').onclick = () => updateTeacher(teacherId);

    openModal('addTeacherModal');
}

function populateTeacherForm(teacher) {
    document.getElementById('teacherFirstName').value = teacher.firstName;
    document.getElementById('teacherLastName').value = teacher.lastName;
    document.getElementById('teacherEmail').value = teacher.email;
    document.getElementById('teacherPhone').value = teacher.phone;
    document.getElementById('teacherId').value = teacher.id;
    document.getElementById('teacherTitle').value = teacher.title;
    document.getElementById('teacherDepartment').value = teacher.department;
    document.getElementById('joinDate').value = teacher.joinDate;
    document.getElementById('qualification').value = teacher.qualification;
    document.getElementById('experience').value = teacher.experience;
    document.getElementById('maxHours').value = teacher.maxHours;
    
    // Clear all checkboxes first
    document.querySelectorAll('input[name="preferredDays"]').forEach(cb => cb.checked = false);
    
    // Set preferred days checkboxes
    teacher.preferredDays.forEach(day => {
        const checkbox = document.querySelector(`input[value="${day}"]`);
        if (checkbox) checkbox.checked = true;
    });
}

function updateTeacher(teacherId) {
    const form = document.getElementById('addTeacherForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    const teacherIndex = teachersData.findIndex(t => t.id === teacherId);
    
    if (teacherIndex === -1) {
        showNotification('Teacher not found', 'error');
        return;
    }

    const preferredDays = Array.from(document.querySelectorAll('input[name="preferredDays"]:checked'))
        .map(cb => cb.value);

    // Update teacher data
    teachersData[teacherIndex] = {
        ...teachersData[teacherIndex],
        firstName: formData.get('teacherFirstName'),
        lastName: formData.get('teacherLastName'),
        email: formData.get('teacherEmail'),
        phone: formData.get('teacherPhone'),
        title: formData.get('teacherTitle'),
        department: formData.get('teacherDepartment'),
        joinDate: formData.get('joinDate'),
        qualification: formData.get('qualification'),
        experience: parseInt(formData.get('experience')) || 0,
        maxHours: parseInt(formData.get('maxHours')) || 0,
        preferredDays: preferredDays
    };

    showNotification('Updating teacher...', 'info');

    setTimeout(() => {
        closeModal('addTeacherModal');
        resetAddTeacherModal();
        filteredTeachers = [...teachersData];
        renderTeachersView();
        updateStatistics();
        showNotification('Teacher updated successfully!', 'success');
    }, 1500);
}

function viewSchedule(teacherId) {
    const teacher = teachersData.find(t => t.id === teacherId);
    if (!teacher) {
        showNotification('Teacher not found', 'error');
        return;
    }

    // Update modal title
    document.getElementById('scheduleModalTitle').textContent = `Schedule - Dr. ${teacher.firstName} ${teacher.lastName}`;

    // Generate schedule HTML
    generateTeacherSchedule(teacher);

    // Open modal
    openModal('teacherScheduleModal');
}

function generateTeacherSchedule(teacher) {
    const tbody = document.getElementById('scheduleTableBody');
    tbody.innerHTML = '';

    const timeSlots = [
        '09:00-10:00',
        '10:00-11:00',
        '11:00-12:00',
        '12:00-13:00',
        '13:00-14:00',
        '14:00-15:00',
        '15:00-16:00',
        '16:00-17:00'
    ];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    timeSlots.forEach(timeSlot => {
        const row = document.createElement('tr');
        
        // Time column
        const timeCell = document.createElement('td');
        timeCell.innerHTML = `<strong>${timeSlot}</strong>`;
        row.appendChild(timeCell);

        // Day columns
        days.forEach(day => {
            const dayCell = document.createElement('td');
            const schedule = teacher.schedule[day];
            
            if (schedule && schedule[timeSlot]) {
                const activity = schedule[timeSlot];
                dayCell.innerHTML = `
                    <div class="schedule-slot occupied">
                        ${activity}
                    </div>
                `;
            } else if (timeSlot === '12:00-13:00') {
                dayCell.innerHTML = '<div class="schedule-slot break">Lunch Break</div>';
            } else {
                dayCell.innerHTML = '<div class="schedule-slot">Free</div>';
            }
            
            row.appendChild(dayCell);
        });

        tbody.appendChild(row);
    });
}

function assignSubjects(teacherId) {
    const teacher = teachersData.find(t => t.id === teacherId);
    if (!teacher) {
        showNotification('Teacher not found', 'error');
        return;
    }

    showNotification(`Opening subject assignment for ${teacher.firstName} ${teacher.lastName}`, 'info');
    // This would open a subject assignment modal
}

// Add new teacher
function openAddTeacherModal() {
    resetAddTeacherModal();
    openModal('addTeacherModal');
}

function resetAddTeacherModal() {
    // Reset modal title and button
    document.querySelector('#addTeacherModal .modal-header h3').textContent = 'Add New Teacher';
    document.querySelector('#addTeacherModal .btn.primary').textContent = 'Add Teacher';
    document.querySelector('#addTeacherModal .btn.primary').onclick = addTeacher;
    
    // Reset form
    document.getElementById('addTeacherForm').reset();
    
    // Clear all checkboxes
    document.querySelectorAll('input[name="preferredDays"]').forEach(cb => cb.checked = false);
    
    // Set default preferred days
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
        const checkbox = document.querySelector(`input[value="${day}"]`);
        if (checkbox) checkbox.checked = true;
    });
}

function addTeacher() {
    const form = document.getElementById('addTeacherForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    
    // Check if teacher ID already exists
    const existingTeacher = teachersData.find(t => t.id === formData.get('teacherId'));
    if (existingTeacher) {
        showNotification('Teacher ID already exists', 'error');
        return;
    }

    const preferredDays = Array.from(document.querySelectorAll('input[name="preferredDays"]:checked'))
        .map(cb => cb.value);

    const newTeacher = {
        id: formData.get('teacherId'),
        firstName: formData.get('teacherFirstName'),
        lastName: formData.get('teacherLastName'),
        title: formData.get('teacherTitle'),
        email: formData.get('teacherEmail'),
        phone: formData.get('teacherPhone'),
        department: formData.get('teacherDepartment'),
        status: 'active',
        photo: 'https://via.placeholder.com/100',
        joinDate: formData.get('joinDate'),
        qualification: formData.get('qualification'),
        experience: parseInt(formData.get('experience')) || 0,
        maxHours: parseInt(formData.get('maxHours')) || 20,
        preferredDays: preferredDays,
        subjects: [],
        currentHours: 0,
        totalStudents: 0,
        officeHours: 'TBD',
        officeLocation: 'TBD',
        schedule: {}
    };

    showNotification('Adding teacher...', 'info');

    setTimeout(() => {
        teachersData.push(newTeacher);
        filteredTeachers = [...teachersData];
        closeModal('addTeacherModal');
        renderTeachersView();
        updateStatistics();
        showNotification('Teacher added successfully!', 'success');
    }, 1500);
}

// Import/Export functions
function importTeachers() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv,.xlsx,.json';
    
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            showNotification(`Importing teachers from ${file.name}...`, 'info');
            
            // Simulate import process
            setTimeout(() => {
                showNotification('Teachers imported successfully!', 'success');
                updateStatistics();
                renderTeachersView();
            }, 3000);
        }
    };
    
    fileInput.click();
}

function manageSchedules() {
    showNotification('Opening schedule management interface...', 'info');
    // This would open a comprehensive schedule management view
}

function editTeacherSchedule() {
    showNotification('Opening schedule editor...', 'info');
    // This would open the schedule editing interface
}

// Statistics
function updateStatistics() {
    const totalTeachers = teachersData.length;
    const activeTeachers = teachersData.filter(t => t.status === 'active').length;
    const totalHours = teachersData.reduce((sum, teacher) => sum + teacher.currentHours, 0);
    const totalSubjects = [...new Set(teachersData.flatMap(t => t.subjects))].length;

    // Update DOM (if stat cards exist)
    const statElements = document.querySelectorAll('.stat-card h3');
    if (statElements.length >= 4) {
        statElements[0].textContent = totalTeachers;
        statElements[1].textContent = activeTeachers;
        statElements[2].textContent = totalHours.toLocaleString();
        statElements[3].textContent = totalSubjects;
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
window.teachersAPI = {
    searchTeachers,
    filterTeachers,
    viewTeacher,
    editTeacher,
    viewSchedule,
    assignSubjects,
    addTeacher,
    importTeachers,
    manageSchedules,
    switchView,
    openAddTeacherModal,
    showNotification
};

console.log('Teacher management system loaded successfully!');