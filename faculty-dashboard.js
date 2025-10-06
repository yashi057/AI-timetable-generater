// Sample faculty data
const facultyData = {
    name: "Ravi",
    id: "FAC001",
    department: "Computer Science",
    position: "Associate Professor",
    currentStatus: "available",
    statusNote: ""
};

// Sample teaching schedule
const teachingSchedule = {
    monday: [
        { time: "09:00", subject: "CS301", room: "Lab-A", students: 45, type: "Lecture", class: "CS-3A" },
        { time: "11:00", subject: "CS401", room: "Room-102", students: 38, type: "Lecture", class: "CS-4A" },
        { time: "14:00", subject: "CS302", room: "Lab-B", students: 42, type: "Lab", class: "CS-3B" }
    ],
    tuesday: [
        { time: "10:00", subject: "CS401", room: "Room-201", students: 38, type: "Tutorial", class: "CS-4A" },
        { time: "13:00", subject: "CS301", room: "Room-105", students: 45, type: "Lecture", class: "CS-3A" },
        { time: "15:00", subject: "CS302", room: "Lab-A", students: 42, type: "Lab", class: "CS-3B" }
    ],
    wednesday: [
        { time: "09:00", subject: "CS401", room: "Room-301", students: 38, type: "Lecture", class: "CS-4A" },
        { time: "11:00", subject: "CS302", room: "Room-202", students: 42, type: "Lecture", class: "CS-3B" },
        { time: "14:00", subject: "CS301", room: "Room-102", students: 45, type: "Tutorial", class: "CS-3A" }
    ],
    thursday: [
        { time: "08:00", subject: "CS401", room: "Lab-C", students: 38, type: "Lab", class: "CS-4A" },
        { time: "10:00", subject: "CS302", room: "Lab-D", students: 42, type: "Lab", class: "CS-3B" },
        { time: "13:00", subject: "CS301", room: "Room-202", students: 45, type: "Lecture", class: "CS-3A" }
    ],
    friday: [
        { time: "09:00", subject: "CS302", room: "Room-105", students: 42, type: "Lecture", class: "CS-3B" },
        { time: "11:00", subject: "CS401", room: "Room-201", students: 38, type: "Lecture", class: "CS-4A" },
        { time: "14:00", subject: "CS301", room: "Room-102", students: 45, type: "Lecture", class: "CS-3A" }
    ]
};

// Sample subjects data
const subjectsData = [
    { code: "CS301", name: "Data Structures & Algorithms", students: 45, color: "subject-cs" },
    { code: "CS302", name: "Database Management Systems", students: 42, color: "subject-cs" },
    { code: "CS401", name: "Software Engineering", students: 38, color: "subject-cs" }
];

// Current view and date
let currentView = 'day';
let currentDate = new Date();

// Time slots
const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Status mappings
const statusConfig = {
    available: { icon: 'fas fa-circle', color: '#22c55e', text: 'Available' },
    busy: { icon: 'fas fa-circle', color: '#f59e0b', text: 'Busy' },
    unavailable: { icon: 'fas fa-circle', color: '#ef4444', text: 'Unavailable' },
    'on-leave': { icon: 'fas fa-circle', color: '#8b5cf6', text: 'On Leave' }
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadFacultyInfo();
    loadSubjects();
    loadUpcomingClasses();
    updateSchedule();
    setCurrentStatus(facultyData.currentStatus);
});

function initializeDashboard() {
    updateDateDisplay();
    updateQuickStats();
}

function loadFacultyInfo() {
    document.getElementById('facultyName').textContent = facultyData.name;
    document.getElementById('facultyID').textContent = facultyData.id;
    document.getElementById('facultyDepartment').textContent = facultyData.department;
    document.getElementById('facultyPosition').textContent = facultyData.position;
}

function loadSubjects() {
    const subjectsList = document.getElementById('subjectsList');
    subjectsList.innerHTML = '';
    
    subjectsData.forEach(subject => {
        const subjectElement = document.createElement('div');
        subjectElement.className = `subject-item ${subject.color}`;
        subjectElement.innerHTML = `
            <div>
                <div class="subject-code">${subject.code}</div>
                <div class="subject-name">${subject.name}</div>
            </div>
            <div class="subject-students">${subject.students} STU</div>
        `;
        subjectElement.addEventListener('click', () => showSubjectDetails(subject));
        subjectsList.appendChild(subjectElement);
    });
}

