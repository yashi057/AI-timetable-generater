// ====================================================================
// FACULTY DASHBOARD - PRODUCTION VERSION
// ====================================================================

// Configuration
const API_BASE_URL = 'http://127.0.0.1:8000';
let authToken = null;

// State
let currentView = 'day';
let currentDate = new Date();
const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Data
let facultyData = {
    id: null,
    username: null,
    email: null,
    role: null,
    full_name: null,
    department: null,
    position: null,
    availability_status: 'available',
    status_note: '',
    subjects: []
};

let timetableHistory = [];
let timetableData = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
};

// ====================================================================
// INITIALIZATION
// ====================================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== Faculty Dashboard Starting ===');

    authToken = localStorage.getItem('token');

    if (!authToken) {
        console.error('No authentication token');
        showNotification('Please log in to continue', 'error');
        setTimeout(() => {
            window.location.href = '/faculty_login.html';
        }, 2000);
        return;
    }

    console.log('✓ Token found');

    initializeDashboardUI();
    await initializeDashboard();
});

function initializeDashboardUI() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }

    // Modal close on outside click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

async function initializeDashboard() {
    console.log('Fetching faculty data...');

    try {
        // Fetch faculty profile
        const userResponse = await fetch(`${API_BASE_URL}/faculty/me`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!userResponse.ok) throw new Error('Failed to fetch profile');

        const userData = await userResponse.json();
        Object.assign(facultyData, userData);
        console.log('✓ Profile loaded:', facultyData);

        // Fetch subjects
        const subjectsResponse = await fetch(`${API_BASE_URL}/faculty/subjects`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!subjectsResponse.ok) throw new Error('Failed to fetch subjects');

        facultyData.subjects = await subjectsResponse.json();
        console.log('✓ Subjects loaded:', facultyData.subjects.length);

        // Fetch timetable
        const timetableResponse = await fetch(`${API_BASE_URL}/faculty/timetable_history`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!timetableResponse.ok) throw new Error('Failed to fetch timetable');

        timetableHistory = await timetableResponse.json();
        console.log('✓ Timetable loaded:', timetableHistory.length);

        organizeTimetableData();

        // Update UI
        loadFacultyInfo();
        loadSubjects();
        loadUpcomingClasses();
        updateQuickStats();
        updateDateDisplay();
        updateCalendar();

        showNotification(`Welcome, ${facultyData.full_name || facultyData.username}!`, 'success');

    } catch (error) {
        console.error('Dashboard error:', error);
        showNotification('Error: ' + error.message, 'error');
    }
}

function organizeTimetableData() {
    timetableData = {
        monday: [], tuesday: [], wednesday: [], thursday: [],
        friday: [], saturday: [], sunday: []
    };

    timetableHistory.forEach(entry => {
        const day = entry.day.toLowerCase();
        if (timetableData[day]) {
            timetableData[day].push({
                id: entry.id,
                time: entry.time,
                subject: entry.subject,
                room: entry.room,
                instructor: entry.instructor,
                type: entry.type
            });
        }
    });

    Object.keys(timetableData).forEach(day => {
        timetableData[day].sort((a, b) => a.time.localeCompare(b.time));
    });
}

// ====================================================================
// UI UPDATE FUNCTIONS
// ====================================================================

function loadFacultyInfo() {
    const facultyName = document.getElementById('facultyName');
    const facultyID = document.getElementById('facultyID');
    const facultyDepartment = document.getElementById('facultyDepartment');
    const facultyPosition = document.getElementById('facultyPosition');

    if (facultyName) facultyName.textContent = facultyData.full_name || facultyData.username;
    if (facultyID) facultyID.textContent = facultyData.id || facultyData.username;
    if (facultyDepartment) facultyDepartment.textContent = facultyData.department || 'N/A';
    if (facultyPosition) facultyPosition.textContent = facultyData.position || 'Faculty';

    updateAvailabilityDisplay(facultyData.availability_status);
}

