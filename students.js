

// Student Management JavaScript
let studentsData = [];
let filteredStudents = [];
let currentPage = 1;
const studentsPerPage = 10;

// Load students from database
async function loadStudentsFromDatabase() {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
        showNotification('Please log in first', 'error');
        window.location.href = '/admin';
        return;
    }

    try {
        // ✅ NEW: Fetch from approved_students (whitelist)
        const response = await fetch('http://127.0.0.1:8000/admin/approved_students', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });


        if (!response.ok) throw new Error('Failed to fetch students');

        studentsData = await response.json();
        filteredStudents = [...studentsData];

        renderStudentsTable();
        updateStatistics();
        updatePagination();

        showNotification('Students loaded successfully', 'success');
    } catch (err) {
        console.error('Error loading students:', err);
        showNotification('Error loading students: ' + err.message, 'error');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    initializeStudentsPage();
    await loadStudentsFromDatabase();
});

function initializeStudentsPage() {
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
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });

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
        return (student.firstName && student.firstName.toLowerCase().includes(searchTerm)) ||
               (student.lastName && student.lastName.toLowerCase().includes(searchTerm)) ||
               (student.username && student.username.toLowerCase().includes(searchTerm)) ||
               (student.student_id && student.student_id.toLowerCase().includes(searchTerm)) ||
               (student.email && student.email.toLowerCase().includes(searchTerm));
    });

    applyFilters();
    renderStudentsTable();
    updatePagination();
}

function filterStudents() {
    filteredStudents = [...studentsData];
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
               (!yearFilter || student.year && student.year.toString() === yearFilter) &&
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

    if (!studentsToShow || studentsToShow.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:2rem;color:#718096;">No students found. Click "Import Students" to add data.</td></tr>';
        return;
    }

    studentsToShow.forEach(student => {
        const row = document.createElement('tr');
        const studentId = student.student_id || student.id || 'N/A';
        row.dataset.studentId = studentId;

        // ✅ SAFE: Get display name with multiple fallbacks
        const displayName = student.displayName ||
                           student.fullName ||
                           student.username ||
                           `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
                           student.email?.split('@')[0] ||
                           'Unknown Student';

        const email = student.email || 'N/A';
        const department = student.department || 'N/A';
        const year = student.year || 'N/A';
        const gpa = student.gpa !== undefined && student.gpa !== null ?
                   (typeof student.gpa === 'number' ? student.gpa.toFixed(2) : student.gpa) :
                   '0.00';
        const photo = student.photo || 'https://via.placeholder.com/40';

        // ✅ Status badge with better styling
        const statusBadge = student.status === 'registered'
            ? '<span class="status-badge active" style="background:rgba(56,161,105,0.1);color:#38a169;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.75rem;font-weight:600;">✓ Registered</span>'
            : '<span class="status-badge inactive" style="background:rgba(237,137,54,0.1);color:#ed8936;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.75rem;font-weight:600;">⏳ Pending</span>';

        row.innerHTML = `
            <td><input type="checkbox" class="student-checkbox" value="${studentId}"></td>
            <td>
                <div style="position:relative;display:inline-block;"
                     onmouseenter="this.querySelector('.photo-edit-btn').style.opacity='1'"
                     onmouseleave="this.querySelector('.photo-edit-btn').style.opacity='0'">
                    <img src="${photo}"
                         alt="${displayName}"
                         class="student-photo"
                         style="width:40px;height:40px;border-radius:50%;cursor:pointer;object-fit:cover;"
                         onerror="this.src='https://via.placeholder.com/40'"
                         onclick="uploadStudentPhoto('${studentId}')">
                    <button class="photo-edit-btn"
                            onclick="uploadStudentPhoto('${studentId}')"
                            style="position:absolute;bottom:-5px;right:-5px;width:20px;height:20px;border-radius:50%;background:#667eea;color:white;border:2px solid white;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:10px;opacity:0;transition:opacity 0.2s;"
                            title="Change Photo">
                        <i class="fas fa-camera"></i>
                    </button>
                </div>
            </td>
            <td><strong>${studentId}</strong></td>
            <td>${displayName}</td>
            <td>${email}</td>
            <td>${department}</td>
            <td>${year}</td>
            <td>${gpa}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewStudent('${studentId}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editStudent('${studentId}')" title="Edit Student">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon danger" onclick="deleteStudent('${studentId}')" title="Delete Student">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(row);
    });

    updateSelectAllCheckbox();
}



// Pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
    const startIndex = (currentPage - 1) * studentsPerPage + 1;
    const endIndex = Math.min(currentPage * studentsPerPage, filteredStudents.length);

    document.getElementById('paginationInfo').textContent =
        `Showing ${startIndex}-${endIndex} of ${filteredStudents.length} students`;

    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = '';

    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        const button = document.createElement('button');
        button.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        button.textContent = i;
        button.onclick = () => { currentPage = i; renderStudentsTable(); updatePagination(); };
        pageNumbers.appendChild(button);
    }

    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
    currentPage = Math.max(1, Math.min(currentPage + direction, totalPages));
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

    if (selectAllCheckbox) {
        selectAllCheckbox.checked = studentCheckboxes.length > 0 && checkedBoxes.length === studentCheckboxes.length;
        selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < studentCheckboxes.length;
    }
}

