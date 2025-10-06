// College holidays data
const holidays = {
    '2025-01-01': [{ type: 'holiday', title: 'New Year\'s Day', description: 'Restricted Holiday' }],
    '2025-01-06': [{ type: 'holiday', title: 'Guru Govind Singh Jayanti', description: 'Restricted Holiday' }],
    '2025-01-14': [
        { type: 'holiday', title: 'Pongal', description: 'Restricted Holiday' },
        { type: 'holiday', title: 'Makar Sankranti', description: 'Restricted Holiday' },
        { type: 'holiday', title: 'Hazarat Ali\'s Birthday', description: 'Restricted Holiday' }
    ],
    '2025-01-26': [{ type: 'holiday', title: 'Republic Day', description: 'Gazetted Holiday' }],
    '2025-02-02': [{ type: 'holiday', title: 'Vasant Panchami', description: 'Restricted Holiday' }],
    '2025-02-12': [{ type: 'holiday', title: 'Guru Ravidas Jayanti', description: 'Restricted Holiday' }],
    '2025-02-19': [{ type: 'holiday', title: 'Shivaji Jayanti', description: 'Restricted Holiday' }],
    '2025-02-23': [{ type: 'holiday', title: 'Maharishi Dayanand Saraswati Jayanti', description: 'Restricted Holiday' }],
    '2025-02-26': [{ type: 'holiday', title: 'Maha Shivaratri/Shivaratri', description: 'Gazetted Holiday' }],
    '2025-03-13': [{ type: 'holiday', title: 'Holika Dahana', description: 'Restricted Holiday' }],
    '2025-03-14': [
        { type: 'holiday', title: 'Holi', description: 'Gazetted Holiday' },
        { type: 'holiday', title: 'Dolyatra', description: 'Restricted Holiday' }
    ],
    '2025-03-28': [{ type: 'holiday', title: 'Jamat Ul-Vida', description: 'Restricted Holiday' }],
    '2025-03-30': [
        { type: 'holiday', title: 'Chaitra Sukhladi', description: 'Restricted Holiday' },
        { type: 'holiday', title: 'Ugadi', description: 'Restricted Holiday' },
        { type: 'holiday', title: 'Gudi Padwa', description: 'Restricted Holiday' }
    ],
    '2025-03-31': [{ type: 'holiday', title: 'Ramzan Id', description: 'Gazetted Holiday' }],
    '2025-04-06': [{ type: 'holiday', title: 'Rama Navami', description: 'Restricted Holiday' }],
    '2025-04-10': [{ type: 'holiday', title: 'Mahavir Jayanti', description: 'Gazetted Holiday' }],
    '2025-04-13': [{ type: 'holiday', title: 'Vaisakhi', description: 'Restricted Holiday' }],
    '2025-04-14': [{ type: 'holiday', title: 'Mesadi', description: 'Restricted Holiday' }],
    '2025-04-15': [{ type: 'holiday', title: 'Bahag Bihu/Vaisakhadi', description: 'Restricted Holiday' }],
    '2025-04-18': [{ type: 'holiday', title: 'Good Friday', description: 'Gazetted Holiday' }],
    '2025-04-20': [{ type: 'holiday', title: 'Easter Day', description: 'Restricted Holiday' }],
    '2025-05-09': [{ type: 'holiday', title: 'Birthday of Rabindranath', description: 'Restricted Holiday' }],
    '2025-05-12': [{ type: 'holiday', title: 'Buddha Purnima/Vesak', description: 'Gazetted Holiday' }],
    '2025-06-07': [{ type: 'holiday', title: 'Bakrid', description: 'Gazetted Holiday' }],
    '2025-06-27': [{ type: 'holiday', title: 'Rath Yatra', description: 'Restricted Holiday' }],
    '2025-07-06': [{ type: 'holiday', title: 'Muharram/Ashura', description: 'Gazetted Holiday' }],
    '2025-08-09': [{ type: 'holiday', title: 'Raksha Bandhan (Rakhi)', description: 'Restricted Holiday' }],
    '2025-08-15': [
        { type: 'holiday', title: 'Independence Day', description: 'Gazetted Holiday' },
        { type: 'holiday', title: 'Janmashtami (Smarta)', description: 'Restricted Holiday' },
        { type: 'holiday', title: 'Parsi New Year', description: 'Restricted Holiday' }
    ],
    '2025-08-16': [{ type: 'holiday', title: 'Janmashtami', description: 'Gazetted Holiday' }],
    '2025-08-27': [{ type: 'holiday', title: 'Ganesh Chaturthi/Vinayaka Chaturthi', description: 'Restricted Holiday' }],
    '2025-09-05': [
        { type: 'holiday', title: 'Milad un-Nabi', description: 'Gazetted Holiday' },
        { type: 'holiday', title: 'Onam', description: 'Restricted Holiday' }
    ],
    '2025-09-29': [{ type: 'holiday', title: 'Maha Saptami', description: 'Restricted Holiday' }],
    '2025-09-30': [{ type: 'holiday', title: 'Maha Ashtami', description: 'Restricted Holiday' }],
    '2025-10-01': [{ type: 'holiday', title: 'Maha Navami', description: 'Restricted Holiday' }],
    '2025-10-02': [
        { type: 'holiday', title: 'Mahatma Gandhi Jayanti', description: 'Gazetted Holiday' },
        { type: 'holiday', title: 'Dussehra', description: 'Gazetted Holiday' }
    ],
    '2025-10-07': [{ type: 'holiday', title: 'Maharishi Valmiki Jayanti', description: 'Restricted Holiday' }],
    '2025-10-10': [{ type: 'holiday', title: 'Karaka Chaturthi (Karva Chauth)', description: 'Restricted Holiday' }],
    '2025-10-20': [
        { type: 'holiday', title: 'Naraka Chaturdasi', description: 'Restricted Holiday' },
        { type: 'holiday', title: 'Diwali/Deepavali', description: 'Gazetted Holiday' }
    ],
    '2025-10-22': [{ type: 'holiday', title: 'Govardhan Puja', description: 'Restricted Holiday' }],
    '2025-10-23': [{ type: 'holiday', title: 'Bhai Duj', description: 'Restricted Holiday' }],
    '2025-10-28': [{ type: 'holiday', title: 'Chhat Puja (Pratihar Sashthi/Surya Sashthi)', description: 'Restricted Holiday' }],
    '2025-11-05': [{ type: 'holiday', title: 'Guru Nanak Jayanti', description: 'Gazetted Holiday' }],
    '2025-11-24': [{ type: 'holiday', title: 'Guru Tegh Bahadur\'s Martyrdom Day', description: 'Restricted Holiday' }],
    '2025-12-24': [{ type: 'holiday', title: 'Christmas Eve', description: 'Restricted Holiday' }],
    '2025-12-25': [{ type: 'holiday', title: 'Christmas', description: 'Gazetted Holiday' }]
};