function loadSubjects() {
    const subjectsList = document.getElementById('subjectsList');
    if (!subjectsList) return;

    subjectsList.innerHTML = '';

    if (facultyData.subjects && facultyData.subjects.length > 0) {
        facultyData.subjects.forEach(subject => {
            const subjectEl = document.createElement('div');
            subjectEl.className = `subject-item ${subject.color || 'subject-computer'}`;
            subjectEl.innerHTML = `
                <div>
                    <div class="subject-code">${subject.code}</div>
                    <div class="subject-name">${subject.name}</div>
                </div>
                <div class="subject-credits">${subject.credits} CR</div>
            `;
            subjectsList.appendChild(subjectEl);
        });
    } else {
        subjectsList.innerHTML = '<p style="color: #718096; text-align: center; padding: 1rem;">No subjects assigned</p>';
    }
}

function loadUpcomingClasses() {
    const classesList = document.getElementById('classesList');
    if (!classesList) return;

    classesList.innerHTML = '';

    const upcoming = getUpcomingClasses(5);

    if (upcoming.length > 0) {
        upcoming.forEach(cls => {
            const classEl = document.createElement('div');
            classEl.className = 'class-item';
            classEl.innerHTML = `
                <div class="class-time">${cls.time}</div>
                <div class="class-details">
                    <div class="class-subject">${cls.subject}</div>
                    <div class="class-room">${cls.room} - ${cls.type}</div>
                </div>
            `;
            classesList.appendChild(classEl);
        });
    } else {
        classesList.innerHTML = '<p style="color: #718096; text-align: center; padding: 1rem;">No upcoming classes</p>';
    }
}

function getUpcomingClasses(count = 5) {
    const upcoming = [];
    const today = new Date();
    const currentDayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = today.toTimeString().substring(0, 5);

    const todayClasses = timetableData[currentDayName] || [];
    todayClasses.forEach(cls => {
        if (cls.time >= currentTime) {
            upcoming.push(cls);
        }
    });

    return upcoming.slice(0, count);
}

function updateQuickStats() {
    const today = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayClasses = timetableData[today] || [];
    const weekClasses = Object.values(timetableData).flat().length;
    const totalSubjects = facultyData.subjects ? facultyData.subjects.length : 0;

    // Calculate total students (you'd need this from backend)
    const totalStudents = 125; // Placeholder

    const todayClassesEl = document.getElementById('todayClasses');
    const weekClassesEl = document.getElementById('weekClasses');
    const totalSubjectsEl = document.getElementById('totalSubjects');
    const totalStudentsEl = document.getElementById('totalStudents');

    if (todayClassesEl) todayClassesEl.textContent = todayClasses.length;
    if (weekClassesEl) weekClassesEl.textContent = weekClasses;
    if (totalSubjectsEl) totalSubjectsEl.textContent = totalSubjects;
    if (totalStudentsEl) totalStudentsEl.textContent = totalStudents;
}

// ====================================================================
// AVAILABILITY MANAGEMENT
// ====================================================================

window.toggleAvailability = function() {
    const currentStatus = facultyData.availability_status;
    const newStatus = currentStatus === 'available' ? 'busy' : 'available';
    setStatus(newStatus);
};

window.setStatus = async function(status) {
    try {
        const response = await fetch(`${API_BASE_URL}/faculty/update_availability`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: status,
                note: facultyData.status_note
            })
        });

        if (!response.ok) throw new Error('Failed to update status');

        facultyData.availability_status = status;
        updateAvailabilityDisplay(status);
        showNotification('Status updated to ' + status, 'success');

        // Update button states
        document.querySelectorAll('.status-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.status-btn.${status}`).classList.add('active');

    } catch (error) {
        showNotification('Error updating status: ' + error.message, 'error');
    }
};

window.updateStatusNote = async function() {
    const note = document.getElementById('statusNote').value;

    try {
        const response = await fetch(`${API_BASE_URL}/faculty/update_availability`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: facultyData.availability_status,
                note: note
            })
        });

        if (!response.ok) throw new Error('Failed to update note');

        facultyData.status_note = note;
        showNotification('Status note updated', 'success');

    } catch (error) {
        showNotification('Error updating note: ' + error.message, 'error');
    }
};