function loadUpcomingClasses() {
    const classesList = document.getElementById('classesList');
    classesList.innerHTML = '';
    
    const today = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayClasses = getTodayClasses(today);
    const currentTime = new Date().getHours() * 100 + new Date().getMinutes();
    
    // Get upcoming classes for today
    const upcomingClasses = todayClasses.filter(cls => {
        const classTime = parseInt(cls.time.replace(':', ''));
        return classTime > currentTime;
    }).slice(0, 3);
    
    if (upcomingClasses.length === 0) {
        classesList.innerHTML = '<p style="color: #718096; text-align: center; padding: 1rem;">No more classes today</p>';
        return;
    }
    
    upcomingClasses.forEach(cls => {
        const classElement = document.createElement('div');
        classElement.className = 'class-item';
        classElement.innerHTML = `
            <div class="class-time">${cls.time}</div>
            <div class="class-details">
                <div class="class-subject">${cls.subject} - ${cls.class}</div>
                <div class="class-room">${cls.room} • ${cls.students} students</div>
            </div>
        `;
        classElement.addEventListener('click', () => showClassDetails(cls));
        classesList.appendChild(classElement);
    });
}

function updateQuickStats() {
    const today = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayClasses = getTodayClasses(today);
    const weekClasses = getTotalWeekClasses();
    const totalStudents = subjectsData.reduce((sum, subject) => sum + subject.students, 0);
    
    document.getElementById('todayClasses').textContent = todayClasses.length;
    document.getElementById('weekClasses').textContent = weekClasses;
    document.getElementById('totalSubjects').textContent = subjectsData.length;
    document.getElementById('totalStudents').textContent = totalStudents;
}

function getTodayClasses(day) {
    return teachingSchedule[day] || [];
}

function getTotalWeekClasses() {
    return Object.values(teachingSchedule).reduce((total, day) => total + day.length, 0);
}

// Availability Management Functions
function toggleAvailability() {
    const currentStatus = facultyData.currentStatus;
    let newStatus;
    
    switch(currentStatus) {
        case 'available':
            newStatus = 'busy';
            break;
        case 'busy':
            newStatus = 'unavailable';
            break;
        case 'unavailable':
            newStatus = 'on-leave';
            break;
        case 'on-leave':
            newStatus = 'available';
            break;
        default:
            newStatus = 'available';
    }
    
    setStatus(newStatus);
}

function setStatus(status) {
    facultyData.currentStatus = status;
    setCurrentStatus(status);
    updateTimetableGenerator(status);
    showStatusNotification(`Status updated to ${statusConfig[status].text}`);
}

function setCurrentStatus(status) {
    const config = statusConfig[status];
    
    // Update header button
    const availabilityBtn = document.getElementById('availabilityBtn');
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');
    
    availabilityBtn.className = `availability-btn ${status}`;
    statusIcon.className = config.icon;
    statusIcon.style.color = config.color;
    statusText.textContent = config.text;
    
    // Update sidebar status
    const sidebarStatusIcon = document.getElementById('sidebarStatusIcon');
    const sidebarStatusText = document.getElementById('sidebarStatusText');
    
    sidebarStatusIcon.className = `fas fa-circle status-indicator ${status}`;
    sidebarStatusText.textContent = `${config.text} Today`;
    
    // Update status buttons
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.status-btn.${status}`).classList.add('active');
}

function updateStatusNote() {
    const note = document.getElementById('statusNote').value;
    facultyData.statusNote = note;
    showStatusNotification('Status note updated successfully!');
    
    // Update timetable generator with note
    updateTimetableGenerator(facultyData.currentStatus);
}

function updateTimetableGenerator(status) {
    // This function integrates with your timetable generator
    // Send status update to your backend/timetable system
    console.log(`Updating timetable generator with faculty status: ${status}`);
    console.log(`Faculty ID: ${facultyData.id}`);
    console.log(`Status Note: ${facultyData.statusNote}`);
    
    // Example integration payload for your timetable generator
    const statusUpdate = {
        facultyId: facultyData.id,
        facultyName: facultyData.name,
        department: facultyData.department,
        status: status,
        statusNote: facultyData.statusNote,
        timestamp: new Date().toISOString(),
        affectedClasses: getAffectedClasses(),
        availableForRescheduling: status === 'available'
    };
    
    console.log('Status update payload:', statusUpdate);
    
    // This would integrate with your MCQ Quiz generator timetable system
    // Replace with your actual API endpoint
    /*
    fetch('/api/faculty/update-status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getAuthToken()
        },
        body: JSON.stringify(statusUpdate)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Status updated in timetable generator:', data);
        if (data.rescheduledClasses) {
            showReschedulingNotification(data.rescheduledClasses);
        }
    })
    .catch(error => {
        console.error('Error updating status:', error);
        showErrorNotification('Failed to update status in timetable generator');
    });
    */
}

function getAffectedClasses() {
    // Get today's remaining classes that might be affected
    const today = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayClasses = getTodayClasses(today);
    const currentTime = new Date().getHours() * 100 + new Date().getMinutes();
    
    return todayClasses.filter(cls => {
        const classTime = parseInt(cls.time.replace(':', ''));
        return classTime > currentTime;
    });
}

function showStatusNotification(message) {
    const notification = document.getElementById('statusNotification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function showReschedulingNotification(rescheduledClasses) {
    const message = `${rescheduledClasses.length} classes have been automatically rescheduled`;
    showStatusNotification(message);
}

function showErrorNotification(message) {
    const notification = document.getElementById('statusNotification');
    const notificationText = document.getElementById('notificationText');
    
    notification.style.background = '#ef4444';
    notificationText.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
        notification.style.background = '#22c55e'; // Reset to success color
    }, 4000);
}

// Schedule Management Functions
function switchView(view) {
    currentView = view;
    
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    document.querySelectorAll('.view-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${view}View`).classList.add('active');
    
    updateSchedule();
}

