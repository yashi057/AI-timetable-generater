// Dashboard JavaScript functionality

// Global variables
let currentUser = {
    name: 'Admin',
    role: 'Administrator',
    avatar: 'https://via.placeholder.com/40'
};

let dashboardData = {
    stats: {
        totalClasses: 24,
        totalSubjects: 12,
        totalTeachers: 18,
        totalRooms: 15
    },
    recentTimetables: [
        {
            id: 'cs-fall-2024',
            name: 'Computer Science - Fall 2024',
            department: 'Computer Science',
            created: '2024-09-15',
            status: 'completed'
        },
        {
            id: 'math-fall-2024',
            name: 'Mathematics - Fall 2024',
            department: 'Mathematics',
            created: '2024-09-12',
            status: 'in-progress'
        },
        {
            id: 'physics-fall-2024',
            name: 'Physics - Fall 2024',
            department: 'Physics',
            created: '2024-09-10',
            status: 'pending'
        }
    ],
    weekSchedule: [
        { day: 'Monday', date: 16, events: ['CS101 - 9:00', 'MATH201 - 11:00'] },
        { day: 'Tuesday', date: 17, events: ['PHY101 - 10:00', 'CS201 - 14:00'] },
        { day: 'Wednesday', date: 18, events: ['MATH101 - 9:00', 'CS301 - 15:00'] },
        { day: 'Thursday', date: 19, events: ['PHY201 - 11:00', 'MATH301 - 13:00'] },
        { day: 'Friday', date: 20, events: ['CS401 - 9:00', 'LAB - 14:00'] }
    ]
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    updateDateTime();
    
    // Update date/time every minute
    setInterval(updateDateTime, 60000);

    // Initialize FullCalendar
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [
            {
                title: 'CS Lecture: Algorithms',
                start: '2024-09-23T10:00:00',
                end: '2024-09-23T11:30:00',
                department: 'computer-science',
                color: '#667eea'
            },
            {
                title: 'Math Tutorial: Calculus',
                start: '2024-09-24T14:00:00',
                end: '2024-09-24T15:30:00',
                department: 'mathematics',
                color: '#764ba2'
            },
            {
                title: 'Physics Lab',
                start: '2024-09-25T09:00:00',
                end: '2024-09-25T11:00:00',
                department: 'physics',
                color: '#38a169'
            },
            {
                title: 'CS Practical: Programming',
                start: '2024-09-26T13:00:00',
                end: '2024-09-26T15:00:00',
                department: 'computer-science',
                color: '#667eea'
            }
        ],
        eventClick: function(info) {
            alert('Event: ' + info.event.title + '\nDepartment: ' + info.event.extendedProps.department + '\nTime: ' + info.event.start.toLocaleString());
        },
        eventContent: function(arg) {
            return { html: '<div class="fc-event-title">' + arg.event.title + '</div>' };
        },
        height: 'auto',
        contentHeight: 500,
        aspectRatio: 1.35,
        views: {
            timeGridWeek: { slotDuration: '00:30:00' },
            timeGridDay: { slotDuration: '00:30:00' }
        }
    });
    calendar.render();

    // Dropdown functionality for Import Data
    function toggleImportDropdown() {
        const dropdown = document.getElementById('importDropdown');
        dropdown.classList.toggle('show');
    }

    // Close dropdown when clicking outside
    window.addEventListener('click', function(event) {
        const dropdown = document.getElementById('importDropdown');
        const importBtn = document.getElementById('importBtn');
        
        if (!importBtn.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });

    // Import functions
    function importTeachers() {
        document.getElementById('importDropdown').classList.remove('show');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx,.xls';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                console.log('Importing teachers from:', file.name);
                alert('Importing teachers from: ' + file.name);
            }
        };
        input.click();
    }

    function importClasses() {
        document.getElementById('importDropdown').classList.remove('show');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx,.xls';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                console.log('Importing classes from:', file.name);
                alert('Importing classes from: ' + file.name);
            }
        };
        input.click();
    }

    function importCourses() {
        document.getElementById('importDropdown').classList.remove('show');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx,.xls';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                console.log('Importing courses from:', file.name);
                alert('Importing courses from: ' + file.name);
            }
        };
        input.click();
    }

    // Expose import functions to global scope
    window.toggleImportDropdown = toggleImportDropdown;
    window.importTeachers = importTeachers;
    window.importClasses = importClasses;
    window.importCourses = importCourses;
});