function updateAvailabilityDisplay(status) {
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');
    const sidebarStatusIcon = document.getElementById('sidebarStatusIcon');
    const sidebarStatusText = document.getElementById('sidebarStatusText');
    const availabilityBtn = document.getElementById('availabilityBtn');

    const statusConfig = {
        'available': { text: 'Available', class: 'status-available' },
        'busy': { text: 'Busy', class: 'status-busy' },
        'unavailable': { text: 'Unavailable', class: 'status-unavailable' },
        'on-leave': { text: 'On Leave', class: 'status-on-leave' }
    };

    const config = statusConfig[status] || statusConfig['available'];

    if (statusText) statusText.textContent = config.text;
    if (sidebarStatusText) sidebarStatusText.textContent = config.text;

    if (availabilityBtn) {
        availabilityBtn.className = `availability-btn ${config.class}`;
    }

    if (statusIcon) {
        statusIcon.className = `fas fa-circle ${config.class}`;
    }

    if (sidebarStatusIcon) {
        sidebarStatusIcon.className = `fas fa-circle status-indicator ${config.class}`;
    }
}

// ====================================================================
// CALENDAR VIEWS (Same as student dashboard)
// ====================================================================

window.switchView = function(view) {
    currentView = view;

    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-view="${view}"]`).classList.add('active');

    document.querySelectorAll('.view-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${view}View`).classList.add('active');

    updateCalendar();
};

function updateCalendar() {
    switch (currentView) {
        case 'day': updateDayView(); break;
        case 'week': updateWeekView(); break;
        case 'month': updateMonthView(); break;
    }
}

function updateDayView() {
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayClasses = timetableData[dayName] || [];

    const dayViewDate = document.getElementById('dayViewDate');
    if (dayViewDate) {
        dayViewDate.textContent = currentDate.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    const slotsContainer = document.getElementById('daySlots');
    if (!slotsContainer) return;

    slotsContainer.innerHTML = '';

    timeSlots.forEach(time => {
        const classForTime = dayClasses.find(cls => cls.time === time);

        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';

        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-label';
        timeLabel.textContent = time;

        const slotContent = document.createElement('div');
        slotContent.className = 'slot-content';

        if (classForTime) {
            slotContent.classList.add('has-class');

            const subject = facultyData.subjects ?
                facultyData.subjects.find(s => s.code === classForTime.subject) : null;

            slotContent.innerHTML = `
                <div class="class-info">
                    <div class="class-subject">${classForTime.subject}${subject ? ' - ' + subject.name : ''}</div>
                    <div class="class-details">
                        <span class="class-room">${classForTime.room}</span>
                        <span>${classForTime.type}</span>
                    </div>
                </div>
            `;
            slotContent.addEventListener('click', () => showClassDetails(classForTime));
        }

        timeSlot.appendChild(timeLabel);
        timeSlot.appendChild(slotContent);
        slotsContainer.appendChild(timeSlot);
    });
}

function updateWeekView() {
    const weekTimetable = document.getElementById('weekTimetable');
    if (!weekTimetable) return;

    weekTimetable.innerHTML = '';

    const corner = document.createElement('div');
    corner.className = 'week-corner';
    corner.textContent = 'Time';
    weekTimetable.appendChild(corner);

    weekDays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'week-day-header';
        dayHeader.textContent = day.substring(0, 3);
        weekTimetable.appendChild(dayHeader);
    });

    timeSlots.forEach(time => {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'week-time-slot';
        timeSlot.textContent = time;
        weekTimetable.appendChild(timeSlot);

        weekDays.forEach(day => {
            const dayName = day.toLowerCase();
            const dayClasses = timetableData[dayName] || [];
            const classForTime = dayClasses.find(cls => cls.time === time);

            const daySlot = document.createElement('div');
            daySlot.className = 'week-day-slot';

            if (classForTime) {
                daySlot.classList.add('has-class');
                daySlot.innerHTML = `
                    <div class="week-class-subject">${classForTime.subject}</div>
                    <div class="week-class-room">${classForTime.room}</div>
                `;
                daySlot.addEventListener('click', () => showClassDetails(classForTime));
            }

            weekTimetable.appendChild(daySlot);
        });
    });
}