// Student actions
function viewStudent(studentId) {
    const student = studentsData.find(s => (s.student_id || s.id) === studentId);
    if (!student) {
        showNotification('Student not found', 'error');
        return;
    }

    // ✅ Safe display name
    const displayName = student.displayName ||
                       student.fullName ||
                       student.username ||
                       `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
                       'Unknown Student';

    document.getElementById('studentDetailsTitle').textContent = displayName;

    // ✅ Safe field access
    const studentIdValue = student.student_id || student.id || 'N/A';
    const email = student.email || 'N/A';
    const phone = student.phone || 'N/A';
    const department = student.department || 'N/A';
    const year = student.year || 'N/A';
    const semester = student.semester || 'N/A';
    const gpa = student.gpa !== undefined && student.gpa !== null ?
                (typeof student.gpa === 'number' ? student.gpa.toFixed(2) : student.gpa) :
                '0.00';
    const credits = student.credits || 0;
    const dateOfBirth = student.dateOfBirth || 'N/A';
    const address = student.address || 'N/A';
    const enrollmentDate = student.enrollmentDate || student.approved_date || 'N/A';

    document.getElementById('studentDetailsContent').innerHTML = `
        <div class="student-details" style="display:grid;gap:1rem;">
            <div class="info-group" style="background:#f7fafc;padding:1rem;border-radius:8px;">
                <h5 style="color:#2d3748;font-weight:600;margin-bottom:0.5rem;">Personal Information</h5>
                <div class="info-item" style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #e2e8f0;">
                    <span class="info-label" style="color:#718096;font-weight:500;">Student ID:</span>
                    <span class="info-value" style="color:#2d3748;font-weight:500;">${studentIdValue}</span>
                </div>
                <div class="info-item" style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #e2e8f0;">
                    <span class="info-label" style="color:#718096;font-weight:500;">Name:</span>
                    <span class="info-value" style="color:#2d3748;font-weight:500;">${displayName}</span>
                </div>
                <div class="info-item" style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #e2e8f0;">
                    <span class="info-label" style="color:#718096;font-weight:500;">Email:</span>
                    <span class="info-value" style="color:#2d3748;font-weight:500;">${email}</span>
                </div>
                <div class="info-item" style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #e2e8f0;">
                    <span class="info-label" style="color:#718096;font-weight:500;">Phone:</span>
                    <span class="info-value" style="color:#2d3748;font-weight:500;">${phone}</span>
                </div>
                <div class="info-item" style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #e2e8f0;">
                    <span class="info-label" style="color:#718096;font-weight:500;">Date of Birth:</span>
                    <span class="info-value" style="color:#2d3748;font-weight:500;">${dateOfBirth}</span>
                </div>
                <div class="info-item" style="display:flex;justify-content:space-between;padding:0.5rem 0;">
                    <span class="info-label" style="color:#718096;font-weight:500;">Address:</span>
                    <span class="info-value" style="color:#2d3748;font-weight:500;">${address}</span>
                </div>
            </div>
            <div class="info-group" style="background:#f7fafc;padding:1rem;border-radius:8px;">
                <h5 style="color:#2d3748;font-weight:600;margin-bottom:0.5rem;">Academic Information</h5>
                <div class="info-item" style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #e2e8f0;">
                    <span class="info-label" style="color:#718096;font-weight:500;">Department:</span>
                    <span class="info-value" style="color:#2d3748;font-weight:500;">${department}</span>
                </div>
                <div class="info-item" style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #e2e8f0;">
                    <span class="info-label" style="color:#718096;font-weight:500;">Year:</span>
                    <span class="info-value" style="color:#2d3748;font-weight:500;">${year}</span>
                </div>
                <div class="info-item" style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #e2e8f0;">
                    <span class="info-label" style="color:#718096;font-weight:500;">Semester:</span>
                    <span class="info-value" style="color:#2d3748;font-weight:500;">${semester}</span>
                </div>
                <div class="info-item" style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #e2e8f0;">
                    <span class="info-label" style="color:#718096;font-weight:500;">GPA:</span>
                    <span class="info-value" style="color:#2d3748;font-weight:500;">${gpa}</span>
                </div>
                <div class="info-item" style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #e2e8f0;">
                    <span class="info-label" style="color:#718096;font-weight:500;">Credits:</span>
                    <span class="info-value" style="color:#2d3748;font-weight:500;">${credits}</span>
                </div>
                <div class="info-item" style="display:flex;justify-content:space-between;padding:0.5rem 0;">
                    <span class="info-label" style="color:#718096;font-weight:500;">Enrollment Date:</span>
                    <span class="info-value" style="color:#2d3748;font-weight:500;">${enrollmentDate}</span>
                </div>
            </div>
        </div>
    `;

    openModal('studentDetailsModal');
}

function editStudent(studentId) {
    showNotification('Edit feature coming soon', 'info');
}

function editCurrentStudent() {
    showNotification('Edit feature coming soon', 'info');
}

async function deleteStudent(studentId) {
    const student = studentsData.find(s => (s.student_id || s.id) === studentId);
    const confirmMsg = student && student.status === 'registered'
        ? '⚠️ This student has already registered. Delete from whitelist?\n\nThey will no longer be able to access the system.'
        : '⚠️ Remove this student from whitelist?\n\nThey will not be able to register.';

    if (!confirm(confirmMsg)) {
        return;
    }

    const authToken = localStorage.getItem('token');
    showNotification('Removing student from whitelist...', 'info');

    try {
        // ✅ NEW: Delete from approved_students collection
        const response = await fetch(`http://127.0.0.1:8000/admin/approved_student/${studentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });



        if (response.ok) {
            studentsData = studentsData.filter(s => (s.student_id || s.id) !== studentId);
            filteredStudents = filteredStudents.filter(s => (s.student_id || s.id) !== studentId);
            renderStudentsTable();
            updatePagination();
            updateStatistics();
            showNotification('Student deleted successfully!', 'success');
        } else {
            throw new Error('Failed to delete student');
        }
    } catch (err) {
        showNotification('Error deleting student: ' + err.message, 'error');
    }
}

