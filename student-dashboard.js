// Sample student data
const studentData = {
    name: "Mansi",
    id: "STU001",
    class: "Computer Science - Year 3",
    semester: "Semester 6",
    subjects: [
        { code: "CS301", name: "Data Structures", credits: 3, color: "subject-computer" },
        { code: "CS302", name: "Database Systems", credits: 4, color: "subject-computer" },
        { code: "MATH201", name: "Discrete Mathematics", credits: 3, color: "subject-math" },
        { code: "CS303", name: "Software Engineering", credits: 3, color: "subject-computer" },
        { code: "ENG101", name: "Technical Writing", credits: 2, color: "subject-english" },
        { code: "CS304", name: "Computer Networks", credits: 3, color: "subject-computer" }
    ]
};

// Sample timetable data
const timetableData = {
    monday: [
        { time: "09:00", subject: "CS301", room: "Lab-A", instructor: "Dr. Smith", type: "Lecture" },
        { time: "11:00", subject: "MATH201", room: "Room-102", instructor: "Prof. Johnson", type: "Lecture" },
        { time: "14:00", subject: "CS302", room: "Lab-B", instructor: "Dr. Brown", type: "Lab" }
    ],
    tuesday: [
        { time: "10:00", subject: "CS303", room: "Room-201", instructor: "Dr. Wilson", type: "Lecture" },
        { time: "13:00", subject: "ENG101", room: "Room-105", instructor: "Ms. Davis", type: "Lecture" },
        { time: "15:00", subject: "CS301", room: "Lab-A", instructor: "Dr. Smith", type: "Lab" }
    ],
    wednesday: [
        { time: "09:00", subject: "CS304", room: "Room-301", instructor: "Dr. Taylor", type: "Lecture" },
        { time: "11:00", subject: "CS302", room: "Room-202", instructor: "Dr. Brown", type: "Lecture" },
        { time: "14:00", subject: "MATH201", room: "Room-102", instructor: "Prof. Johnson", type: "Tutorial" }
    ],
    thursday: [
        { time: "08:00", subject: "CS303", room: "Lab-C", instructor: "Dr. Wilson", type: "Lab" },
        { time: "10:00", subject: "CS304", room: "Lab-D", instructor: "Dr. Taylor", type: "Lab" },
        { time: "13:00", subject: "CS302", room: "Room-202", instructor: "Dr. Brown", type: "Lecture" }
    ],
    friday: [
        { time: "09:00", subject: "ENG101", room: "Room-105", instructor: "Ms. Davis", type: "Lecture" },
        { time: "11:00", subject: "CS301", room: "Room-201", instructor: "Dr. Smith", type: "Lecture" },
        { time: "14:00", subject: "MATH201", room: "Room-102", instructor: "Prof. Johnson", type: "Lecture" },
        { time: "16:00", subject: "CS304", room: "Room-301", instructor: "Dr. Taylor", type: "Lecture" }
    ]
};

// Sample upcoming events
const upcomingEvents = [
    { time: "Mon 10:00", title: "CS301 Quiz", type: "Assessment", date: "2025-09-22" },
    { time: "Wed 14:00", title: "Math Assignment Due", type: "Deadline", date: "2025-09-24" },
    { time: "Fri 16:00", title: "Project Presentation", type: "Presentation", date: "2025-09-26" },
    { time: "Mon 09:00", title: "Midterm Exam - CS302", type: "Exam", date: "2025-09-29" }
];

// Current view and date
let currentView = 'day';
let currentDate = new Date();

// Time slots for day view
const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

// Week days for week view
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadStudentInfo();
    loadSubjects();
    loadUpcomingEvents();
    updateCalendar();
});

function initializeDashboard() {
    // Set current date
    updateDateDisplay();
    
    // Calculate stats
    updateQuickStats();
}

function loadStudentInfo() {
    document.getElementById('studentName').textContent = studentData.name;
    document.getElementById('studentID').textContent = studentData.id;
    document.getElementById('studentClass').textContent = studentData.class;
    document.getElementById('studentSemester').textContent = studentData.semester;
}

