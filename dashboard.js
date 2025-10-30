// Dashboard's functional JS
let dashboardData = {
    stats: {},
    timetableHistory: [],
    activityFeed: [],
    calendarEvents: []
};
let calendar;
let currentAdmin = {};

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/admin';
        return;
    }

    await initializeDashboard(token);
    initializeCalendar();
    updateDateTime();
    setInterval(updateDateTime, 60000);

    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // ✅ NEW: Setup WebSocket connection
    setupWebSocket();
    // ✅ NEW: Request notification permission
    requestNotificationPermission();
    // ✅ NEW: Register service worker
    registerServiceWorker();
});
// ✅ NEW FUNCTION: Register service worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('✅ Service Worker registered:', registration);
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    } else {
        console.log('⚠️ Service Workers not supported in this browser');
    }
}



async function initializeDashboard(token) {
    try {
        // Fetch admin profile
        const userResponse = await fetch('http://127.0.0.1:8000/admin/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (userResponse.ok) {
            currentAdmin = await userResponse.json();
            updateAdminProfile();
        }

        // Fetch stats
        const statsResponse = await fetch('http://127.0.0.1:8000/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (statsResponse.ok) {
            dashboardData.stats = await statsResponse.json();
            updateStats();
        }

        // Fetch timetable history
        const historyResponse = await fetch('http://127.0.0.1:8000/admin/timetable_history', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (historyResponse.ok) {
            dashboardData.timetableHistory = await historyResponse.json();
            updateTimetableHistory();
            updateCalendarEvents();
        }

        // Fetch activity feed
        const activityResponse = await fetch('http://127.0.0.1:8000/admin/activity_feed', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (activityResponse.ok) {
            dashboardData.activityFeed = await activityResponse.json();
            updateActivityFeed();
        }

        await updateModuleCounts();

    } catch (error) {
        console.error('Dashboard initialization error:', error);
        showNotification('Error loading dashboard data: ' + error.message, 'error');
    }
}

function updateAdminProfile() {
    const adminNameEl = document.getElementById('adminName');
    if (adminNameEl) {
        adminNameEl.textContent = currentAdmin.fullName || currentAdmin.username || 'Admin';
    }

    const profileImgs = document.querySelectorAll('.profile-img');
    profileImgs.forEach(img => {
        if (currentAdmin.photo && currentAdmin.photo !== 'https://via.placeholder.com/40') {
            img.src = currentAdmin.photo;
        }
    });

    const welcomeMsg = document.querySelector('.header-left p');
    if (welcomeMsg) {
        welcomeMsg.textContent = `Welcome ${currentAdmin.fullName || currentAdmin.username}! Here's what's happening with your timetables.`;
    }
}

function updateStats() {
    const stats = dashboardData.stats;
    document.getElementById('totalClasses').textContent = stats.totalClasses || 0;
    document.getElementById('totalSubjects').textContent = stats.totalSubjects || 0;
    document.getElementById('totalTeachers').textContent = stats.totalTeachers || 0;
    document.getElementById('totalRooms').textContent = stats.totalRooms || 0;
}

function updateTimetableHistory() {
    const timetableList = document.getElementById('timetableList');
    if (!timetableList) return;

    timetableList.innerHTML = '';

    const recent = dashboardData.timetableHistory.slice(0, 5);

    if (recent.length === 0) {
        timetableList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #718096;">
                <i class="fas fa-calendar-times" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>No timetables generated yet</p>
                <button class="btn primary" onclick="generateTimetable()" style="margin-top: 1rem;">
                    Generate Your First Timetable
                </button>
            </div>
        `;
        return;
    }

    recent.forEach(slot => {
        const item = document.createElement('div');
        item.className = 'timetable-item fade-in';

        const createdDate = slot.created ? new Date(slot.created).toLocaleDateString() : 'Recently';

        item.innerHTML = `
            <div class="timetable-info">
                <h4>${slot.subject} (${slot.subject_code})</h4>
                <p>${slot.day} at ${slot.time} - ${slot.room} | ${slot.type}</p>
                <small style="color: #718096;">Created by ${slot.created_by} on ${createdDate}</small>
            </div>
            <div class="timetable-status ${slot.status}">
                <span>${slot.status}</span>
            </div>
            <div class="timetable-actions">
                <button class="btn-small" onclick="viewTimetableDetails('${slot.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        `;
        timetableList.appendChild(item);
    });
}

function updateActivityFeed() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;

    activityList.innerHTML = '';

    const activities = dashboardData.activityFeed.slice(0, 5);

    if (activities.length === 0) {
        activityList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #718096;">
                <i class="fas fa-history" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>No recent activity</p>
            </div>
        `;
        return;
    }

    activities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item slide-in';

        const iconMap = {
            'timetable_generated': 'fa-calendar-plus',
            'profile_update': 'fa-user-edit',
            'course_added': 'fa-book',
            'teacher_added': 'fa-user-plus',
            'student_added': 'fa-user-graduate'
        };

        const icon = iconMap[activity.action] || 'fa-info-circle';
        const timeAgo = getTimeAgo(activity.timestamp);

        item.innerHTML = `
            <div class="activity-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="activity-content">
                <p><strong>${activity.description}</strong></p>
                <span>By ${activity.username}</span>
                <time>${timeAgo}</time>
            </div>
        `;
        activityList.appendChild(item);
    });
}

function getTimeAgo(timestamp) {
    if (!timestamp) return 'Recently';

    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return past.toLocaleDateString();
}

function updateCalendarEvents() {
    dashboardData.calendarEvents = dashboardData.timetableHistory.map(slot => {
        const eventDate = slot.date ? new Date(slot.date) : new Date();
        const [hours, minutes] = (slot.time || '09:00').split(':');
        eventDate.setHours(parseInt(hours), parseInt(minutes), 0);

        return {
            title: `${slot.subject} - ${slot.type}`,
            start: eventDate.toISOString(),
            extendedProps: {
                room: slot.room,
                instructor: slot.instructor,
                type: slot.type,
                students: slot.students
            },
            color: '#667eea'
        };
    });

    if (calendar) {
        calendar.removeAllEvents();
        calendar.addEventSource(dashboardData.calendarEvents);
    }
}

function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: dashboardData.calendarEvents,
        eventClick: function(info) {
            const props = info.event.extendedProps;
            showNotification(
                `${info.event.title}\nRoom: ${props.room}\nInstructor: ${props.instructor}\nStudents: ${props.students}`,
                'info'
            );
        },
        height: 'auto',
        contentHeight: 500
    });
    calendar.render();
}

async function updateModuleCounts() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const studentsRes = await fetch('http://127.0.0.1:8000/admin/students', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (studentsRes.ok) {
            const students = await studentsRes.json();
            const el = document.getElementById('studentsCount');
            if (el) el.innerHTML = `<span>${students.length} students registered</span>`;
        }

        const teachersRes = await fetch('http://127.0.0.1:8000/admin/teachers', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (teachersRes.ok) {
            const teachers = await teachersRes.json();
            const el = document.getElementById('teachersCount');
            if (el) el.innerHTML = `<span>${teachers.length} teachers on staff</span>`;
        }

        const coursesRes = await fetch('http://127.0.0.1:8000/admin/courses', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (coursesRes.ok) {
            const courses = await coursesRes.json();
            const el = document.getElementById('coursesCount');
            if (el) el.innerHTML = `<span>${courses.length} courses available</span>`;
        }

        const classroomsRes = await fetch('http://127.0.0.1:8000/admin/classrooms', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (classroomsRes.ok) {
            const classrooms = await classroomsRes.json();
            const el = document.getElementById('classroomsCount');
            if (el) el.innerHTML = `<span>${classrooms.length} rooms available</span>`;
        }

    } catch (err) {
        console.error('Error fetching module counts:', err);
    }
}

function updateDateTime() {
    const now = new Date();
    const el = document.getElementById('currentDateTime');
    if (el) {
        el.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Profile Management Functions
function openProfileModal() {
    document.getElementById('profileFirstName').value = currentAdmin.firstName || '';
    document.getElementById('profileLastName').value = currentAdmin.lastName || '';
    document.getElementById('profileDepartment').value = currentAdmin.department || '';
    document.getElementById('profilePhone').value = currentAdmin.phone || '';

    if (currentAdmin.photo && currentAdmin.photo !== 'https://via.placeholder.com/40') {
        document.getElementById('photoPreviewImg').src = currentAdmin.photo;
        document.getElementById('photoPreview').style.display = 'block';
    }

    const photoInput = document.getElementById('profilePhoto');
    photoInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('photoPreviewImg').src = event.target.result;
                document.getElementById('photoPreview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    };

    openModal('profileModal');
}

async function submitProfileUpdate() {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Please log in again', 'error');
        return;
    }

    const firstName = document.getElementById('profileFirstName').value.trim();
    const lastName = document.getElementById('profileLastName').value.trim();
    const department = document.getElementById('profileDepartment').value;
    const phone = document.getElementById('profilePhone').value.trim();
    const photoFile = document.getElementById('profilePhoto').files[0];

    try {
        showNotification('Updating profile...', 'info');

        let photoUrl = currentAdmin.photo;

        if (photoFile) {
            const formData = new FormData();
            formData.append('file', photoFile);

            const photoResponse = await fetch('http://127.0.0.1:8000/admin/upload_photo', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (photoResponse.ok) {
                const photoResult = await photoResponse.json();
                photoUrl = photoResult.photo;
            } else {
                throw new Error('Failed to upload photo');
            }
        }

        const profileData = {
            firstName: firstName || null,
            lastName: lastName || null,
            department: department || null,
            phone: phone || null,
            photo: photoUrl || null
        };

        const response = await fetch('http://127.0.0.1:8000/admin/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });

        if (response.ok) {
            showNotification('Profile updated successfully!', 'success');
            closeModal('profileModal');
            await initializeDashboard(token);
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update profile');
        }

    } catch (err) {
        showNotification('Error: ' + err.message, 'error');
    }
}

function generateTimetable() {
    openModal('generateModal');
}

async function submitGenerate() {
    const form = document.getElementById('generateForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const token = localStorage.getItem('token');
    const data = {
        semester: document.getElementById('semester').value,
        department: document.getElementById('department').value,
        timeSlots: parseInt(document.getElementById('timeSlots').value)
    };

    showNotification('Generating timetable...', 'info');

    try {
        const response = await fetch('http://127.0.0.1:8000/admin/generate_timetable', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            showNotification(`Timetable generated successfully! Created ${result.slots_created} slots.`, 'success');
            closeModal('generateModal');
            await initializeDashboard(token);
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to generate timetable');
        }
    } catch (err) {
        showNotification('Error: ' + err.message, 'error');
    }
}

function importData() {
    openModal('importModal');
}

async function importFile(type) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';

    fileInput.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);

        const endpoints = {
            'teachers': '/admin/upload_teachers',
            'courses': '/admin/upload_courses',
            'classrooms': '/admin/upload_classrooms',
            'students': '/admin/upload_students'
        };

        showNotification(`Uploading ${type}...`, 'info');

        try {
            const response = await fetch(`http://127.0.0.1:8000${endpoints[type]}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                showNotification(`Success! Added: ${result.added}, Updated: ${result.updated || 0}`, 'success');
                closeModal('importModal');
                await initializeDashboard(token);
            } else {
                const error = await response.json();
                throw new Error(error.detail || `Failed to upload ${type}`);
            }
        } catch (err) {
            showNotification('Error: ' + err.message, 'error');
        }
    };

    fileInput.click();
}

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

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const iconMap = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'info': 'info-circle'
    };

    const colorMap = {
        'success': '#38a169',
        'error': '#e53e3e',
        'info': '#667eea'
    };

    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${iconMap[type]}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: white;
        border-left: 4px solid ${colorMap[type]};
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        border-radius: 8px; padding: 1rem; z-index: 10000;
        display: flex; align-items: center; gap: 1rem; min-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/admin';
}

