// ==================== TIMETABLE MANAGEMENT (DYNAMIC VERSION) ====================
// Your responsibility: Display, View, Export, Delete timetables
// AI/ML team responsibility: Generate timetable logic

// Global variables
let timetableData = [];
let filteredTimetables = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeTimetablePage();
    setupEventListeners();
    loadTimetables(); // ← Fetch from backend
});

function initializeTimetablePage() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
}

function setupEventListeners() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            const modalId = e.target.id;
            if (modalId) closeModal(modalId);
        }
    });
}

// ==================== LOAD TIMETABLES FROM BACKEND ====================

async function loadTimetables() {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Please login first', 'error');
        window.location.href = '/admin';
        return;
    }

    try {
        showLoading();

        const response = await fetch('http://127.0.0.1:8000/admin/timetables', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load timetables');
        }

        timetableData = await response.json();
        filteredTimetables = [...timetableData];

        console.log('✅ Loaded timetables:', timetableData);

        hideLoading();
        renderTimetables();

    } catch (error) {
        console.error('Error loading timetables:', error);
        hideLoading();
        showEmptyState();
        showNotification('Failed to load timetables', 'error');
    }
}

function renderTimetables() {
    const grid = document.getElementById('timetablesGrid');

    if (filteredTimetables.length === 0) {
        showEmptyState();
        return;
    }

    hideEmptyState();

    // Clear existing cards (except loading/empty states)
    const existingCards = grid.querySelectorAll('.timetable-card');
    existingCards.forEach(card => card.remove());

    // Render each timetable
    filteredTimetables.forEach(timetable => {
        const card = createTimetableCard(timetable);
        grid.appendChild(card);
    });
}
// Read about this function--------------
function createTimetableCard(timetable) {
    const card = document.createElement('div');
    card.className = 'timetable-card';
    card.dataset.department = timetable.department;
    card.dataset.semester = timetable.semester;
    card.dataset.status = timetable.status;
    card.dataset.timetableId = timetable.id;

    card.innerHTML = `
        <div class="card-header">
            <h3>${timetable.name}</h3>
            <div class="status-badge ${timetable.status}">${timetable.status.charAt(0).toUpperCase() + timetable.status.slice(1)}</div>
        </div>
        <div class="card-content">
            <div class="timetable-info">
                <div class="info-item">
                    <i class="fas fa-users"></i>
                    <span>${timetable.classes} Classes</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-chalkboard-teacher"></i>
                    <span>${timetable.teachers} Teachers</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-door-open"></i>
                    <span>${timetable.rooms} Rooms</span>
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
            <button class="btn-icon" onclick="exportTimetable('${timetable.id}')" title="Export">
                <i class="fas fa-download"></i>
            </button>
            <button class="btn-icon danger" onclick="deleteTimetable('${timetable.id}')" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    return card;
}

// ==================== FILTER FUNCTIONS ====================

function filterTimetables() {
    const departmentFilter = document.getElementById('departmentFilter').value;
    const semesterFilter = document.getElementById('semesterFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    filteredTimetables = timetableData.filter(timetable => {
        return (!departmentFilter || timetable.department === departmentFilter) &&
               (!semesterFilter || timetable.semester === semesterFilter) &&
               (!statusFilter || timetable.status === statusFilter);
    });

    renderTimetables();
}

function clearFilters() {
    document.getElementById('departmentFilter').value = '';
    document.getElementById('semesterFilter').value = '';
    document.getElementById('statusFilter').value = '';
    filteredTimetables = [...timetableData];
    renderTimetables();
    showNotification('Filters cleared', 'info');
}

// ==================== VIEW TIMETABLE ====================

async function viewTimetable(timetableId) {
    const token = localStorage.getItem('token');

    try {
        showNotification('Loading timetable...', 'info');

        const response = await fetch(`http://127.0.0.1:8000/admin/timetable/${timetableId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to load timetable details');
        }

        const timetable = await response.json();

        document.getElementById('timetableViewTitle').textContent = `${timetable.department} - ${timetable.semester}`;
        generateTimetableView(timetable);
        openModal('timetableViewModal');

    } catch (error) {
        console.error('Error loading timetable:', error);
        showNotification('Failed to load timetable', 'error');
    }
}