function updateSchedule() {
    switch(currentView) {
        case 'day':
            updateDayView();
            break;
        case 'week':
            updateWeekView();
            break;
        case 'month':
            updateMonthView();
            break;
    }
}

function updateDayView() {
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayClasses = getTodayClasses(dayName);
    
    document.getElementById('dayViewDate').textContent = 
        currentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    
    const slotsContainer = document.getElementById('daySlots');
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
            
            // Add status indicator if faculty is not available
            const statusIndicator = facultyData.currentStatus !== 'available' ? 
                `<span class="status-indicator-small ${facultyData.currentStatus}">●</span>` : '';
            
            slotContent.innerHTML = `
                <div class="class-info">
                    <div class="class-subject">${classForTime.subject} - ${classForTime.class} ${statusIndicator}</div>
                    <div class="class-details">
                        <span class="class-room">${classForTime.room}</span>
                        <span>${classForTime.students} students</span>
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
    weekTimetable.innerHTML = '';
    
    // Add corner cell
    const corner = document.createElement('div');
    corner.className = 'week-corner';
    corner.textContent = 'Time';
    weekTimetable.appendChild(corner);
    
    // Add day headers
    weekDays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'week-day-header';
        dayHeader.textContent = day.substring(0, 3);
        weekTimetable.appendChild(dayHeader);
    });
    
    // Add time slots and day slots
    timeSlots.forEach(time => {
        // Time label
        const timeSlot = document.createElement('div');
        timeSlot.className = 'week-time-slot';
        timeSlot.textContent = time;
        weekTimetable.appendChild(timeSlot);
        
        // Day slots
        weekDays.forEach(day => {
            const dayName = day.toLowerCase();
            const dayClasses = teachingSchedule[dayName] || [];
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
        
        // Add class indicators
        const dayName = cellDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const dayClasses = teachingSchedule[dayName] || [];
        const classesContainer = dayCell.querySelector('.month-classes');
        
        dayClasses.slice(0, 3).forEach(() => {
            const indicator = document.createElement('div');
            indicator.className = 'month-class-indicator';
            classesContainer.appendChild(indicator);
        });
        
        monthGrid.appendChild(dayCell);
    }
}

function updateDateDisplay() {
    const dateString = currentDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('currentDate').textContent = dateString;
}

function navigateDate(direction) {
    switch(currentView) {
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
    updateSchedule();
    updateQuickStats();
    loadUpcomingClasses();
}

function goToToday() {
    currentDate = new Date();
    updateDateDisplay();
    updateSchedule();
    updateQuickStats();
    loadUpcomingClasses();
}

// Modal Functions
function showClassDetails(classInfo) {
    const subject = subjectsData.find(s => s.code === classInfo.subject);
    
    document.getElementById('modalTitle').textContent = `${classInfo.subject} - ${classInfo.type}`;
    document.getElementById('modalBody').innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Subject:</span>
            <span class="detail-value">${subject ? subject.name : classInfo.subject}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Class:</span>
            <span class="detail-value">${classInfo.class}</span>
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
            <span class="detail-label">Students:</span>
            <span class="detail-value">${classInfo.students}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Type:</span>
            <span class="detail-value">${classInfo.type}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Faculty Status:</span>
            <span class="detail-value status-${facultyData.currentStatus}">${statusConfig[facultyData.currentStatus].text}</span>
        </div>
    `;
    
    document.getElementById('classModal').style.display = 'block';
}

