// College events data
const collegeEvents = {
    '2025-09-15': [
        { type: 'holiday', title: 'Ganesh Chaturthi', description: 'Hindu Festival Holiday' }
    ],
    '2025-09-20': [
        { type: 'fest', title: 'Tech Fest 2025', description: 'Annual Technical Festival' }
    ],
    '2025-09-25': [
        { type: 'exam', title: 'Mid-Term Exams Begin', description: 'Semester Mid-Term Examinations' }
    ],
    '2025-10-02': [
        { type: 'holiday', title: 'Gandhi Jayanti', description: 'National Holiday' }
    ],
    '2025-10-05': [
        { type: 'event', title: 'Career Fair', description: 'Annual Career Fair and Job Placements' }
    ],
    '2025-10-12': [
        { type: 'fest', title: 'Cultural Fest', description: 'Annual Cultural Festival - Kaleidoscope' }
    ],
    '2025-10-15': [
        { type: 'event', title: 'Guest Lecture', description: 'Industry Expert Guest Lecture Series' }
    ],
    '2025-10-20': [
        { type: 'exam', title: 'Final Exams', description: 'Semester Final Examinations Begin' }
    ],
    '2025-10-31': [
        { type: 'holiday', title: 'Diwali Break Starts', description: 'Festival Holiday Break' }
    ],
    '2025-11-05': [
        { type: 'event', title: 'Sports Day', description: 'Annual Sports and Athletics Event' }
    ],
    '2025-11-12': [
        { type: 'fest', title: 'Science Exhibition', description: 'Student Science Project Exhibition' }
    ],
    '2025-11-15': [
        { type: 'event', title: 'Alumni Meet', description: 'Annual Alumni Gathering and Networking' }
    ],
    '2025-11-25': [
        { type: 'exam', title: 'Practical Exams', description: 'Laboratory and Practical Examinations' }
    ],
    '2025-12-10': [
        { type: 'event', title: 'Graduation Ceremony', description: 'Annual Convocation and Graduation' }
    ],
    '2025-12-25': [
        { type: 'holiday', title: 'Christmas', description: 'Christmas Holiday' }
    ]
};

// Current date
let currentDate = new Date();

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    updateCalendar();
    addScrollEffects();
});

// Portal navigation function
function navigateToPortal(portal) {
    // Add click animation
    event.target.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        event.target.style.transform = '';
        
        // Navigate to respective signup/login pages
        switch(portal) {
            case 'admin':
                window.location.href = 'admin-signup.html'; // Replace with your actual admin signup page
                break;
            case 'student':
                window.location.href = 'student-signup.html'; // Replace with your actual student signup page
                break;
            case 'faculty':
                window.location.href = 'faculty-signup.html'; // Replace with your actual faculty signup page
                break;
            default:
                console.log('Unknown portal:', portal);
        }
    }, 150);
}

// Calendar navigation
function navigateMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    updateCalendar();
}

// Update calendar display
function updateCalendar() {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Update month display
    document.getElementById('currentMonth').textContent = 
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Get today's date for highlighting
    const today = new Date();
    const isCurrentMonth = 
        currentDate.getMonth() === today.getMonth() && 
        currentDate.getFullYear() === today.getFullYear();
    
    // Clear calendar grid
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        
        // Calculate the date for the previous month
        const prevMonthDate = new Date(firstDay);
        prevMonthDate.setDate(prevMonthDate.getDate() - (startingDayOfWeek - i));
        
        emptyDay.innerHTML = `<div class="day-number">${prevMonthDate.getDate()}</div>`;
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // Check if this is today
        if (isCurrentMonth && day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // Create date string for event lookup
        const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Get events for this day
        const dayEvents = collegeEvents[dateString] || [];
        
        // Create day content
        let dayContent = `<div class="day-number">${day}</div>`;
        
        if (dayEvents.length > 0) {
            dayContent += '<div class="day-events">';
            
            // Add event dots and text
            dayEvents.forEach(event => {
                dayContent += `<div class="event-dot ${event.type}"></div>`;
            });
            
            // Add event text for first event
            if (dayEvents.length === 1) {
                dayContent += `<div class="event-text">${dayEvents[0].title}</div>`;
            } else if (dayEvents.length > 1) {
                dayContent += `<div class="event-text">${dayEvents.length} events</div>`;
            }
            
            dayContent += '</div>';
            
            // Add click event for event details
            dayElement.addEventListener('click', () => showEventDetails(dateString, dayEvents));
            dayElement.style.cursor = 'pointer';
        }
        
        dayElement.innerHTML = dayContent;
        calendarGrid.appendChild(dayElement);
    }
    
    // Fill remaining cells with next month's days
    const totalCells = 42; // 6 rows × 7 days
    const cellsUsed = startingDayOfWeek + daysInMonth;
    const remainingCells = totalCells - cellsUsed;
    
    for (let i = 1; i <= remainingCells && remainingCells < 14; i++) {
        const nextMonthDay = document.createElement('div');
        nextMonthDay.className = 'calendar-day other-month';
        nextMonthDay.innerHTML = `<div class="day-number">${i}</div>`;
        calendarGrid.appendChild(nextMonthDay);
    }
}

// Show event details in modal
function showEventDetails(dateString, events) {
    const modal = document.getElementById('eventModal');
    const eventTitle = document.getElementById('eventTitle');
    const eventDetails = document.getElementById('eventDetails');
    
    // Format date for display
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    eventTitle.textContent = `Events on ${formattedDate}`;
    
    // Build event details HTML
    let detailsHTML = '';
    events.forEach(event => {
        const typeColor = {
            holiday: '#ef4444',
            fest: '#f59e0b',
            exam: '#8b5cf6',
            event: '#10b981'
        };
        
        detailsHTML += `
            <div class="event-detail">
                <strong style="color: ${typeColor[event.type]}">${event.title}</strong>
                <span>${event.description}</span>
            </div>
        `;
    });
    
    eventDetails.innerHTML = detailsHTML;
    modal.style.display = 'block';
}

// Close event modal
function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('eventModal');
    if (event.target === modal) {
        closeEventModal();
    }
});

// Add scroll effects
function addScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections for scroll animations
    document.querySelectorAll('.welcome-section, .navigation-section, .calendar-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.6s ease';
        observer.observe(section);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeEventModal();
    }
    
    if (event.key === 'ArrowLeft') {
        navigateMonth(-1);
    }
    
    if (event.key === 'ArrowRight') {
        navigateMonth(1);
    }
    
    // Quick portal navigation
    if (event.altKey) {
        switch(event.key) {
            case '1':
                event.preventDefault();
                navigateToPortal('admin');
                break;
            case '2':
                event.preventDefault();
                navigateToPortal('student');
                break;
            case '3':
                event.preventDefault();
                navigateToPortal('faculty');
                break;
        }
    }
});

// Add smooth scrolling for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation on page load
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Auto-refresh calendar at midnight
function scheduleCalendarRefresh() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
        updateCalendar();
        scheduleCalendarRefresh(); // Schedule next refresh
    }, msUntilMidnight);
}

scheduleCalendarRefresh();