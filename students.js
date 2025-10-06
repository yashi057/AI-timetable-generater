// Class Room Management JavaScript

let roomsData = window.dataManager.getRooms() || [];
let filteredRooms = [...roomsData];

// Subscribe to data changes
window.dataManager.subscribe('roomAdded', (room) => {
    roomsData = window.dataManager.getRooms();
    filteredRooms = [...roomsData];
    renderRoomsTable();
    updateStatistics();
});

window.dataManager.subscribe('roomUpdated', (room) => {
    roomsData = window.dataManager.getRooms();
    filteredRooms = [...roomsData];
    renderRoomsTable();
});

window.dataManager.subscribe('roomDeleted', (room) => {
    roomsData = window.dataManager.getRooms();
    filteredRooms = [...roomsData];
    renderRoomsTable();
    updateStatistics();
});

// Sample room data (if needed)
if (roomsData.length === 0) {
    roomsData = [
        {
            roomNo: 'CS202001',
            capacity: 50,
            type: 'lecture-hall',
            block: '',
            floor: '2',
            // Other fields for table if needed, with defaults
            timeSlot: '', 
            name: 'John Smith',
            class: 'john.smith@university.edu',
            department: 'computer-science',
            year: 2,
            status: 'active'
        }
        // Add more if needed
    ];
    filteredRooms = [...roomsData];
}

let currentPage = 1;
const itemsPerPage = 10;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    renderRoomsTable();
    updateStatistics();
});

function initializePage() {
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
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });

    // Room type change for conditional lab type
    document.getElementById('roomType').addEventListener('change', function() {
        const labContainer = document.getElementById('labTypeContainer');
        const labSelect = document.getElementById('labType');
        if (this.value === 'lab') {
            labContainer.style.display = 'block';
            labSelect.required = true;
        } else {
            labContainer.style.display = 'none';
            labSelect.required = false;
            labSelect.value = '';
        }
    });
}

// Search and filter functions (adapted)
function searchRooms() {
    const searchTerm = document.getElementById('roomSearch').value.toLowerCase();
    
    filteredRooms = roomsData.filter(room => {
        return room.roomNo.toLowerCase().includes(searchTerm) ||
               (room.name && room.name.toLowerCase().includes(searchTerm));
    });

    applyFilters();
    renderRoomsTable();
}

function filterRooms() {
    applyFilters();
    renderRoomsTable();
}

function applyFilters() {
    const departmentFilter = document.getElementById('departmentFilter').value;
    const yearFilter = document.getElementById('yearFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    filteredRooms = filteredRooms.filter(room => {
        return (!departmentFilter || room.department === departmentFilter) &&
               (!yearFilter || room.year.toString() === yearFilter) &&
               (!statusFilter || room.status === statusFilter);
    });
}