function viewTimetableDetails(id) {
    showNotification(`Viewing details for timetable: ${id}`, 'info');
}

// websocket connection function ----------------------------

function setupWebSocket() {
    // Get user info from localStorage
    const userId = localStorage.getItem('user_id');
    const username = localStorage.getItem('username') || 'Admin';
    const role = 'admin';

    if (!userId) {
        console.warn('⚠️ No user ID found, skipping WebSocket');
        return;
    }

    // Connect to WebSocket
    window.wsClient.connect(userId, username, role);

    // Handle incoming messages
    window.wsClient.onMessage((data) => {
        handleWebSocketMessage(data);
    });
}

function handleWebSocketMessage(data) {
    console.log('📨 Admin received:', data);

    switch(data.type) {
        case 'connection_established':
            console.log('✅ Real-time connection established');
            break;

        case 'students_imported':
        case 'student_registered':
        case 'student_updated':
            // ✅ In-app notification (what you had)
            showNotification(`📚 ${data.message}`, 'success');

            // ✅ NEW: Browser notification
            showBrowserNotification(
                '👥 Student Update',
                data.message,
                {
                    icon: 'https://via.placeholder.com/128?text=📚',
                    tag: 'student-update',
                    onClick: () => {
                        window.location.href = 'students.html';
                    }
                }
            );

            // ✅ Refresh dashboard (what you had)
            if (typeof initializeDashboard === 'function') {
                initializeDashboard(localStorage.getItem('token'));
            }
            if (typeof updateModuleCounts === 'function') {
                updateModuleCounts();
            }
            break;

        case 'teachers_imported':
        case 'teacher_registered':
        case 'teacher_added':
        case 'teacher_updated':
            // ✅ In-app notification
            showNotification(`👨‍🏫 ${data.message}`, 'success');

            // ✅ NEW: Browser notification
            showBrowserNotification(
                '👨‍🏫 Teacher Update',
                data.message,
                {
                    icon: 'https://via.placeholder.com/128?text=👨‍🏫',
                    tag: 'teacher-update',
                    onClick: () => {
                        window.location.href = 'teachers.html';
                    }
                }
            );

            // ✅ Refresh dashboard
            if (typeof initializeDashboard === 'function') {
                initializeDashboard(localStorage.getItem('token'));
            }
            if (typeof updateModuleCounts === 'function') {
                updateModuleCounts();
            }
            break;

        case 'timetable_generated':
        case 'timetable_updated':
            // ✅ In-app notification
            showNotification(`📅 ${data.message}`, 'success');

            // ✅ NEW: Browser notification
            showBrowserNotification(
                '📅 Timetable Update',
                data.message,
                {
                    icon: 'https://via.placeholder.com/128?text=📅',
                    tag: 'timetable-update',
                    onClick: () => {
                        window.location.href = 'timetable.html';
                    }
                }
            );

            // ✅ Refresh dashboard
            if (typeof initializeDashboard === 'function') {
                initializeDashboard(localStorage.getItem('token'));
            }
            break;

        default:
            console.log('Unknown message type:', data.type);
    }
}

