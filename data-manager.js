// Centralized Data Management System

class DataManager {
    constructor() {
        this.data = {
            students: [],
            teachers: [],
            courses: [],
            timetables: [],
            departments: [
                { id: 'computer-science', name: 'Computer Science' },
                { id: 'mathematics', name: 'Mathematics' },
                { id: 'physics', name: 'Physics' },
                { id: 'chemistry', name: 'Chemistry' }
            ]
        };
        
        this.loadData();
        this.subscribers = {};
    }

    loadData() {
        const savedData = localStorage.getItem('timetableSystemData');
        if (savedData) {
            try {
                this.data = { ...this.data, ...JSON.parse(savedData) };
            } catch (e) {
                console.log('Error loading saved data, using defaults');
                this.initializeSampleData();
            }
        } else {
            this.initializeSampleData();
        }
    }

    saveData() {
        try {
            localStorage.setItem('timetableSystemData', JSON.stringify(this.data));
            this.notifySubscribers('dataUpdated');
        } catch (e) {
            console.error('Error saving data:', e);
        }
    }

    initializeSampleData() {
        // Sample Teachers
        this.data.teachers = [
            {
                id: 'T001',
                firstName: 'Sarah',
                lastName: 'Johnson',
                title: 'professor',
                email: 'sarah.johnson@university.edu',
                phone: '+1 (555) 123-4567',
                department: 'computer-science',
                status: 'active',
                photo: 'https://via.placeholder.com/100',
                experience: 12,
                maxHours: 24,
                currentHours: 24,
                totalStudents: 180
            },
            {
                id: 'T002',
                firstName: 'Michael',
                lastName: 'Chen',
                title: 'associate-professor',
                email: 'michael.chen@university.edu',
                phone: '+1 (555) 234-5678',
                department: 'mathematics',
                status: 'active',
                photo: 'https://via.placeholder.com/100',
                experience: 8,
                maxHours: 20,
                currentHours: 20,
                totalStudents: 145
            }
        ];

        // Sample Students
        this.data.students = [
            {
                id: 'CS2024001',
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
                phone: '+1 (555) 123-4567',
                department: 'computer-science',
                year: 2,
                status: 'active',
                photo: 'https://via.placeholder.com/40',
                gpa: 3.75,
                credits: 45
            },
            {
                id: 'MATH2024002',
                firstName: 'Emily',
                lastName: 'Johnson',
                email: 'emily.johnson@university.edu',
                phone: '+1 (555) 234-5678',
                department: 'mathematics',
                year: 3,
                status: 'active',
                photo: 'https://via.placeholder.com/40',
                gpa: 3.92,
                credits: 78
            }
        ];

        // Sample Courses
        this.data.courses = [
            {
                id: 'CS101',
                code: 'CS101',
                name: 'Introduction to Programming',
                department: 'computer-science',
                credits: 3,
                level: 100,
                status: 'active',
                instructor: 'Dr. Sarah Johnson',
                instructorId: 'T001',
                maxEnrollment: 50,
                currentEnrollment: 45
            },
            {
                id: 'MATH201',
                code: 'MATH201',
                name: 'Calculus II',
                department: 'mathematics',
                credits: 4,
                level: 200,
                status: 'active',
                instructor: 'Prof. Michael Chen',
                instructorId: 'T002',
                maxEnrollment: 40,
                currentEnrollment: 38
            }
        ];

        // Sample Timetables
        this.data.timetables = [
            {
                id: 'cs-fall-2024',
                name: 'Computer Science - Fall 2024',
                department: 'computer-science',
                semester: 'fall-2024',
                status: 'active',
                classes: 24,
                teachers: 8,
                rooms: 6,
                created: '2024-09-15'
            }
        ];

        this.saveData();
    }

    // Subscription system
    subscribe(event, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        this.subscribers[event].push(callback);
    }

    notifySubscribers(event, data = null) {
        if (this.subscribers[event]) {
            this.subscribers[event].forEach(callback => callback(data));
        }
    }

    // Get data methods
    getStudents() {
        return this.data.students || [];
    }

    getTeachers() {
        return this.data.teachers || [];
    }

    getCourses() {
        return this.data.courses || [];
    }

    getTimetables() {
        return this.data.timetables || [];
    }

    getDepartments() {
        return this.data.departments || [];
    }

    getStatistics() {
        return {
            totalStudents: this.data.students?.length || 0,
            activeStudents: this.data.students?.filter(s => s.status === 'active').length || 0,
            totalTeachers: this.data.teachers?.length || 0,
            activeTeachers: this.data.teachers?.filter(t => t.status === 'active').length || 0,
            totalCourses: this.data.courses?.length || 0,
            activeCourses: this.data.courses?.filter(c => c.status === 'active').length || 0,
            totalTimetables: this.data.timetables?.length || 0,
            totalDepartments: this.data.departments?.length || 0
        };
    }

    // Add methods
    addStudent(student) {
        student.id = student.id || this.generateId('STU');
        this.data.students.push(student);
        this.saveData();
        this.notifySubscribers('studentAdded', student);
        return student;
    }

    addTeacher(teacher) {
        teacher.id = teacher.id || this.generateId('T');
        this.data.teachers.push(teacher);
        this.saveData();
        this.notifySubscribers('teacherAdded', teacher);
        return teacher;
    }

    addCourse(course) {
        course.id = course.id || course.code;
        this.data.courses.push(course);
        this.saveData();
        this.notifySubscribers('courseAdded', course);
        return course;
    }

    generateId(prefix) {
        return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.dataManager = new DataManager();
    console.log('Data Manager initialized successfully!');
}