// Table rendering (adapted)
function renderRoomsTable() {
    const tbody = document.getElementById('roomsTableBody');
    tbody.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const roomsToShow = filteredRooms.slice(startIndex, endIndex);

    roomsToShow.forEach(room => {
        const row = document.createElement('tr');
        row.dataset.roomId = room.roomNo;

        row.innerHTML = `
            <td><input type="checkbox" class="room-checkbox" value="${room.roomNo}"></td>
            <td><strong>${room.roomNo}</strong></td>
            <td>${room.timeSlot || ''}</td>
            <td>${room.name || ''}</td>
            <td>${room.class || ''}</td>
            <td>${room.capacity}</td>
            <td>${getDepartmentName(room.department || '')}</td>
            <td>${getYearName(room.year || '')}</td>
            <td><span class="status-badge ${room.status || ''}">${room.status || ''}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewRoom('${room.roomNo}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editRoom('${room.roomNo}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon danger" onclick="deleteRoom('${room.roomNo}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Helper functions (adapted)
function getDepartmentName(code) {
    const departments = {
        'computer-science': 'Computer Science',
        'mathematics': 'Mathematics',
        'physics': 'Physics',
        'chemistry': 'Chemistry'
    };
    return departments[code] || code;
}

function getYearName(year) {
    const years = {
        1: '1st Year',
        2: '2nd Year',
        3: '3rd Year',
        4: '4th Year'
    };
    return years[year] || year;
}

// Add Room
function openAddRoomModal() {
    document.getElementById('addRoomForm').reset();
    document.getElementById('labTypeContainer').style.display = 'none';
    document.getElementById('labType').required = false;
    openModal('addRoomModal');
}

function addRoom() {
    const form = document.getElementById('addRoomForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    
    // Check if room no exists
    const existingRoom = roomsData.find(r => r.roomNo === formData.get('roomNo'));
    if (existingRoom) {
        showNotification('Room No already exists', 'error');
        return;
    }

    const newRoom = {
        roomNo: formData.get('roomNo'),
        capacity: parseInt(formData.get('roomCapacity')),
        type: formData.get('roomType'),
        labType: formData.get('roomType') === 'lab' ? formData.get('labType') : null,
        block: formData.get('block') || '',
        floor: formData.get('floor') || '',
        // Defaults for other table fields if needed
        timeSlot: '',
        name: '',
        class: '',
        department: '',
        year: '',
        status: 'active'
    };

    showNotification('Adding class room...', 'info');

    setTimeout(() => {
        window.dataManager.addRoom(newRoom); // Assume dataManager has addRoom
        closeModal('addRoomModal');
        showNotification('Class room added successfully!', 'success');
    }, 1500);
}

// Other functions adapted similarly (viewRoom, editRoom, deleteRoom, etc.)
function viewRoom(roomNo) {
    const room = roomsData.find(r => r.roomNo === roomNo);
    if (!room) return;

    // Load details into modal (adapt as needed)
    showNotification(`Viewing ${room.roomNo}`, 'info');
}

function editRoom(roomNo) {
    const room = roomsData.find(r => r.roomNo === roomNo);
    if (!room) return;

    // Populate form
    document.getElementById('roomNo').value = room.roomNo;
    document.getElementById('roomCapacity').value = room.capacity;
    document.getElementById('roomType').value = room.type;
    document.getElementById('block').value = room.block;
    document.getElementById('floor').value = room.floor;

    if (room.type === 'lab') {
        document.getElementById('labTypeContainer').style.display = 'block';
        document.getElementById('labType').value = room.labType;
        document.getElementById('labType').required = true;
    } else {
        document.getElementById('labTypeContainer').style.display = 'none';
        document.getElementById('labType').required = false;
    }

    // Change button to update
    const addButton = document.querySelector('#addRoomModal .btn.primary');
    addButton.textContent = 'Update Class Room';
    addButton.onclick = () => updateRoom(roomNo);

    openModal('addRoomModal');
}

function updateRoom(roomNo) {
    const form = document.getElementById('addRoomForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    const roomIndex = roomsData.findIndex(r => r.roomNo === roomNo);

    if (roomIndex === -1) return;

    roomsData[roomIndex] = {
        ...roomsData[roomIndex],
        capacity: parseInt(formData.get('roomCapacity')),
        type: formData.get('roomType'),
        labType: formData.get('roomType') === 'lab' ? formData.get('labType') : null,
        block: formData.get('block') || '',
        floor: formData.get('floor') || ''
    };

    showNotification('Updating class room...', 'info');

    setTimeout(() => {
        window.dataManager.updateRoom(roomsData[roomIndex]);
        closeModal('addRoomModal');
        // Reset button
        document.querySelector('#addRoomModal .btn.primary').textContent = 'Add Class Room';
        document.querySelector('#addRoomModal .btn.primary').onclick = addRoom;
        showNotification('Class room updated successfully!', 'success');
    }, 1500);
}

function deleteRoom(roomNo) {
    // Implement delete
    showNotification('Deleting class room...', 'info');
    setTimeout(() => {
        window.dataManager.deleteRoom(roomNo);
        showNotification('Class room deleted!', 'success');
    }, 1500);
}

// Import/Export adapted
function importRooms() {
    // Adapt from importStudents
}

function exportRooms() {
    // Adapt
}

// Statistics adapted
function updateStatistics() {
    // Calculate based on roomsData
    const totalRooms = roomsData.length;
    const bookedRooms = roomsData.filter(r => r.status === 'booked').length; // Assume status
    const availableRooms = totalRooms - bookedRooms;
    const departments = new Set(roomsData.map(r => r.department)).size;

    const statElements = document.querySelectorAll('.stat-card h3');
    if (statElements.length >= 4) {
        statElements[0].textContent = totalRooms.toLocaleString();
        statElements[1].textContent = bookedRooms.toLocaleString();
        statElements[2].textContent = availableRooms;
        statElements[3].textContent = departments;
    }
}

// Pagination adapted
// Add previousPage, nextPage, updatePagination functions if needed

// Notification system (keep same)

// Export API adapted
window.roomsAPI = {
    // Adapted functions
};

console.log('Class Room management system loaded successfully!');