// College events data, loaded from localStorage or initialized
let collegeEvents = JSON.parse(localStorage.getItem('collegeEvents')) || {
    '2025-09-20': [
        { type: 'fest', title: 'Tech Fest 2025', description: 'Annual Technical Festival' }
    ],
    '2025-09-25': [
        { type: 'exam', title: 'Mid-Term Exams Begin', description: 'Semester Mid-Term Examinations' }
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
    ]
};

// Function to add new college event (to be called from admin portal)
function addCollegeEvent(date, event) {
    if (!collegeEvents[date]) {
        collegeEvents[date] = [];
    }
    collegeEvents[date].push(event);
    localStorage.setItem('collegeEvents', JSON.stringify(collegeEvents));
    updateCalendar();
}

// Current date
let currentDate = new Date();

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    updateCalendar();
    addScrollEffects();
});

// Portal navigation function (fixed to handle event properly)
function navigateToPortal(event, portal) {
    // Safely handle event if provided (for visual effect)
    if (event && event.target) {
        event.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            if (event.target) {
                event.target.style.transform = '';
            }
            performRedirect(portal);
        }, 150);
    } else {
        // If no event (called programmatically), redirect immediately
        performRedirect(portal);
    }
}

// Helper function to perform the actual redirect
function performRedirect(portal) {
    switch(portal) {
        case 'admin':
            window.location.href = 'admin-signup.html';
            break;
        case 'student':
            window.location.href = 'student-signup.html';
            break;
        case 'faculty':
            window.location.href = 'faculty-signup.html';
            break;
        default:
            console.log('Unknown portal:', portal);
            // Optional: Show an alert or notification for unknown portal
            alert('Unknown portal selected: ' + portal);
    }
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
    
    document.getElementById('currentMonth').textContent = 
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const today = new Date();
    const isCurrentMonth = 
        currentDate.getMonth() === today.getMonth() && 
        currentDate.getFullYear() === today.getFullYear();
    
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        const prevMonthDate = new Date(firstDay);
        prevMonthDate.setDate(prevMonthDate.getDate() - (startingDayOfWeek - i));
        emptyDay.innerHTML = `<div class="day-number">${prevMonthDate.getDate()}</div>`;
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (isCurrentMonth && day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Merge holidays and college events
        const dayHolidays = holidays[dateString] || [];
        const dayCollegeEvents = collegeEvents[dateString] || [];
        const dayEvents = [...dayHolidays, ...dayCollegeEvents];
        
        let dayContent = `<div class="day-number">${day}</div>`;
        
        if (dayEvents.length > 0) {
            dayContent += '<div class="day-events">';
            dayEvents.forEach(event => {
                dayContent += `<div class="event-dot ${event.type}"></div>`;
            });
            if (dayEvents.length === 1) {
                dayContent += `<div class="event-text">${dayEvents[0].title}</div>`;
            } else if (dayEvents.length > 1) {
                dayContent += `<div class="event-text">${dayEvents.length} events</div>`;
            }
            dayContent += '</div>';
            dayElement.addEventListener('click', () => showEventDetails(dateString, dayEvents));
            dayElement.style.cursor = 'pointer';
        }
        
        dayElement.innerHTML = dayContent;
        calendarGrid.appendChild(dayElement);
    }
    
    // Fill remaining cells with next month's days
    const totalCells = 42;
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
    
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    eventTitle.textContent = `Events on ${formattedDate}`;
    
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
    
    if (event.altKey) {
        switch(event.key) {
            case '1':
                event.preventDefault();
                navigateToPortal(event, 'admin');
                break;
            case '2':
                event.preventDefault();
                navigateToPortal(event, 'student');
                break;
            case '3':
                event.preventDefault();
                navigateToPortal(event, 'faculty');
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
        scheduleCalendarRefresh();
    }, msUntilMidnight);
}

scheduleCalendarRefresh();