function updateMonthView() {
    const monthDaysHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthHeader = document.getElementById('monthHeader');
    const monthGrid = document.getElementById('monthGrid');

    if (!monthHeader || !monthGrid) return;

    monthHeader.innerHTML = '';
    monthGrid.innerHTML = '';

    monthDaysHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'month-day-header';
        dayHeader.textContent = day;
        monthHeader.appendChild(dayHeader);
    });

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    for (let i = 0; i < 42; i++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + i);

        const dayCell = document.createElement('div');
        dayCell.className = 'month-day';

        if (cellDate.getMonth() !== currentDate.getMonth()) {
            dayCell.classList.add('other-month');
        }

        if (cellDate.toDateString() === new Date().toDateString()) {
            dayCell.classList.add('today');
        }

        dayCell.innerHTML = `
            <div class="month-day-number">${cellDate.getDate()}</div>
            <div class="month-classes"></div>
        `;

        const dayName = cellDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const dayClasses = timetableData[dayName] || [];
        const classesContainer = dayCell.querySelector('.month-classes');

        dayClasses.slice(0, 3).forEach(() => {
            const indicator = document.createElement('div');
            indicator.className = 'month-class-indicator';
            classesContainer.appendChild(indicator);
        });

        monthGrid.appendChild(dayCell);
    }
}

// ====================================================================
// NAVIGATION
// ====================================================================

function updateDateDisplay() {
    const dateString = currentDate.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const currentDateEl = document.getElementById('currentDate');
    if (currentDateEl) currentDateEl.textContent = dateString;
}

window.navigateDate = function(direction) {
    switch (currentView) {
        case 'day':
            currentDate.setDate(currentDate.getDate() + direction);
            break;
        case 'week':
            currentDate.setDate(currentDate.getDate() + (direction * 7));
            break;
        case 'month':
            currentDate.setMonth(currentDate.getMonth() + direction);
            break;
    }

    updateDateDisplay();
    updateCalendar();
    updateQuickStats();
};

window.goToToday = function() {
    currentDate = new Date();
    updateDateDisplay();
    updateCalendar();
    updateQuickStats();
};

// ====================================================================
// MODAL & ACTIONS
// ====================================================================

function showClassDetails(classInfo) {
    const subject = facultyData.subjects ?
        facultyData.subjects.find(s => s.code === classInfo.subject) : null;

    const modal = document.getElementById('classModal');
    if (!modal) return;

    document.getElementById('modalTitle').textContent = `${classInfo.subject} - ${classInfo.type}`;
    document.getElementById('modalBody').innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Subject:</span>
            <span class="detail-value">${subject ? subject.name : classInfo.subject}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Time:</span>
            <span class="detail-value">${classInfo.time}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Room:</span>
            <span class="detail-value">${classInfo.room}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Type:</span>
            <span class="detail-value">${classInfo.type}</span>
        </div>
    `;

    modal.style.display = 'block';
}

window.closeModal = function() {
    const modal = document.getElementById('classModal');
    if (modal) modal.style.display = 'none';
};

window.cancelClass = function() {
    showNotification('Cancel class functionality not yet implemented', 'info');
};

window.rescheduleClass = function() {
    showNotification('Reschedule functionality not yet implemented', 'info');
};

window.exportSchedule = function() {
    showNotification('Exporting schedule...', 'info');
    // Same export logic as student dashboard
};

window.syncTimetable = function() {
    showNotification('Syncing timetable...', 'info');
};

// ====================================================================
// NOTIFICATIONS
// ====================================================================

function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());

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

console.log('✓ Faculty Dashboard JavaScript loaded');