function openAddStudentModal() {
    document.getElementById('addStudentForm').reset();
    openModal('addStudentModal');
}

async function addStudent() {
    const form = document.getElementById('addStudentForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const authToken = localStorage.getItem('token');

    const newStudent = {
        student_id: document.getElementById('studentId').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        username: `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        department: document.getElementById('department').value,
        year: parseInt(document.getElementById('year').value),
        semester: document.getElementById('semester').value,
        enrollmentDate: document.getElementById('enrollmentDate').value,
        status: 'active',
        gpa: 0.0,
        credits: 0,
        photo: 'https://via.placeholder.com/40'
    };

    showNotification('Adding student...', 'info');

    try {
        const response = await fetch('http://127.0.0.1:8000/admin/add_student', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newStudent)
        });

        if (response.ok) {
            closeModal('addStudentModal');
            await loadStudentsFromDatabase();
            showNotification('Student added successfully!', 'success');
        } else {
            const error = await response.json();
            showNotification('Error: ' + error.detail, 'error');
        }
    } catch (err) {
        showNotification('Error adding student: ' + err.message, 'error');
    }
}

// Import/Export
async function importStudents() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv,.xlsx,.xls';

    fileInput.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const authToken = localStorage.getItem('token');
        if (!authToken) {
            alert('Please log in first');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        showNotification('Uploading students...', 'info');

        try {
            const response = await fetch('http://127.0.0.1:8000/admin/upload_students', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                showNotification(`Success! Added: ${result.added}, Updated: ${result.updated}`, 'success');
                setTimeout(() => location.reload(), 1500);
            } else {
                const error = await response.json();
                showNotification('Error: ' + error.detail, 'error');
            }
        } catch (err) {
            showNotification('Upload failed: ' + err.message, 'error');
        }
    };

    fileInput.click();
}

function exportStudents() {
    showNotification('Exporting students...', 'info');

    const csvContent = 'ID,First Name,Last Name,Email,Department,Year,GPA,Credits,Status\n' +
        studentsData.map(s =>
            `${s.student_id || s.id},${s.firstName || ''},${s.lastName || ''},${s.email || ''},${s.department || ''},${s.year || ''},${s.gpa || ''},${s.credits || ''},${s.status || ''}`
        ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `students-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showNotification('Students exported successfully!', 'success');
}

// Statistics
function updateStatistics() {
    const totalStudents = studentsData.length;
    const activeStudents = studentsData.filter(s => s.status === 'active').length;
    const graduatedStudents = studentsData.filter(s => s.status === 'graduated').length;
    const departments = new Set(studentsData.map(s => s.department).filter(d => d)).size;

    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('activeStudents').textContent = activeStudents;
    document.getElementById('graduatedStudents').textContent = graduatedStudents;
    document.getElementById('totalDepartments').textContent = departments;
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
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

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

    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: white;
        border-left: 4px solid ${getNotificationColor(type)};
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        border-radius: 8px; padding: 1rem; z-index: 10000;
        display: flex; align-items: center; gap: 1rem; min-width: 300px;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

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

// ==================== UPLOAD STUDENT PHOTO ====================
async function uploadStudentPhoto(studentId) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg,image/jpg,image/png,image/gif';

    fileInput.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // ✅ CHECK FILE SIZE (max 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            showNotification('⚠️ Image too large! Please use an image smaller than 2MB.', 'error');
            return;
        }

        // ✅ CHECK FILE TYPE
        if (!file.type.startsWith('image/')) {
            showNotification('⚠️ Please select an image file (JPG, PNG, GIF)', 'error');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please log in first', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        showNotification('Uploading photo...', 'info');

        try {
            const response = await fetch(`http://127.0.0.1:8000/admin/upload_student_photo/${studentId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                showNotification('✅ Photo uploaded successfully!', 'success');
                await loadStudentsFromDatabase();
            } else {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to upload photo');
            }
        } catch (err) {
            showNotification('❌ Error: ' + err.message, 'error');
        }
    };

    fileInput.click();
}

console.log('Student management system loaded successfully!');
