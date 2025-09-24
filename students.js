// CLass Room  Management JavaScript
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
// Sample student data
 studentsData = [
    {
        id: 'CS2024001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@university.edu',
        phone: '+1 (555) 123-4567',
        department: 'computer-science',
        year: 2,
        status: 'active',
        photo: 'https://via.placeholder.com/40',
        dateOfBirth: '2002-03-15',
        gender: 'male',
        address: '123 Main St, City, State 12345',
        emergencyContact: 'Jane Smith - +1 (555) 123-4568',
        enrollmentDate: '2022-08-15',
        gpa: 3.75,
        credits: 45
    },
    {
        id: 'MATH2024002',
        firstName: 'Emily',
        lastName: 'Johnson',
        email: 'emily.johnson@university.edu',
        phone: '+1 (555) 234-5678',
        department: 'mathematics',
        year: 3,
        status: 'active',
        photo: 'https://via.placeholder.com/40',
        dateOfBirth: '2001-07-22',
        gender: 'female',
        address: '456 Oak Ave, City, State 12345',
        emergencyContact: 'Robert Johnson - +1 (555) 234-5679',
        enrollmentDate: '2021-08-15',
        gpa: 3.92,
        credits: 78
    },
    {
        id: 'PHY2024003',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@university.edu',
        phone: '+1 (555) 345-6789',
        department: 'physics',
        year: 1,
        status: 'inactive',
        photo: 'https://via.placeholder.com/40',
        dateOfBirth: '2003-11-08',
        gender: 'male',
        address: '789 Pine St, City, State 12345',
        emergencyContact: 'Sarah Brown - +1 (555) 345-6790',
        enrollmentDate: '2023-08-15',
        gpa: 3.45,
        credits: 12
    }
];

 filteredStudents = [...studentsData];
let currentPage = 1;
const studentsPerPage = 10;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeStudentsPage();
    renderStudentsTable();
    updateStatistics();
});

function initializeStudentsPage() {
    // Add sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    setupEventListeners();
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

// Search and filter functions
function searchStudents() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
    
    filteredStudents = studentsData.filter(student => {
        return student.firstName.toLowerCase().includes(searchTerm) ||
               student.lastName.toLowerCase().includes(searchTerm) ||
               student.id.toLowerCase().includes(searchTerm) ||
               student.email.toLowerCase().includes(searchTerm);
    });

    applyFilters();
    renderStudentsTable();
    updatePagination();
}

function filterStudents() {
    applyFilters();
    renderStudentsTable();
    updatePagination();
}

function applyFilters() {
    const departmentFilter = document.getElementById('departmentFilter').value;
    const yearFilter = document.getElementById('yearFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    filteredStudents = filteredStudents.filter(student => {
        return (!departmentFilter || student.department === departmentFilter) &&
               (!yearFilter || student.year.toString() === yearFilter) &&
               (!statusFilter || student.status === statusFilter);
    });
}