function generateTimetableView(timetable) {
    const tbody = document.getElementById('timetableTableBody');
    tbody.innerHTML = '';

    const timeSlots = [
        '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
        '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
    ];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    timeSlots.forEach(timeSlot => {
        const row = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.innerHTML = `<div class="time-slot">${timeSlot}</div>`;
        row.appendChild(timeCell);

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

// ==================== EXPORT TIMETABLE ====================

function exportTimetable(timetableId) {
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;">
            <div style="background:white;padding:30px;border-radius:10px;width:300px;">
                <h3 style="margin-top:0;color:#4F46E5;">Export Timetable</h3>
                <p style="color:#666;margin-bottom:20px;font-size:14px;">Choose format:</p>
                <button onclick="doExport('csv', '${timetableId}')" style="width:100%;padding:12px;margin:8px 0;background:#10B981;color:white;border:none;border-radius:5px;cursor:pointer;font-size:14px;">📄 CSV File</button>
                <button onclick="doExport('excel', '${timetableId}')" style="width:100%;padding:12px;margin:8px 0;background:#059669;color:white;border:none;border-radius:5px;cursor:pointer;font-size:14px;">📊 Excel File</button>
                <button onclick="doExport('pdf', '${timetableId}')" style="width:100%;padding:12px;margin:8px 0;background:#DC2626;color:white;border:none;border-radius:5px;cursor:pointer;font-size:14px;">📕 PDF File</button>
                <button onclick="closeExportModal()" style="width:100%;padding:12px;margin:15px 0 0 0;background:#6B7280;color:white;border:none;border-radius:5px;cursor:pointer;font-size:14px;">Cancel</button>
            </div>
        </div>
    `;
    modal.id = 'exportModal';
    document.body.appendChild(modal);
}

function closeExportModal() {
    const modal = document.getElementById('exportModal');
    if (modal) modal.remove();
}

function doExport(format, timetableId) {
    closeExportModal();
    showNotification(`Preparing ${format.toUpperCase()} export...`, 'info');

    const token = localStorage.getItem('token');

    fetch(`http://127.0.0.1:8000/admin/export_timetable/${format}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error('Export failed');
        return res.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `timetable-${timetableId}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        showNotification(`✅ Timetable exported as ${format.toUpperCase()}!`, 'success');
    })
    .catch(err => {
        console.error('Export error:', err);
        showNotification('❌ Export failed. Please try again.', 'error');
    });
}

// ==================== DELETE TIMETABLE ====================

async function deleteTimetable(timetableId) {
    if (!confirm('⚠️ Are you sure you want to delete this timetable?\n\nThis action cannot be undone.')) {
        return;
    }

    const token = localStorage.getItem('token');

    try {
        showNotification('Deleting timetable...', 'info');

        const response = await fetch(`http://127.0.0.1:8000/admin/timetable/${timetableId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to delete timetable');
        }

        // Remove from local data
        timetableData = timetableData.filter(t => t.id !== timetableId);
        filteredTimetables = filteredTimetables.filter(t => t.id !== timetableId);

        // Re-render
        renderTimetables();

        showNotification('✅ Timetable deleted successfully!', 'success');

    } catch (error) {
        console.error('Delete error:', error);
        showNotification('❌ Failed to delete timetable', 'error');
    }
}


// ==================== PRINT PREVIEW ====================

function printPreview() {
    const printContent = document.querySelector('.timetable-view').innerHTML;
    const title = document.getElementById('timetableViewTitle').textContent;
    const previewWindow = window.open('', 'Print Preview', 'height=700,width=900');

    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Preview - ${title}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: #f5f5f5;
                }
                .preview-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }
                .preview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #4F46E5;
                }
                h1 {
                    color: #4F46E5;
                    margin: 0;
                    font-size: 24px;
                }
                .preview-info {
                    color: #666;
                    font-size: 14px;
                    text-align: right;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: center;
                }
                th {
                    background-color: #4F46E5;
                    color: white;
                    font-weight: bold;
                }
                .time-slot {
                    background: #667eea;
                    color: white;
                    padding: 8px;
                    border-radius: 4px;
                    font-weight: bold;
                }
                .subject-slot {
                    background: #f7fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 4px;
                    padding: 10px;
                    min-height: 60px;
                }
                .subject-name {
                    font-weight: bold;
                    color: #2d3748;
                    margin-bottom: 4px;
                    font-size: 14px;
                }
                .subject-teacher {
                    color: #718096;
                    font-size: 12px;
                    margin-bottom: 2px;
                }
                .subject-room {
                    color: #667eea;
                    font-size: 12px;
                    font-weight: 500;
                }
                .break {
                    background: #fff3cd;
                    color: #856404;
                    font-weight: bold;
                }
                .empty {
                    background: #f8f9fa;
                    color: #adb5bd;
                }
                .action-buttons {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    display: flex;
                    gap: 10px;
                    z-index: 1000;
                }
                .action-buttons button {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    font-weight: 600;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }
                .btn-print {
                    background: #4F46E5;
                    color: white;
                }
                .btn-print:hover {
                    background: #4338CA;
                }
                .btn-close {
                    background: #6B7280;
                    color: white;
                }
                .btn-close:hover {
                    background: #4B5563;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    color: #666;
                    font-size: 12px;
                    text-align: center;
                }
                @media print {
                    body {
                        background: white;
                        padding: 0;
                    }
                    .preview-container {
                        box-shadow: none;
                        padding: 20px;
                    }
                    .action-buttons {
                        display: none !important;
                    }
                    @page {
                        margin: 1cm;
                    }
                }
            </style>
        </head>
        <body>
            <div class="action-buttons">
                <button class="btn-print" onclick="window.print()">
                    🖨️ Print Now
                </button>
                <button class="btn-close" onclick="window.close()">
                    ✕ Close
                </button>
            </div>

            <div class="preview-container">
                <div class="preview-header">
                    <h1>${title}</h1>
                    <div class="preview-info">
                        <strong>Generated:</strong> ${new Date().toLocaleString()}<br>
                        <strong>By:</strong> ${localStorage.getItem('username') || 'Admin'}
                    </div>
                </div>
                ${printContent}
                <div class="footer">
                    TimeWeaver - Intelligent Timetable Management System
                </div>
            </div>
        </body>
        </html>
    `);

    previewWindow.document.close();
}

// ==================== DIRECT PRINT ====================

function printTimetable() {
    const printContent = document.querySelector('.timetable-view').innerHTML;
    const title = document.getElementById('timetableViewTitle').textContent;
    const printWindow = window.open('', '', 'height=600,width=800');

    printWindow.document.write(`
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #4F46E5; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: center; }
                th { background-color: #4F46E5; color: white; font-weight: bold; }
                .time-slot { background: #667eea; color: white; padding: 8px; border-radius: 4px; font-weight: bold; }
                .subject-slot { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px; }
                .subject-name { font-weight: bold; color: #2d3748; margin-bottom: 4px; }
                .subject-teacher { color: #718096; font-size: 0.9em; }
                .subject-room { color: #667eea; font-size: 0.9em; }
                .break { background: #fff3cd; color: #856404; }
                .empty { background: #f8f9fa; color: #6c757d; }
                @media print {
                    body { margin: 0; }
                    @page { margin: 1cm; }
                }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            ${printContent}
        </body>
        </html>
    `);

    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
}

// ==================== BUTTONS NOT YOUR RESPONSIBILITY ====================
// These will be implemented by AI/ML team

function openCreateTimetableModal() {
      openModal('createTimetableModal');

    //showNotification('⏳ Timetable generation will be implemented by AI/ML team', 'info');
    // openModal('createTimetableModal'); // Uncomment when AI/ML team provides logic
}

// new function added by me-------------
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

// new function added from UI timetable.js----------
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

function generateAutoTimetable() {
    showNotification('⏳ Auto-generation will be implemented by AI/ML team', 'info');
}

function editTimetable(timetableId) {
    showNotification('⏳ Edit feature will be implemented by AI/ML team', 'info');
}

function duplicateTimetable(timetableId) {
    showNotification('⏳ Duplicate feature will be implemented by AI/ML team', 'info');
}

// ==================== UTILITY FUNCTIONS ====================

function showLoading() {
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('emptyState').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loadingState').style.display = 'none';
}

function showEmptyState() {
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('loadingState').style.display = 'none';
}

function hideEmptyState() {
    document.getElementById('emptyState').style.display = 'none';
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
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

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

console.log('✅ Timetable display system loaded!');
console.log('📋 Your features: View, Export, Delete');
console.log('⏳ AI/ML team features: Generate, Edit, Duplicate');