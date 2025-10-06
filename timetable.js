// Timetable Management JavaScript
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
// Sample timetable data
let timetableData = [
    {
        id: 'cs-fall-2024',
        name: 'Computer Science - Fall 2024',
        department: 'computer-science',
        semester: 'fall-2024',
        status: 'active',
        classes: 24,
        teachers: 8,
        rooms: 6,
        created: '2024-09-15',
        schedule: {
            'Monday': {
                '09:00-10:00': { subject: 'CS101', teacher: 'Dr. Sarah Johnson', room: 'A101' },
                '10:00-11:00': { subject: 'CS201', teacher: 'Prof. Michael Chen', room: 'B205' },
                '11:00-12:00': { subject: 'CS301', teacher: 'Dr. Emily Davis', room: 'C301' },
                '14:00-15:00': { subject: 'CS401', teacher: 'Dr. John Wilson', room: 'A101' },
                '15:00-16:00': { subject: 'CS501', teacher: 'Prof. Lisa Brown', room: 'B205' }
            },
            'Tuesday': {
                '09:00-10:00': { subject: 'CS102', teacher: 'Dr. Sarah Johnson', room: 'A101' },
                '10:00-11:00': { subject: 'CS202', teacher: 'Prof. Michael Chen', room: 'B205' },
                '11:00-12:00': { subject: 'CS302', teacher: 'Dr. Emily Davis', room: 'C301' },
                '14:00-15:00': { subject: 'CS402', teacher: 'Dr. John Wilson', room: 'A101' },
                '15:00-16:00': { subject: 'CS502', teacher: 'Prof. Lisa Brown', room: 'B205' }
            },
            'Wednesday': {
                '09:00-10:00': { subject: 'CS101', teacher: 'Dr. Sarah Johnson', room: 'A101' },
                '10:00-11:00': { subject: 'CS201', teacher: 'Prof. Michael Chen', room: 'B205' },
                '11:00-12:00': { subject: 'CS301', teacher: 'Dr. Emily Davis', room: 'C301' },
                '14:00-15:00': { subject: 'CS401', teacher: 'Dr. John Wilson', room: 'A101' },
                '15:00-16:00': { subject: 'CS501', teacher: 'Prof. Lisa Brown', room: 'B205' }
            },
            'Thursday': {
                '09:00-10:00': { subject: 'CS102', teacher: 'Dr. Sarah Johnson', room: 'A101' },
                '10:00-11:00': { subject: 'CS202', teacher: 'Prof. Michael Chen', room: 'B205' },
                '11:00-12:00': { subject: 'CS302', teacher: 'Dr. Emily Davis', room: 'C301' },
                '14:00-15:00': { subject: 'CS402', teacher: 'Dr. John Wilson', room: 'A101' },
                '15:00-16:00': { subject: 'CS502', teacher: 'Prof. Lisa Brown', room: 'B205' }
            },
            'Friday': {
                '09:00-10:00': { subject: 'CS101', teacher: 'Dr. Sarah Johnson', room: 'A101' },
                '10:00-11:00': { subject: 'CS201', teacher: 'Prof. Michael Chen', room: 'B205' },
                '11:00-12:00': { subject: 'CS301', teacher: 'Dr. Emily Davis', room: 'C301' },
                '14:00-15:00': { subject: 'LAB Session', teacher: 'Multiple', room: 'Lab1' }
            }
        }
    },
    {
        id: 'math-fall-2024',
        name: 'Mathematics - Fall 2024',
        department: 'mathematics',
        semester: 'fall-2024',
        status: 'draft',
        classes: 18,
        teachers: 6,
        rooms: 4,
        created: '2024-09-12',
        schedule: {}
    },
    {
        id: 'physics-fall-2024',
        name: 'Physics - Fall 2024',
        department: 'physics',
        semester: 'fall-2024',
        status: 'archived',
        classes: 15,
        teachers: 5,
        rooms: 3,
        created: '2024-09-10',
        schedule: {}
    }
];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeTimetablePage();
    setupEventListeners();
});

