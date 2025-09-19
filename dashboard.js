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
    generateCalendar();
    
    // Update date/time every minute
    setInterval(updateDateTime, 60000);
});

// Initialize dashboard functionality
// Replace the problematic navigation code with this:
function initializeDashboard() {
    // Add sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    // FIXED navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');
    /*  navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only prevent default for # links (like #settings)
            if (href.startsWith('#')) {
                e.preventDefault();
                
                // Remove active class from all nav items
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Add active class to clicked item
                this.parentElement.classList.add('active');
                
                // Handle navigation for # links only
                handleNavigation(href);
            }
            // For .html links, let the browser navigate normally (don't prevent default)
        });
    });*/

    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });

    // Add animations to dashboard elements
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

// Generate calendar for the week
function generateCalendar() {
    const calendarBody = document.getElementById('calendarBody');
    if (!calendarBody) return;

    calendarBody.innerHTML = '';

    dashboardData.weekSchedule.forEach(dayData => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = dayData.date;
        dayElement.appendChild(dayNumber);

        dayData.events.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'calendar-event';
            eventElement.textContent = event;
            eventElement.title = event;
            dayElement.appendChild(eventElement);
        });

        calendarBody.appendChild(dayElement);
    });
}

// Handle navigation between sections
// Handle navigation between sections (only for # links)
function handleNavigation(section) {
    console.log('Navigating to:', section);
    
    switch(section) {
        case '#dashboard':
            // Already on dashboard
            break;
        case '#settings':
            loadSettingsSection();
            break;
        default:
            console.log('Unknown section:', section);
    }
}

// Update loadSettingsSection to show something useful
function loadSettingsSection() {
    showNotification('Settings panel would open here', 'info');
    // You could open a settings modal here instead
}

// Section loading functions (placeholders)
function loadTimetablesSection() {
    showNotification('Timetables section would load here', 'info');
}

function loadSubjectsSection() {
    showNotification('Subjects section would load here', 'info');
}

function loadTeachersSection() {
    showNotification('Teachers section would load here', 'info');
}

function loadRoomsSection() {
    showNotification('Rooms section would load here', 'info');
}

function loadSettingsSection() {
    showNotification('Settings section would load here', 'info');
}

// Quick action functions
function generateTimetable() {
    openModal('generateModal');
}

function importData() {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv,.xlsx,.json';
    
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            showNotification(`Importing data from ${file.name}...`, 'info');
            // Simulate import process
            setTimeout(() => {
                showNotification('Data imported successfully!', 'success');
                updateStats();
            }, 2000);
        }
    };
    
    fileInput.click();
}

function exportTimetable() {
    showNotification('Preparing timetable export...', 'info');
    
    // Simulate export process
    setTimeout(() => {
        // Create a download link
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
        
        // Reset form if it exists
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
    
    // Simulate timetable generation
    setTimeout(() => {
        showNotification('Timetable generated successfully!', 'success');
        closeModal('generateModal');
        
        // Add new timetable to recent list
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
    // Simulate data update
    dashboardData.stats.totalClasses += Math.floor(Math.random() * 3);
    dashboardData.stats.totalSubjects += Math.floor(Math.random() * 2);
    
    // Update DOM
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

// Animation functions
function animateElements() {
    // Add fade-in animation to dashboard elements
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

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
    }
    
    .notification-content i {
        font-size: 1.2rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 1rem;
        color: #718096;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        transition: background-color 0.2s ease;
    }
    
    .notification-close:hover {
        background: #f7fafc;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

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
    importData,
    exportTimetable,
    viewTimetable,
    editTimetable,
    showNotification,
    updateStats
};

// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
    // Close sidebar on mobile when window is resized
    if (window.innerWidth > 768) {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('active');
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + N: Generate new timetable
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        generateTimetable();
    }
    
    // Escape: Close modals
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal(activeModal.id);
        }
    }
});

console.log('Timetable Generator Dashboard loaded successfully!');