// courses management page
    let coursesData = [];
    let filteredCourses = [];
    let currentPage = 1;
    const coursesPerPage = 10;

    // Load courses from database
    async function loadCoursesFromDatabase() {
        const authToken = localStorage.getItem('token');
        if (!authToken) {
            showNotification('Please log in first', 'error');
            window.location.href = '/admin';
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/admin/courses', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!response.ok) throw new Error('Failed to fetch courses');

            coursesData = await response.json();
            filteredCourses = [...coursesData];

            renderCoursesTable();
            updateStatistics();
            updatePagination();

            showNotification('Courses loaded successfully', 'success');
        } catch (err) {
            console.error('Error loading courses:', err);
            showNotification('Error loading courses: ' + err.message, 'error');
        }
    }

    // Initialize page
    document.addEventListener('DOMContentLoaded', async function() {
        initializeCoursesPage();
        await loadCoursesFromDatabase();
    });

    function initializeCoursesPage() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.querySelector('.sidebar');

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('active');
            });
        }

        setupEventListeners();
    }

    function setupEventListeners() {
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                closeModal(e.target.id);
            }
        });
    }

    // Search and filter
    function searchCourses() {
        const searchTerm = document.getElementById('courseSearch').value.toLowerCase();

        filteredCourses = coursesData.filter(course => {
            return (course.code && course.code.toLowerCase().includes(searchTerm)) ||
                   (course.name && course.name.toLowerCase().includes(searchTerm)) ||
                   (course.instructor && course.instructor.toLowerCase().includes(searchTerm));
        });

        applyFilters();
        renderCoursesTable();
        updatePagination();
    }

    function filterCourses() {
        filteredCourses = [...coursesData];
        applyFilters();
        renderCoursesTable();
        updatePagination();
    }

    function applyFilters() {
        const departmentFilter = document.getElementById('departmentFilter').value;
        const levelFilter = document.getElementById('levelFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;

        filteredCourses = filteredCourses.filter(course => {
            return (!departmentFilter || course.department === departmentFilter) &&
                   (!levelFilter || course.level && course.level.toString() === levelFilter) &&
                   (!statusFilter || course.status === statusFilter);
        });
    }

    // Table rendering
    function renderCoursesTable() {
        const tbody = document.getElementById('coursesTableBody');
        tbody.innerHTML = '';

        const startIndex = (currentPage - 1) * coursesPerPage;
        const endIndex = startIndex + coursesPerPage;
        const coursesToShow = filteredCourses.slice(startIndex, endIndex);

        coursesToShow.forEach(course => {
            const row = document.createElement('tr');
            row.dataset.courseId = course.code || course.id;

            const enrollmentPercentage = course.maxEnrollment ?
                Math.round((course.currentEnrollment / course.maxEnrollment) * 100) : 0;

            row.innerHTML = `
                <td><input type="checkbox" class="course-checkbox" value="${course.code || course.id}"></td>
                <td><strong class="course-code">${course.code || 'N/A'}</strong></td>
                <td>${course.name || 'N/A'}</td>
                <td>${course.department || 'N/A'}</td>
                <td>${course.credits || 'N/A'}</td>
                <td>${course.instructor || 'TBD'}</td>
                <td>
                    <div class="enrollment-info">
                        <span>${course.currentEnrollment || 0}/${course.maxEnrollment || 0}</span>
                        <div class="enrollment-bar">
                            <div class="enrollment-progress" style="width: ${enrollmentPercentage}%"></div>
                        </div>
                    </div>
                </td>
                <td><span class="status-badge ${course.status || 'active'}">${(course.status || 'active').charAt(0).toUpperCase() + (course.status || 'active').slice(1)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="viewCourse('${course.code || course.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="editCourse('${course.code || course.id}')" title="Edit Course">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon danger" onclick="deleteCourse('${course.code || course.id}')" title="Delete Course">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            tbody.appendChild(row);
        });

        updateSelectAllCheckbox();
    }

    // Pagination
    function updatePagination() {
        const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
        const startIndex = (currentPage - 1) * coursesPerPage + 1;
        const endIndex = Math.min(currentPage * coursesPerPage, filteredCourses.length);

        document.getElementById('paginationInfo').textContent =
            `Showing ${startIndex}-${endIndex} of ${filteredCourses.length} courses`;

        const pageNumbers = document.getElementById('pageNumbers');
        pageNumbers.innerHTML = '';

        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            const button = document.createElement('button');
            button.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            button.textContent = i;
            button.onclick = () => { currentPage = i; renderCoursesTable(); updatePagination(); };
            pageNumbers.appendChild(button);
        }

        document.getElementById('prevBtn').disabled = currentPage === 1;
        document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
    }

    function changePage(direction) {
        const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
        currentPage = Math.max(1, Math.min(currentPage + direction, totalPages));
        renderCoursesTable();
        updatePagination();
    }

    // Select all
    function toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const courseCheckboxes = document.querySelectorAll('.course-checkbox');

        courseCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    }

    function updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const courseCheckboxes = document.querySelectorAll('.course-checkbox');
        const checkedBoxes = document.querySelectorAll('.course-checkbox:checked');

        if (selectAllCheckbox) {
            selectAllCheckbox.checked = courseCheckboxes.length > 0 && checkedBoxes.length === courseCheckboxes.length;
            selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < courseCheckboxes.length;
        }
    }

    // Course actions
    function viewCourse(courseId) {
        const course = coursesData.find(c => (c.code || c.id) === courseId);
        if (!course) {
            showNotification('Course not found', 'error');
            return;
        }

        showNotification(`Viewing course: ${course.code}`, 'info');
    }

    function editCourse(courseId) {
        const course = coursesData.find(c => (c.code || c.id) === courseId);
        if (!course) {
            showNotification('Course not found', 'error');
            return;
        }

        showNotification(`Editing course: ${course.code}`, 'info');
    }

    async function deleteCourse(courseId) {
        if (!confirm('Are you sure you want to delete this course?')) {
            return;
        }

        showNotification('Deleting course...', 'info');

        setTimeout(() => {
            const index = coursesData.findIndex(c => (c.code || c.id) === courseId);
            if (index !== -1) {
                coursesData.splice(index, 1);
                filteredCourses = filteredCourses.filter(c => (c.code || c.id) !== courseId);
            }

            renderCoursesTable();
            updatePagination();
            updateStatistics();
            showNotification('Course deleted successfully!', 'success');
        }, 1500);
    }

    function openAddCourseModal() {
        showNotification('Add course form coming soon', 'info');
    }

    // Import/Export
    async function importCourses() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv,.xlsx,.xls';

        fileInput.onchange = async function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const authToken = localStorage.getItem('token');
            if (!authToken) {
                alert('Please log in first');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            showNotification('Uploading courses...', 'info');

            try {
                const response = await fetch('http://127.0.0.1:8000/admin/upload_courses', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${authToken}` },
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    showNotification(`Success! Added: ${result.added}, Updated: ${result.updated}`, 'success');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    const error = await response.json();
                    showNotification('Error: ' + error.detail, 'error');
                }
            } catch (err) {
                showNotification('Upload failed: ' + err.message, 'error');
            }
        };

        fileInput.click();
    }

    function exportCourses() {
        showNotification('Exporting courses...', 'info');

        const csvContent = 'Course code,course Name,Department,Credits,Instructor,Enrolled,Schedule,Status\n' +
            coursesData.map(c =>
                `${c.code || ''},${c.name || ''},${c.department || ''},${c.credits || ''},${c.instructor || ''},${c.currentEnrollment || 0}/${c.maxEnrollment || 0},,${c.status || ''}`
            ).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `courses-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        showNotification('Courses exported successfully!', 'success');
    }

    // Statistics
    function updateStatistics() {
        const totalCourses = coursesData.length;
        const activeCourses = coursesData.filter(c => c.status === 'active').length;
        const totalEnrollments = coursesData.reduce((sum, c) => sum + (c.currentEnrollment || 0), 0);
        const departments = new Set(coursesData.map(c => c.department).filter(d => d)).size;

        document.getElementById('totalCourses').textContent = totalCourses;
        document.getElementById('activeCourses').textContent = activeCourses;
        document.getElementById('totalEnrollments').textContent = totalEnrollments;
        document.getElementById('totalDepartments').textContent = departments;
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
        }
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; background: white;
            border-left: 4px solid ${type === 'success' ? '#38a169' : type === 'error' ? '#e53e3e' : '#667eea'};
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            border-radius: 8px; padding: 1rem; z-index: 10000;
            display: flex; align-items: center; gap: 1rem; min-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    console.log('Course management system loaded successfully!');
   