function loadSubjects() {
    const subjectsList = document.getElementById('subjectsList');
    subjectsList.innerHTML = '';
    
    studentData.subjects.forEach(subject => {
        const subjectElement = document.createElement('div');
        subjectElement.className = `subject-item ${subject.color}`;
        subjectElement.innerHTML = `
            <div>
                <div class="subject-code">${subject.code}</div>
                <div class="subject-name">${subject.name}</div>
            </div>
            <div class="subject-credits">${subject.credits} CR</div>
        `;
        subjectElement.addEventListener('click', () => showSubjectDetails(subject));
        subjectsList.appendChild(subjectElement);
    });
}

function loadUpcomingEvents() {
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = '';
    
    upcomingEvents.slice(0, 4).forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        eventElement.innerHTML = `
            <div class="event-time">${event.time}</div>
            <div class="event-details">
                <div class="event-title">${event.title}</div>
                <div class="event-type">${event.type}</div>
            </div>
        `;
        eventsList.appendChild(eventElement);
    });
}

function updateQuickStats() {
    const today = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayClasses = getTodayClasses(today);
    const weekClasses = getTotalWeekClasses();
    const totalCredits = studentData.subjects.reduce((sum, subject) => sum + subject.credits, 0);
    
    document.getElementById('todayClasses').textContent = todayClasses.length;
    document.getElementById('weekClasses').textContent = weekClasses;
    document.getElementById('totalCredits').textContent = totalCredits;
}

function getTodayClasses(day) {
    return timetableData[day] || [];
}

function getTotalWeekClasses() {
    return Object.values(timetableData).reduce((total, day) => total + day.length, 0);
}

function switchView(view) {
    currentView = view;
    
    // Update toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    // Update view content
    document.querySelectorAll('.view-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${view}View`).classList.add('active');
    
    updateCalendar();
}

function updateCalendar() {
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
            slotContent.innerHTML = `
                <div class="class-info">
                    <div class="class-subject">${classForTime.subject}</div>
                    <div class="class-details">
                        <span class="class-room">${classForTime.room}</span>
                        <span>${classForTime.instructor}</span>
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
    
    // Clear previous content
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
    
    // Clear previous content
    monthHeader.innerHTML = '';
    monthGrid.innerHTML = '';
    
    // Add day headers
    monthDaysHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'month-day-header';
        dayHeader.textContent = day;
        monthHeader.appendChild(dayHeader);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Create calendar grid
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
    updateCalendar();
    updateQuickStats();
}

function goToToday() {
    currentDate = new Date();
    updateDateDisplay();
    updateCalendar();
    updateQuickStats();
}

function showClassDetails(classInfo) {
    const subject = studentData.subjects.find(s => s.code === classInfo.subject);
    
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
            <span class="detail-label">Instructor:</span>
            <span class="detail-value">${classInfo.instructor}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Type:</span>
            <span class="detail-value">${classInfo.type}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Credits:</span>
            <span class="detail-value">${subject ? subject.credits : 'N/A'}</span>
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
            <span class="detail-label">Credits:</span>
            <span class="detail-value">${subject.credits}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Weekly Classes:</span>
            <span class="detail-value">${getWeeklyClassCount(subject.code)}</span>
        </div>
    `;
    
    document.getElementById('classModal').style.display = 'block';
}

function getWeeklyClassCount(subjectCode) {
    let count = 0;
    Object.values(timetableData).forEach(day => {
        count += day.filter(cls => cls.subject === subjectCode).length;
    });
    return count;
}

function closeModal() {
    document.getElementById('classModal').style.display = 'none';
}

function exportTimetable() {
    // Create CSV content
    let csvContent = "Day,Time,Subject,Room,Instructor,Type\n";
    
    Object.entries(timetableData).forEach(([day, classes]) => {
        classes.forEach(cls => {
            csvContent += `${day},${cls.time},${cls.subject},${cls.room},${cls.instructor},${cls.type}\n`;
        });
    });
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-timetable.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    // Show success message
    alert('Timetable exported successfully!');
}

function syncCalendar() {
    // Simulate calendar sync
    const loadingBtn = document.querySelector('.btn-sync');
    const originalText = loadingBtn.innerHTML;
    
    loadingBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
    loadingBtn.disabled = true;
    
    setTimeout(() => {
        loadingBtn.innerHTML = originalText;
        loadingBtn.disabled = false;
        alert('Timetable synced with your calendar successfully!');
    }, 2000);
}

// Close modal when clicking outside
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
});