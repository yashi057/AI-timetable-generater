// ==================== API SERVICE - YOUR SINGLE SOURCE OF TRUTH ====================

class APIService {
    constructor() {
        this.baseURL = 'http://127.0.0.1:8000';
    }

    // Get JWT token
    getToken() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('⚠️ No auth token found');
            window.location.href = '/admin';
        }
        return token;
    }

    // Get auth headers
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
        };
    }

    // Generic fetch function (DRY principle - Don't Repeat Yourself)
    async fetch(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`❌ API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    // ==================== STUDENTS ====================
    async getStudents() {
        return this.fetch('/admin/approved_students');
    }

    async addStudent(studentData) {
        return this.fetch('/admin/students', {
            method: 'POST',
            body: JSON.stringify(studentData)
        });
    }

    async updateStudent(studentId, studentData) {
        return this.fetch(`/admin/students/${studentId}`, {
            method: 'PUT',
            body: JSON.stringify(studentData)
        });
    }

    async deleteStudent(studentId) {
        return this.fetch(`/admin/students/${studentId}`, {
            method: 'DELETE'
        });
    }

    // ==================== TEACHERS ====================
    async getTeachers() {
        return this.fetch('/admin/approved_teachers');
    }

    async addTeacher(teacherData) {
        return this.fetch('/admin/teachers', {
            method: 'POST',
            body: JSON.stringify(teacherData)
        });
    }

    // ==================== COURSES (ALREADY DYNAMIC IN YOUR BACKEND) ====================
    async getCourses() {
        return this.fetch('/admin/courses');
    }

    async addCourse(courseData) {
        return this.fetch('/admin/courses', {
            method: 'POST',
            body: JSON.stringify(courseData)
        });
    }

    async updateCourse(courseId, courseData) {
        return this.fetch(`/admin/courses/${courseId}`, {
            method: 'PUT',
            body: JSON.stringify(courseData)
        });
    }

    async deleteCourse(courseId) {
        return this.fetch(`/admin/courses/${courseId}`, {
            method: 'DELETE'
        });
    }

    // ==================== TIMETABLES ====================
    async getTimetables() {
        return this.fetch('/admin/timetables');
    }

    async getTimetable(timetableId) {
        return this.fetch(`/admin/timetable/${timetableId}`);
    }

    async deleteTimetable(timetableId) {
        return this.fetch(`/admin/timetable/${timetableId}`, {
            method: 'DELETE'
        });
    }

    async exportTimetable(format) {
        const token = this.getToken();
        const response = await fetch(`${this.baseURL}/admin/export_timetable/${format}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Export failed');
        }

        return response.blob();
    }

    // ==================== STATISTICS ====================
    async getStatistics() {
        return this.fetch('/admin/stats');
    }

    async getTimetableHistory() {
        return this.fetch('/admin/timetable_history');
    }

    async getActivityFeed() {
        return this.fetch('/admin/activity_feed');
    }

    async getAdminProfile() {
        return this.fetch('/admin/me');
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.apiService = new APIService();
    console.log('✅ API Service initialized');
}