// Initialize dashboard functionality
function initializeDashboard() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });

    animateElements();
}

// Update current date and time
function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const dateTimeElement = document.getElementById('currentDateTime');
    if (dateTimeElement) {
        dateTimeElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

// Quick action functions
function generateTimetable() {
    openModal('generateModal');
}

function exportTimetable() {
    showNotification('Preparing timetable export...', 'info');
    setTimeout(() => {
        const link = document.createElement('a');
        link.href = 'data:text/plain;charset=utf-8,Timetable Export Data';
        link.download = 'timetable-export.csv';
        link.click();
        showNotification('Timetable exported successfully!', 'success');
    }, 1500);
}

function openSettings() {
    showNotification('Settings panel would open here', 'info');
}

// Timetable management functions
function viewTimetable(timetableId) {
    showNotification(`Viewing timetable: ${timetableId}`, 'info');
}

function editTimetable(timetableId) {
    showNotification(`Editing timetable: ${timetableId}`, 'info');
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
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Form submission functions
function submitGenerate() {
    const form = document.getElementById('generateForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    const data = {
        semester: formData.get('semester'),
        department: formData.get('department'),
        timeSlots: formData.get('timeSlots')
    };

    showNotification('Generating timetable...', 'info');
    setTimeout(() => {
        showNotification('Timetable generated successfully!', 'success');
        closeModal('generateModal');
        const newTimetable = {
            id: `${data.department}-${data.semester}`,
            name: `${data.department} - ${data.semester}`,
            department: data.department,
            created: new Date().toISOString().split('T')[0],
            status: 'completed'
        };
        
        dashboardData.recentTimetables.unshift(newTimetable);
        updateRecentTimetables();
        updateStats();
    }, 3000);
}

// Update dashboard statistics
function updateStats() {
    dashboardData.stats.totalClasses += Math.floor(Math.random() * 3);
    dashboardData.stats.totalSubjects += Math.floor(Math.random() * 2);
    
    document.getElementById('totalClasses').textContent = dashboardData.stats.totalClasses;
    document.getElementById('totalSubjects').textContent = dashboardData.stats.totalSubjects;
    document.getElementById('totalTeachers').textContent = dashboardData.stats.totalTeachers;
    document.getElementById('totalRooms').textContent = dashboardData.stats.totalRooms;
}

// Update recent timetables list
function updateRecentTimetables() {
    const timetableList = document.querySelector('.timetable-list');
    if (!timetableList) return;

    timetableList.innerHTML = '';

    dashboardData.recentTimetables.slice(0, 3).forEach(timetable => {
        const item = document.createElement('div');
        item.className = 'timetable-item';
        
        item.innerHTML = `
            <div class="timetable-info">
                <h4>${timetable.name}</h4>
                <p>Created on ${new Date(timetable.created).toLocaleDateString()}</p>
            </div>
            <div class="timetable-status ${timetable.status}">
                <span>${timetable.status.charAt(0).toUpperCase() + timetable.status.slice(1)}</span>
            </div>
            <div class="timetable-actions">
                <button class="btn-small" onclick="viewTimetable('${timetable.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-small" onclick="editTimetable('${timetable.id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
        
        timetableList.appendChild(item);
    });
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

// Animation functions
function animateElements() {
    const elements = document.querySelectorAll('.stat-card, .action-btn, .timetable-item, .activity-item');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(time) {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Export functions for external use
window.dashboardAPI = {
    generateTimetable,
    exportTimetable,
    viewTimetable,
    editTimetable,
    showNotification,
    updateStats
};

// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('active');
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        generateTimetable();
    }
    
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal(activeModal.id);
        }
    }
});

console.log('Timetable Generator Dashboard loaded successfully!');