// Table rendering
function renderStudentsTable() {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';

    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    const studentsToShow = filteredStudents.slice(startIndex, endIndex);

    studentsToShow.forEach(student => {
        const row = document.createElement('tr');
        row.dataset.studentId = student.id;
        
        row.innerHTML = `
            <td><input type="checkbox" class="student-checkbox" value="${student.id}"></td>
            <td>
                <img src="${student.photo}" alt="${student.firstName} ${student.lastName}" class="student-photo">
            </td>
            <td><strong>${student.id}</strong></td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.email}</td>
            <td>${getDepartmentName(student.department)}</td>
            <td>${getYearName(student.year)}</td>
            <td><span class="status-badge ${student.status}">${student.status.charAt(0).toUpperCase() + student.status.slice(1)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewStudent('${student.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editStudent('${student.id}')" title="Edit Student">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="viewSchedule('${student.id}')" title="View Schedule">
                        <i class="fas fa-calendar"></i>
                    </button>
                    <button class="btn-icon danger" onclick="deleteStudent('${student.id}')" title="Delete Student">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });

    updateSelectAllCheckbox();
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

function getYearName(year) {
    const years = {
        1: '1st Year',
        2: '2nd Year',
        3: '3rd Year',
        4: '4th Year'
    };
    return years[year] || `${year}th Year`;
}

// Pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
    const paginationInfo = document.querySelector('.pagination-info');
    const startIndex = (currentPage - 1) * studentsPerPage + 1;
    const endIndex = Math.min(currentPage * studentsPerPage, filteredStudents.length);
    
    paginationInfo.textContent = `Showing ${startIndex}-${endIndex} of ${filteredStudents.length} students`;

    // Update page buttons (simplified)
    const pageNumbers = document.querySelector('.page-numbers');
    pageNumbers.innerHTML = '';
    
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        const button = document.createElement('button');
        button.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        button.textContent = i;
        button.onclick = () => changePage(i);
        pageNumbers.appendChild(button);
    }
}

function changePage(page) {
    currentPage = page;
    renderStudentsTable();
    updatePagination();
}

// Select all functionality
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const studentCheckboxes = document.querySelectorAll('.student-checkbox');
    
    studentCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const studentCheckboxes = document.querySelectorAll('.student-checkbox');
    const checkedBoxes = document.querySelectorAll('.student-checkbox:checked');
    
    selectAllCheckbox.checked = studentCheckboxes.length > 0 && checkedBoxes.length === studentCheckboxes.length;
    selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < studentCheckboxes.length;
}

// Student actions
function viewStudent(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) {
        showNotification('Student not found', 'error');
        return;
    }

    // Update modal title
    document.getElementById('studentDetailsTitle').textContent = `${student.firstName} ${student.lastName}`;

    // Generate student details HTML
    const detailsContent = document.getElementById('studentDetailsContent');
    detailsContent.innerHTML = generateStudentDetailsHTML(student);

    // Open modal
    openModal('studentDetailsModal');
}

function generateStudentDetailsHTML(student) {
    return `
        <div class="student-details">
            <div class="student-avatar">
                <img src="${student.photo}" alt="${student.firstName} ${student.lastName}">
                <h3>${student.firstName} ${student.lastName}</h3>
                <p class="student-id">${student.id}</p>
                <span class="status-badge ${student.status}">${student.status.charAt(0).toUpperCase() + student.status.slice(1)}</span>
            </div>
            <div class="student-info">
                <div class="info-group">
                    <h5>Personal Information</h5>
                    <div class="info-item">
                        <span class="info-label">Email:</span>
                        <span class="info-value">${student.email}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Phone:</span>
                        <span class="info-value">${student.phone}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Date of Birth:</span>
                        <span class="info-value">${new Date(student.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Gender:</span>
                        <span class="info-value">${student.gender.charAt(0).toUpperCase() + student.gender.slice(1)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Address:</span>
                        <span class="info-value">${student.address}</span>
                    </div>
                </div>
                <div class="info-group">
                    <h5>Academic Information</h5>
                    <div class="info-item">
                        <span class="info-label">Department:</span>
                        <span class="info-value">${getDepartmentName(student.department)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Year:</span>
                        <span class="info-value">${getYearName(student.year)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Enrollment Date:</span>
                        <span class="info-value">${new Date(student.enrollmentDate).toLocaleDateString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">GPA:</span>
                        <span class="info-value">${student.gpa}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Credits Completed:</span>
                        <span class="info-value">${student.credits}</span>
                    </div>
                </div>
                <div class="info-group">
                    <h5>Emergency Contact</h5>
                    <div class="info-item">
                        <span class="info-label">Contact:</span>
                        <span class="info-value">${student.emergencyContact}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function editStudent(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) {
        showNotification('Student not found', 'error');
        return;
    }

    // Populate form with student data
    populateStudentForm(student);
    
    // Change modal title and button text
    document.querySelector('#addStudentModal .modal-header h3').textContent = 'Edit Student';
    document.querySelector('#addStudentModal .btn.primary').textContent = 'Update Student';
    document.querySelector('#addStudentModal .btn.primary').onclick = () => updateStudent(studentId);

    openModal('addStudentModal');
}

function populateStudentForm(student) {
    document.getElementById('firstName').value = student.firstName;
    document.getElementById('lastName').value = student.lastName;
    document.getElementById('email').value = student.email;
    document.getElementById('phone').value = student.phone;
    document.getElementById('dateOfBirth').value = student.dateOfBirth;
    document.getElementById('gender').value = student.gender;
    document.getElementById('studentId').value = student.id;
    document.getElementById('department').value = student.department;
    document.getElementById('year').value = student.year;
    document.getElementById('enrollmentDate').value = student.enrollmentDate;
    document.getElementById('address').value = student.address;
    document.getElementById('emergencyContact').value = student.emergencyContact;
}

function updateStudent(studentId) {
    const form = document.getElementById('addStudentForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    const studentIndex = studentsData.findIndex(s => s.id === studentId);
    
    if (studentIndex === -1) {
        showNotification('Student not found', 'error');
        return;
    }

    // Update student data
    studentsData[studentIndex] = {
        ...studentsData[studentIndex],
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        dateOfBirth: formData.get('dateOfBirth'),
        gender: formData.get('gender'),
        department: formData.get('department'),
        year: parseInt(formData.get('year')),
        enrollmentDate: formData.get('enrollmentDate'),
        address: formData.get('address'),
        emergencyContact: formData.get('emergencyContact')
    };

    showNotification('Updating student...', 'info');

    setTimeout(() => {
        closeModal('addStudentModal');
        resetAddStudentModal();
        renderStudentsTable();
        showNotification('Student updated successfully!', 'success');
    }, 1500);
}

function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        return;
    }

    showNotification('Deleting student...', 'info');

    setTimeout(() => {
        // Remove from data array
        const index = studentsData.findIndex(s => s.id === studentId);
        if (index !== -1) {
            studentsData.splice(index, 1);
            filteredStudents = filteredStudents.filter(s => s.id !== studentId);
        }

        renderStudentsTable();
        updatePagination();
        updateStatistics();
        showNotification('Student deleted successfully!', 'success');
    }, 1500);
}

function viewSchedule(studentId) {
    showNotification(`Loading schedule for student: ${studentId}`, 'info');
    // This would open the student's schedule view
}

// Add new student
function openAddStudentModal() {
    resetAddStudentModal();
    openModal('addStudentModal');
}

function resetAddStudentModal() {
    // Reset modal title and button
    document.querySelector('#addStudentModal .modal-header h3').textContent = 'Add New Student';
    document.querySelector('#addStudentModal .btn.primary').textContent = 'Add Student';
    document.querySelector('#addStudentModal .btn.primary').onclick = addStudent;
    
    // Reset form
    document.getElementById('addStudentForm').reset();
}

function addStudent() {
    const form = document.getElementById('addStudentForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    
    // Check if student ID already exists
    const existingStudent = studentsData.find(s => s.id === formData.get('studentId'));
    if (existingStudent) {
        showNotification('Student ID already exists', 'error');
        return;
    }

    const newStudent = {
        id: formData.get('studentId'),
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
        credits: 0
    };

    showNotification('Adding student...', 'info');

    setTimeout(() => {
        studentsData.push(newStudent);
        filteredStudents = [...studentsData];
        closeModal('addStudentModal');
        renderStudentsTable();
        updatePagination();
        updateStatistics();
        showNotification('Student added successfully!', 'success');
    }, 1500);
}

// Import/Export functions
function importStudents() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv,.xlsx,.json';
    
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            showNotification(`Importing students from ${file.name}...`, 'info');
            
            // Simulate import process
            setTimeout(() => {
                showNotification('Students imported successfully!', 'success');
                updateStatistics();
                renderStudentsTable();
            }, 3000);
        }
    };
    
    fileInput.click();
}

function exportStudents() {
    showNotification('Preparing export...', 'info');
    
    setTimeout(() => {
        const csvContent = generateStudentsCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `students-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        showNotification('Students exported successfully!', 'success');
    }, 1500);
}

function generateStudentsCSV() {
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Year', 'Status', 'GPA', 'Credits'];
    const rows = studentsData.map(student => [
        student.id,
        student.firstName,
        student.lastName,
        student.email,
        student.phone,
        getDepartmentName(student.department),
        getYearName(student.year),
        student.status,
        student.gpa,
        student.credits
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// Statistics
function updateStatistics() {
    const totalStudents = studentsData.length;
    const activeStudents = studentsData.filter(s => s.status === 'active').length;
    const graduatedStudents = studentsData.filter(s => s.status === 'graduated').length;
    const departments = new Set(studentsData.map(s => s.department)).size;

    // Update DOM (if stat cards exist)
    const statElements = document.querySelectorAll('.stat-card h3');
    if (statElements.length >= 4) {
        statElements[0].textContent = totalStudents.toLocaleString();
        statElements[1].textContent = activeStudents.toLocaleString();
        statElements[2].textContent = graduatedStudents;
        statElements[3].textContent = departments;
    }
}

function editCurrentStudent() {
    // This would be called from the student details modal
    showNotification('Opening edit form...', 'info');
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
window.studentsAPI = {
    searchStudents,
    filterStudents,
    viewStudent,
    editStudent,
    deleteStudent,
    viewSchedule,
    addStudent,
    importStudents,
    exportStudents,
    toggleSelectAll,
    openAddStudentModal,
    showNotification
};

console.log('Student management system loaded successfully!');