function initializeTimetablePage() {
    // Add sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    // Initialize filters
    populateFilters();
    filterTimetables();
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

// Filter functions
function filterTimetables() {
    const departmentFilter = document.getElementById('departmentFilter').value;
    const semesterFilter = document.getElementById('semesterFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    const cards = document.querySelectorAll('.timetable-card');
    
    cards.forEach(card => {
        const department = card.dataset.department;
        const semester = card.dataset.semester;
        const status = card.dataset.status;

        const showCard = 
            (!departmentFilter || department === departmentFilter) &&
            (!semesterFilter || semester === semesterFilter) &&
            (!statusFilter || status === statusFilter);

        card.style.display = showCard ? 'block' : 'none';
    });

    // Update visible count
    const visibleCards = document.querySelectorAll('.timetable-card[style="display: block"], .timetable-card:not([style*="display: none"])');
    console.log(`Showing ${visibleCards.length} timetables`);
}

function clearFilters() {
    document.getElementById('departmentFilter').value = '';
    document.getElementById('semesterFilter').value = '';
    document.getElementById('statusFilter').value = '';
    filterTimetables();
    showNotification('Filters cleared', 'info');
}

function populateFilters() {
    // This would typically populate from database
    console.log('Filters populated');
}

// Timetable actions
function viewTimetable(timetableId) {
    const timetable = timetableData.find(t => t.id === timetableId);
    if (!timetable) {
        showNotification('Timetable not found', 'error');
        return;
    }

    // Update modal title
    document.getElementById('timetableViewTitle').textContent = timetable.name;

    // Generate timetable HTML
    generateTimetableView(timetable);

    // Open modal
    openModal('timetableViewModal');
}

function generateTimetableView(timetable) {
    const tbody = document.getElementById('timetableTableBody');
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
        timeCell.innerHTML = `<div class="time-slot">${timeSlot}</div>`;
        row.appendChild(timeCell);

        // Day columns
        days.forEach(day => {
            const dayCell = document.createElement('td');
            const schedule = timetable.schedule[day];
            
            if (schedule && schedule[timeSlot]) {
                const classInfo = schedule[timeSlot];
                dayCell.innerHTML = `
                    <div class="subject-slot">
                        <div class="subject-name">${classInfo.subject}</div>
                        <div class="subject-teacher">${classInfo.teacher}</div>
                        <div class="subject-room">${classInfo.room}</div>
                    </div>
                `;
            } else if (timeSlot === '12:00-13:00') {
                dayCell.innerHTML = '<div class="subject-slot break">Lunch Break</div>';
            } else {
                dayCell.innerHTML = '<div class="subject-slot empty">Free</div>';
            }
            
            row.appendChild(dayCell);
        });

        tbody.appendChild(row);
    });
}

function editTimetable(timetableId) {
    showNotification(`Opening editor for timetable: ${timetableId}`, 'info');
    // This would open the timetable editor
}

function duplicateTimetable(timetableId) {
    const timetable = timetableData.find(t => t.id === timetableId);
    if (!timetable) {
        showNotification('Timetable not found', 'error');
        return;
    }

    showNotification(`Duplicating timetable: ${timetable.name}`, 'info');
    
    // Simulate duplication
    setTimeout(() => {
        showNotification('Timetable duplicated successfully!', 'success');
        // Refresh the page or add new card
    }, 2000);
}

