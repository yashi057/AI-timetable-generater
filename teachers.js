
// ==================== TEACHER MANAGEMENT JAVASCRIPT ====================

let teachersData = [];
let filteredTeachers = [];
let currentView = 'grid';

// ==================== LOAD TEACHERS FROM DATABASE ====================
async function loadTeachersFromDatabase() {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
        showNotification('Please log in first', 'error');
        window.location.href = '/admin';
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/admin/approved_teachers', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Failed to fetch teachers');

        teachersData = await response.json();
        filteredTeachers = [...teachersData];

        renderTeachersView();
        updateStatistics();

        showNotification('Teachers loaded successfully', 'success');
    } catch (err) {
        console.error('Error loading teachers:', err);
        showNotification('Error loading teachers: ' + err.message, 'error');
    }
}

// ==================== INITIALIZE PAGE ====================
document.addEventListener('DOMContentLoaded', async function() {
    initializeTeachersPage();
    await loadTeachersFromDatabase();
});

function initializeTeachersPage() {
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

// ==================== VIEW SWITCHING ====================
function switchView(viewType) {
    currentView = viewType;

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

// ==================== RENDER GRID VIEW (WITH STATUS BADGE) ====================
function renderGridView(container) {
    container.innerHTML = '';

    if (filteredTeachers.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #718096;">
                <i class="fas fa-user-times" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>No teachers found</p>
                <button class="btn primary" onclick="openAddTeacherModal()" style="margin-top: 1rem;">
                    Add Your First Teacher
                </button>
            </div>
        `;
        return;
    }

    filteredTeachers.forEach(teacher => {
        const card = document.createElement('div');
        card.className = 'teacher-card';

        const teacherId = teacher.teacher_id || teacher.id || teacher.email;
        card.dataset.teacherId = teacherId;

        const fullName = teacher.displayName || teacher.fullName || teacher.username ||
                 `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() ||
                 teacher.email || 'Unknown Teacher';

        let photoUrl = 'https://via.placeholder.com/100?text=No+Photo';
        if (teacher.photo && teacher.photo.startsWith('data:image')) {
            photoUrl = teacher.photo;
        } else if (teacher.photo && teacher.photo.startsWith('http')) {
            photoUrl = teacher.photo;
        } else if (teacher.photos && teacher.photos.length > 0 && teacher.photos[0]) {
            photoUrl = teacher.photos[0];
        } else {
            photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&size=100&background=667eea&color=fff`;
        }

        const email = teacher.email || 'No email';
        const phone = teacher.phone || 'No phone';
        const title = teacher.title || teacher.position || 'lecturer';
        const department = teacher.department || teacher.Department || '';
        const status = teacher.status || 'pending';
        const subjects = teacher.subjects || [];
        const currentHours = teacher.currentHours || teacher['Current Hours'] || 0;
        const totalStudents = teacher.totalStudents || teacher['Total students'] || 0;

        // ✅ STATUS BADGE
        const statusBadge = status === 'registered'
            ? '<span class="status-badge active" style="display:inline-block;padding:0.25rem 0.5rem;border-radius:12px;font-size:0.75rem;background:#d4edda;color:#155724;margin:0.5rem 0;">✓ Registered</span>'
            : '<span class="status-badge inactive" style="display:inline-block;padding:0.25rem 0.5rem;border-radius:12px;font-size:0.75rem;background:#fff3cd;color:#856404;margin:0.5rem 0;">⏳ Pending</span>';

        card.innerHTML = `
            <div class="teacher-photo">
                <img src="${photoUrl}"
                     alt="${fullName}"
                     onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&size=100&background=667eea&color=fff'">
                <div class="status-indicator ${status.toLowerCase()}" title="${status === 'registered' ? 'Registered' : 'Pending'}"></div>
                <button class="photo-upload-btn" onclick="uploadTeacherPhoto('${teacherId}')" title="Change Photo">
                    <i class="fas fa-camera"></i>
                </button>
            </div>
            <div class="teacher-info">
                <h3>${fullName}</h3>
                <p class="title">${getTitleName(title)}</p>
                <p class="department">${getDepartmentName(department)}</p>
                ${statusBadge}
                <div class="contact-info">
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <span>${email}</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span>${phone}</span>
                    </div>
                </div>
                <div class="teacher-stats">
                    <div class="stat-item">
                        <span class="stat-number">${Array.isArray(subjects) ? subjects.length : 0}</span>
                        <span class="stat-label">Subjects</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${currentHours}</span>
                        <span class="stat-label">Hours/Week</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${totalStudents}</span>
                        <span class="stat-label">Students</span>
                    </div>
                </div>
            </div>
            <div class="teacher-actions">
                <button class="btn-icon" onclick="viewTeacher('${teacherId}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" onclick="editTeacherModal('${teacherId}')" title="Edit Teacher">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="viewSchedule('${teacherId}')" title="View Schedule">
                    <i class="fas fa-calendar"></i>
                </button>
                <button class="btn-icon" onclick="deleteTeacherConfirm('${teacherId}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

// ==================== HELPER FUNCTIONS ====================
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

// ==================== SEARCH AND FILTER ====================
function searchTeachers() {
    const searchTerm = document.getElementById('teacherSearch').value.toLowerCase();

    filteredTeachers = teachersData.filter(teacher => {
        const firstName = teacher.firstName || '';
        const lastName = teacher.lastName || '';
        const email = teacher.email || '';
        const teacherId = teacher.teacher_id || teacher.id || '';

        return firstName.toLowerCase().includes(searchTerm) ||
               lastName.toLowerCase().includes(searchTerm) ||
               teacherId.toLowerCase().includes(searchTerm) ||
               email.toLowerCase().includes(searchTerm);
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

// ==================== DELETE TEACHER (UPDATED) ====================
async function deleteTeacherConfirm(teacherId) {
    const teacher = teachersData.find(t => (t.teacher_id || t.id || t.email) === teacherId);
    if (!teacher) {
        showNotification('Teacher not found', 'error');
        return;
    }

    const fullName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.username;
    const status = teacher.status || 'pending';

    const confirmMsg = status === 'registered'
        ? `⚠️ ${fullName} has already registered. Delete from whitelist?\n\nThey will no longer be able to access the system.\n\nThis action cannot be undone.`
        : `⚠️ Remove ${fullName} from whitelist?\n\nThey will not be able to register.\n\nThis action cannot be undone.`;

    if (!confirm(confirmMsg)) {
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Please log in first', 'error');
        return;
    }

    showNotification('Removing teacher from whitelist...', 'info');

    try {
        const response = await fetch(`http://127.0.0.1:8000/admin/approved_teacher/${teacherId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showNotification('Teacher removed from whitelist successfully!', 'success');
            await loadTeachersFromDatabase();
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to delete teacher');
        }
    } catch (err) {
        showNotification('Error: ' + err.message, 'error');
    }
}

// ==================== ADD TEACHER ====================
function openAddTeacherModal() {
    document.getElementById('addTeacherForm').reset();
    document.querySelector('#addTeacherModal .modal-header h3').textContent = 'Add New Teacher';
    openModal('addTeacherModal');
}

async function addTeacher() {
    const form = document.getElementById('addTeacherForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Please log in first', 'error');
        return;
    }

    const preferredDays = Array.from(
        document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked')
    ).map(cb => cb.value);

    const teacherData = {
        teacher_id: document.getElementById('teacherId').value.trim(),
        firstName: document.getElementById('teacherFirstName').value.trim(),
        lastName: document.getElementById('teacherLastName').value.trim(),
        email: document.getElementById('teacherEmail').value.trim(),
        phone: document.getElementById('teacherPhone').value.trim(),
        title: document.getElementById('teacherTitle').value,
        department: document.getElementById('teacherDepartment').value,
        joinDate: document.getElementById('joinDate').value,
        qualification: document.getElementById('qualification').value,
        experience: parseInt(document.getElementById('experience').value) || 0,
        maxHours: parseInt(document.getElementById('maxHours').value) || 20,
        preferredDays: preferredDays,
        status: 'pending',
        photo: '',
        subjects: [],
        currentHours: 0,
        totalStudents: 0,
        officeHours: 'TBD',
        officeLocation: 'TBD',
        role: 'faculty'
    };

    showNotification('Adding teacher...', 'info');

    try {
        const response = await fetch('http://127.0.0.1:8000/admin/add_teacher', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(teacherData)
        });

        if (response.ok) {
            showNotification('Teacher added successfully!', 'success');
            closeModal('addTeacherModal');
            await loadTeachersFromDatabase();
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to add teacher');
        }
    } catch (err) {
        showNotification('Error: ' + err.message, 'error');
    }
}

// ==================== IMPORT TEACHERS ====================
async function importTeachers() {
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

        showNotification('Uploading teachers...', 'info');

        try {
            const response = await fetch('http://127.0.0.1:8000/admin/upload_teachers', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                showNotification(
                    `Success! Added: ${result.added}, Updated: ${result.updated}`,
                    'success'
                );
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

// ==================== UPLOAD PHOTO ====================
async function uploadTeacherPhoto(teacherId) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg,image/jpg,image/png,image/gif';

    fileInput.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // ✅ ADD SIZE CHECK
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            showNotification('⚠️ Image too large! Please use an image smaller than 2MB.', 'error');
            return;
        }

        // ✅ ADD TYPE CHECK
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
            const response = await fetch(`http://127.0.0.1:8000/admin/upload_teacher_photo/${teacherId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                showNotification('✅ Photo uploaded successfully!', 'success');
                await loadTeachersFromDatabase();
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

// ==================== STATISTICS ====================
function updateStatistics() {
    const totalTeachers = teachersData.length;
    const registeredTeachers = teachersData.filter(t => t.status === 'registered').length;
    const totalHours = teachersData.reduce((sum, teacher) => sum + (teacher.currentHours || 0), 0);
    const totalSubjects = [...new Set(teachersData.flatMap(t => t.subjects || []))].length;

    document.getElementById('statTotalTeachers').textContent = totalTeachers;
    document.getElementById('statActiveTeachers').textContent = registeredTeachers;
    document.getElementById('statTotalHours').textContent = totalHours.toLocaleString();
    document.getElementById('statTotalSubjects').textContent = totalSubjects;
}

// ==================== MODAL FUNCTIONS ====================
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

        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

// ==================== NOTIFICATION SYSTEM ====================
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

// ==================== PLACEHOLDER FUNCTIONS ====================
function viewTeacher(teacherId) {
    showNotification('View teacher details coming soon', 'info');
}

function editTeacherModal(teacherId) {
    showNotification('Edit teacher coming soon', 'info');
}

function viewSchedule(teacherId) {
    showNotification('View schedule coming soon', 'info');
}

function manageSchedules() {
    showNotification('Schedule management coming soon', 'info');
}

function editTeacherSchedule() {
    showNotification('Edit schedule coming soon', 'info');
}

function renderListView(container) {
    container.innerHTML = '<p style="text-align:center;padding:2rem;">List view coming soon</p>';
}

console.log('✅ Teacher management system loaded successfully!');