function showSubjectDetails(subject) {
    document.getElementById('modalTitle').textContent = `${subject.code} - ${subject.name}`;
    document.getElementById('modalBody').innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Subject Code:</span>
            <span class="detail-value">${subject.code}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Subject Name:</span>
            <span class="detail-value">${subject.name}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Total Students:</span>
            <span class="detail-value">${subject.students}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Weekly Classes:</span>
            <span class="detail-value">${getWeeklyClassCount(subject.code)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Department:</span>
            <span class="detail-value">${facultyData.department}</span>
        </div>
    `;
    
    document.getElementById('classModal').style.display = 'block';
}

function getWeeklyClassCount(subjectCode) {
    let count = 0;
    Object.values(teachingSchedule).forEach(day => {
        count += day.filter(cls => cls.subject === subjectCode).length;
    });
    return count;
}

function closeModal() {
    document.getElementById('classModal').style.display = 'none';
}

// Class Management Functions
function cancelClass() {
    showStatusNotification('Class cancellation functionality would be implemented here');
    closeModal();
    
    // This would integrate with your timetable generator
    /*
    const cancelData = {
        action: 'cancel',
        facultyId: facultyData.id,
        timestamp: new Date().toISOString(),
        reason: 'Faculty initiated cancellation'
    };
    
    // Send to timetable generator API
    */
}

function rescheduleClass() {
    showStatusNotification('Class rescheduling functionality would be implemented here');
    closeModal();
    
    // This would open a rescheduling interface
    /*
    const rescheduleData = {
        action: 'reschedule',
        facultyId: facultyData.id,
        timestamp: new Date().toISOString()
    };
    
    // Send to timetable generator API
    */
}

// Export and Sync Functions
function exportSchedule() {
    // Create CSV content
    let csvContent = "Day,Time,Subject,Class,Room,Students,Type\n";
    
    Object.entries(teachingSchedule).forEach(([day, classes]) => {
        classes.forEach(cls => {
            csvContent += `${day},${cls.time},${cls.subject},${cls.class},${cls.room},${cls.students},${cls.type}\n`;
        });
    });
    
    // Add faculty info header
    const header = `Faculty Schedule Export\nName: ${facultyData.name}\nID: ${facultyData.id}\nDepartment: ${facultyData.department}\nExported: ${new Date().toLocaleString()}\n\n`;
    csvContent = header + csvContent;
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faculty-schedule-${facultyData.id}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showStatusNotification('Schedule exported successfully!');
}

function syncTimetable() {
    // Simulate timetable sync
    const loadingBtn = document.querySelector('.btn-sync');
    const originalText = loadingBtn.innerHTML;
    
    loadingBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
    loadingBtn.disabled = true;
    
    setTimeout(() => {
        loadingBtn.innerHTML = originalText;
        loadingBtn.disabled = false;
        showStatusNotification('Timetable synced successfully!');
        
        // Refresh data after sync
        updateQuickStats();
        loadUpcomingClasses();
        updateSchedule();
    }, 2000);
    
    // This would sync with your main timetable generator
    /*
    fetch('/api/sync-faculty-timetable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            facultyId: facultyData.id,
            lastSync: new Date().toISOString()
        })
    })
    .then(response => response.json())
    .then(data => {
        // Update local data with synced data
        updateLocalScheduleData(data);
    });
    */
}

// Event Listeners
window.addEventListener('click', function(event) {
    const modal = document.getElementById('classModal');
    if (event.target === modal) {
        closeModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
    
    if (event.key === 'ArrowLeft') {
        navigateDate(-1);
    }
    
    if (event.key === 'ArrowRight') {
        navigateDate(1);
    }
    
    if (event.key === 't' || event.key === 'T') {
        goToToday();
    }
    
    // Quick status change shortcuts
    if (event.ctrlKey) {
        switch(event.key) {
            case '1':
                event.preventDefault();
                setStatus('available');
                break;
            case '2':
                event.preventDefault();
                setStatus('busy');
                break;
            case '3':
                event.preventDefault();
                setStatus('unavailable');
                break;
            case '4':
                event.preventDefault();
                setStatus('on-leave');
                break;
        }
    }
});

// Auto-refresh functionality
setInterval(() => {
    // Auto-refresh upcoming classes every 5 minutes
    loadUpcomingClasses();
}, 5 * 60 * 1000);

// Real-time status updates (if connected to a real backend)
function startStatusUpdateListener() {
    // This would connect to a WebSocket or Server-Sent Events
    // to receive real-time updates from the timetable generator
    /*
    const eventSource = new EventSource('/api/faculty-status-updates');
    
    eventSource.onmessage = function(event) {
        const update = JSON.parse(event.data);
        if (update.facultyId === facultyData.id) {
            handleStatusUpdate(update);
        }
    };
    */
}

function handleStatusUpdate(update) {
    // Handle incoming status updates from timetable generator
    if (update.forceStatusChange) {
        setCurrentStatus(update.newStatus);
        showStatusNotification(`Status automatically updated to ${update.newStatus} by system`);
    }
    
    if (update.scheduleChanges) {
        showStatusNotification('Your schedule has been updated. Refreshing...');
        setTimeout(() => {
            updateSchedule();
            loadUpcomingClasses();
        }, 1000);
    }
}

// Initialize status update listener on load
// startStatusUpdateListener();