function exportTimetable(timetableId) {
    const timetable = timetableData.find(t => t.id === timetableId);
    if (!timetable) {
        showNotification('Timetable not found', 'error');
        return;
    }

    showNotification('Preparing export...', 'info');

    // Simulate export
    setTimeout(() => {
        const dataStr = JSON.stringify(timetable, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${timetableId}-export.json`;
        link.click();
        
        showNotification('Timetable exported successfully!', 'success');
    }, 1500);
}

function deleteTimetable(timetableId) {
    if (!confirm('Are you sure you want to delete this timetable? This action cannot be undone.')) {
        return;
    }

    showNotification('Deleting timetable...', 'info');

    // Simulate deletion
    setTimeout(() => {
        // Remove from data array
        const index = timetableData.findIndex(t => t.id === timetableId);
        if (index !== -1) {
            timetableData.splice(index, 1);
        }

        // Remove card from DOM
        const card = document.querySelector(`[data-timetable-id="${timetableId}"]`);
        if (card) {
            card.remove();
        }

        showNotification('Timetable deleted successfully!', 'success');
    }, 1500);
}

function printTimetable() {
    const printContent = document.querySelector('.timetable-view').innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');
    
    printWindow.document.write(`
        <html>
        <head>
            <title>Timetable</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #667eea; color: white; }
                .time-slot { background: #667eea; color: white; padding: 5px; border-radius: 4px; text-align: center; }
                .subject-slot { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 5px; margin: 2px; }
                .subject-name { font-weight: bold; color: #2d3748; }
                .subject-teacher { color: #718096; font-size: 0.8em; }
                .subject-room { color: #667eea; font-size: 0.8em; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            <h1>${document.getElementById('timetableViewTitle').textContent}</h1>
            ${printContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Create new timetable
function openCreateTimetableModal() {
    openModal('createTimetableModal');
}

function createTimetable() {
    const form = document.getElementById('createTimetableForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    const workingDays = Array.from(document.querySelectorAll('input[name="workingDays"]:checked'))
        .map(cb => cb.value);

    const newTimetable = {
        id: generateTimetableId(),
        name: formData.get('timetableName'),
        department: formData.get('timetableDepartment'),
        semester: formData.get('timetableSemester'),
        status: 'draft',
        timeSlots: parseInt(formData.get('timeSlots')),
        startTime: formData.get('startTime'),
        slotDuration: parseInt(formData.get('slotDuration')),
        workingDays: workingDays,
        created: new Date().toISOString().split('T')[0],
        schedule: {}
    };

    showNotification('Creating timetable...', 'info');

    // Simulate creation
    setTimeout(() => {
        timetableData.push(newTimetable);
        addTimetableCard(newTimetable);
        closeModal('createTimetableModal');
        showNotification('Timetable created successfully!', 'success');
    }, 2000);
}

function generateTimetableId() {
    return 'tt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function addTimetableCard(timetable) {
    const grid = document.querySelector('.timetables-grid');
    const card = document.createElement('div');
    card.className = 'timetable-card';
    card.dataset.department = timetable.department;
    card.dataset.semester = timetable.semester;
    card.dataset.status = timetable.status;

    card.innerHTML = `
        <div class="card-header">
            <h3>${timetable.name}</h3>
            <div class="status-badge ${timetable.status}">${timetable.status.charAt(0).toUpperCase() + timetable.status.slice(1)}</div>
        </div>
        <div class="card-content">
            <div class="timetable-info">
                <div class="info-item">
                    <i class="fas fa-users"></i>
                    <span>${timetable.classes || 0} Classes</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-chalkboard-teacher"></i>
                    <span>${timetable.teachers || 0} Teachers</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-door-open"></i>
                    <span>${timetable.rooms || 0} Rooms</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-calendar"></i>
                    <span>Created: ${new Date(timetable.created).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
        <div class="card-actions">
            <button class="btn-icon" onclick="viewTimetable('${timetable.id}')" title="View Timetable">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon" onclick="editTimetable('${timetable.id}')" title="Edit Timetable">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon" onclick="duplicateTimetable('${timetable.id}')" title="Duplicate">
                <i class="fas fa-copy"></i>
            </button>
            <button class="btn-icon" onclick="exportTimetable('${timetable.id}')" title="Export">
                <i class="fas fa-download"></i>
            </button>
            <button class="btn-icon danger" onclick="deleteTimetable('${timetable.id}')" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    grid.prepend(card);
}

// Auto generate timetable
function generateAutoTimetable() {
    showNotification('Starting automatic timetable generation...', 'info');
    
    // Simulate auto generation process
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        showNotification(`Generating timetable... ${progress}%`, 'info');
        
        if (progress >= 100) {
            clearInterval(interval);
            showNotification('Auto-generation completed! Please review the generated timetable.', 'success');
        }
    }, 500);
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

// Notification system (reuse from dashboard.js)
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
window.timetableAPI = {
    filterTimetables,
    clearFilters,
    viewTimetable,
    editTimetable,
    duplicateTimetable,
    exportTimetable,
    deleteTimetable,
    createTimetable,
    generateAutoTimetable,
    openCreateTimetableModal,
    printTimetable,
    showNotification
};

console.log('Timetable management system loaded successfully!');