//✅ NEW FUNCTION: Request browser notification permission
function requestNotificationPermission() {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
        console.log("❌ This browser doesn't support notifications");
        return;
    }

    // Check current permission status
    console.log("Current notification permission:", Notification.permission);

    if (Notification.permission === "granted") {
        console.log("✅ Notifications already enabled");
        return;
    }

    // If user hasn't decided yet, ask them
    if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function(permission) {
            if (permission === "granted") {
                console.log("✅ User allowed notifications!");

                // Show welcome notification
                new Notification("🎉 TimeWeaver Notifications", {
                    body: "You'll now receive updates even when in another tab!",
                    icon: "https://via.placeholder.com/128?text=TW",
                    tag: "welcome"
                });
            } else {
                console.log("❌ User denied notifications");
            }
        });
    }
}

// ✅ NEW FUNCTION: Show browser notification
function showBrowserNotification(title, message, options = {}) {
    console.log("📢 Attempting to show browser notification:", title);

    // Check if notifications are supported
    if (!("Notification" in window)) {
        console.log("❌ Browser doesn't support notifications");
        // Fallback to in-app notification
        showNotification(message, 'info');
        return;
    }

    // Check if user gave permission
    if (Notification.permission === "granted") {
        console.log("✅ Permission granted, showing notification");

        // Create notification
        const notification = new Notification(title, {
            body: message,
            icon: options.icon || "https://via.placeholder.com/128?text=TW",
            badge: "https://via.placeholder.com/96?text=TW",
            tag: options.tag || "timeweaver",
            requireInteraction: false,  // Auto-dismiss after few seconds
            silent: false  // Make sound
        });

        // When user clicks notification
        notification.onclick = function(event) {
            event.preventDefault();
            console.log("👆 Notification clicked");
            window.focus();  // Bring window to front
            notification.close();

            // Custom action if provided
            if (options.onClick) {
                options.onClick();
            }
        };

        // Auto-close after 10 seconds
        setTimeout(() => {
            notification.close();
        }, 10000);

    } else if (Notification.permission === "denied") {
        console.log("❌ User denied notification permission");
        // Fallback to in-app notification
        showNotification(message, 'info');
    } else {
        console.log("⚠️ Permission not yet granted, asking now...");
        // Ask for permission first
        requestNotificationPermission();
        // Then show in-app notification as fallback
        showNotification(message, 'info');
    }
}

