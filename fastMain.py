from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, status
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from bson import ObjectId
from fastapi.security import OAuth2PasswordBearer
import jwt
from datetime import datetime, timedelta
import csv
from io import StringIO
import random
import uuid

app = FastAPI()

# MongoDB connection details
MONGO_URI = "mongodb://localhost:27017/"
STUDENT_DB_NAME = "student_data"
FACULTY_DB_NAME = "faculty_data"
ADMIN_DB_NAME = "admin_data"
USERS_COLLECTION = "users"
SUBJECTS_COLLECTION = "subjects"
TIMETABLES_COLLECTION = "timetables"

# JWT configuration
SECRET_KEY = "590bc282bf3b3f10970bf970d912f96b1c9b7a35b023877a8daeae52c26f32f0"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class UserSignup(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class StatusUpdate(BaseModel):
    status: str
    statusNote: str

class Subject(BaseModel):
    code: str
    name: str
    credits: int
    students: int
    department: str
    color: str | None = "subject-default"

class TimetableSlot(BaseModel):
    subject_id: str
    day: str
    time: str
    room: str
    instructor_id: str
    instructor: str
    class_name: str
    students: int
    type: str
    date: str

class TimetableGenerate(BaseModel):
    semester: str
    department: str
    timeSlots: int

class ClassAction(BaseModel):
    subject_id: str
    day: str
    time: str
    new_day: str | None = None
    new_time: str | None = None

# MongoDB connection
@app.on_event("startup")
async def startup_db_client():
    try:
        app.mongodb_client = AsyncIOMotorClient(MONGO_URI)
        app.student_db = app.mongodb_client[STUDENT_DB_NAME]
        app.faculty_db = app.mongodb_client[FACULTY_DB_NAME]
        app.admin_db = app.mongodb_client[ADMIN_DB_NAME]
        await app.student_db.command("ping")
        await app.faculty_db.command("ping")
        await app.admin_db.command("ping")
        print("MongoDB connections successful")
    except Exception as e:
        print(f"MongoDB connection failed: {str(e)}")
        raise Exception(f"MongoDB connection failed: {str(e)}")

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

# Authentication helper
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        username: str = payload.get("username")
        role: str = payload.get("role")
        if user_id is None or username is None or role is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return {"user_id": user_id, "username": username, "role": role}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
#Authentication helper
async def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)  # 7-day expiration
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Login routes
@app.get("/", response_class=HTMLResponse)
async def serve_student_login():
    try:
        with open("student_login.html", "r") as f:
            return f.read()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="student_login.html not found")

@app.get("/faculty", response_class=HTMLResponse)
async def serve_faculty_login():
    try:
        with open("faculty_login.html", "r") as f:
            return f.read()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="faculty_login.html not found")

@app.get("/admin", response_class=HTMLResponse)
async def serve_admin_login():
    try:
        with open("admin_login.html", "r") as f:
            return f.read()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="admin_login.html not found")

# Signup endpoints
@app.post("/student_signup")
async def student_signup(user: UserSignup):
    db = app.student_db
    existing_user = await db[USERS_COLLECTION].find_one({"$or": [{"email": user.email}, {"username": user.username}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email or username already registered")

    hashed_password = pwd_context.hash(user.password)
    user_data = {
        "username": user.username,
        "email": user.email,
        "password": hashed_password,
        "subjects": [],
        "role": "student",
        "class_name": "",
        "semester": ""
    }
    result = await db[USERS_COLLECTION].insert_one(user_data)
    return {"message": "Student registered successfully!", "id": str(result.inserted_id), "username": user.username}

@app.post("/faculty_signup")
async def faculty_signup(user: UserSignup):
    db = app.faculty_db
    existing_user = await db[USERS_COLLECTION].find_one({"$or": [{"email": user.email}, {"username": user.username}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email or username already registered")

    hashed_password = pwd_context.hash(user.password)
    user_data = {
        "username": user.username,
        "email": user.email,
        "password": hashed_password,
        "subjects": [],
        "currentStatus": "available",
        "statusNote": "",
        "role": "faculty",
        "photos": [],
        "teacher_id": str(uuid.uuid4()),
        "title": "",
        "department": ""
    }
    result = await db[USERS_COLLECTION].insert_one(user_data)
    return {"message": "Faculty registered successfully!", "id": str(result.inserted_id), "username": user.username}

@app.post("/admin_signup")
async def admin_signup(user: UserSignup):
    db = app.admin_db
    existing_user = await db[USERS_COLLECTION].find_one({"$or": [{"email": user.email}, {"username": user.username}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email or username already registered")

    hashed_password = pwd_context.hash(user.password)
    user_data = {
        "username": user.username,
        "email": user.email,
        "password": hashed_password,
        "role": "admin"
    }
    result = await db[USERS_COLLECTION].insert_one(user_data)
    return {"message": "Admin registered successfully!", "id": str(result.inserted_id), "username": user.username}

# Login endpoints
@app.post("/student_login")
async def student_login(user: UserLogin):
    db = app.student_db
    existing_user = await db[USERS_COLLECTION].find_one({"email": user.email})
    if not existing_user or not pwd_context.verify(user.password, existing_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_data = {
        "sub": str(existing_user["_id"]),
        "username": existing_user["username"],
        "role": "student",
        "exp": datetime.utcnow() + timedelta(minutes=60)
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    return {
        "message": "Student login successful!",
        "access_token": token,
        "token_type": "bearer",
        "user_id": str(existing_user["_id"]),
        "username": existing_user["username"]
    }

@app.post("/faculty_login")
async def faculty_login(user: UserLogin):
    db = app.faculty_db
    existing_user = await db[USERS_COLLECTION].find_one({"email": user.email})
    if not existing_user or not pwd_context.verify(user.password, existing_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_data = {
        "sub": str(existing_user["_id"]),
        "username": existing_user["username"],
        "role": "faculty",
        "exp": datetime.utcnow() + timedelta(minutes=60)
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    return {
        "message": "Faculty login successful!",
        "access_token": token,
        "token_type": "bearer",
        "user_id": str(existing_user["_id"]),
        "username": existing_user["username"]
    }

@app.post("/admin_login")
async def admin_login(user: UserLogin):
    db = app.admin_db
    existing_user = await db[USERS_COLLECTION].find_one({"email": user.email})
    if not existing_user or not pwd_context.verify(user.password, existing_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_data = {
        "sub": str(existing_user["_id"]),
        "username": existing_user["username"],
        "role": "admin",
        "exp": datetime.utcnow() + timedelta(minutes=30)
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    return {
        "message": "Admin login successful!",
        "access_token": token,
        "token_type": "bearer",
        "user_id": str(existing_user["_id"]),
        "username": existing_user["username"]
    }

# Dashboard routes
@app.get("/student_portal", response_class=HTMLResponse)
async def serve_student_portal(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        with open("New_student_dashboard.html", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="student-dashboard.html not found")

@app.get("/faculty_portal", response_class=HTMLResponse)
async def serve_faculty_portal(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        with open("faculty-dashboard.html", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="faculty-dashboard.html not found")

@app.get("/admin_portal", response_class=HTMLResponse)
async def serve_admin_portal(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        with open("dashboard.html", "r") as f:
            return f.read()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="dashboard.html not found")

# Student endpoints
@app.get("/student/me")
async def get_student_info(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Not authorized")
    user = await app.student_db[USERS_COLLECTION].find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "class": user.get("class_name", "N/A"),
        "semester": user.get("semester", "N/A"),
        "role": user.get("role", "student")
    }


@app.get("/student/subjects")
async def get_student_subjects(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Not authorized")

    user = await app.student_db[USERS_COLLECTION].find_one({"_id": ObjectId(current_user["user_id"])})
    subject_codes = user.get("subjects", [])  # These are codes like ["CS101", "MATH201"]

    subjects = []
    # Search by code, not _id
    async for subject in app.student_db[SUBJECTS_COLLECTION].find({"code": {"$in": subject_codes}}):
        subjects.append({
            "code": subject["code"],  # Use actual code field
            "name": subject["name"],
            "credits": subject.get("credits", 0),
            "color": subject.get("color", "subject-computer")
        })

    return subjects


@app.get("/student/timetable_history")
async def get_student_timetable_history(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Not authorized")

    user = await app.student_db[USERS_COLLECTION].find_one({"_id": ObjectId(current_user["user_id"])})
    subject_codes = user.get("subjects", [])

    timetables = []
    # Find all timetable entries for this student's subjects
    async for slot in app.student_db[TIMETABLES_COLLECTION].find({"subject_id": {"$in": subject_codes}}).sort("date",
                                                                                                              -1):
        timetables.append({
            "id": str(slot["_id"]),
            "subject": slot["subject_id"],  # ✅ Return the code
            "day": slot["day"],
            "time": slot["time"],
            "room": slot["room"],
            "instructor": slot["instructor"],
            "type": slot["type"]
        })

    return timetables

# Faculty endpoints
@app.get("/faculty/me")
async def get_faculty_info(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Not authorized")
    user = await app.faculty_db[USERS_COLLECTION].find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "department": user.get("department", "N/A"),
        "position": user.get("title", "N/A"),
        "currentStatus": user.get("currentStatus", "available"),
        "statusNote": user.get("statusNote", ""),
        "role": user.get("role", "faculty"),
        "photos": user.get("photos", []),
        "teacher_id": user.get("teacher_id", ""),
        "title": user.get("title", "")
    }

@app.get("/faculty/subjects")
async def get_faculty_subjects(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Not authorized")
    user = await app.faculty_db[USERS_COLLECTION].find_one({"_id": ObjectId(current_user["user_id"])})
    subject_ids = user.get("subjects", [])
    subjects = []
    async for subject in app.faculty_db[SUBJECTS_COLLECTION].find({"_id": {"$in": [ObjectId(sid) for sid in subject_ids]}}):
        subjects.append({
            "code": str(subject["_id"]),
            "name": subject["name"],
            "students": subject["students"],
            "color": subject.get("color", "subject-default")
        })
    return subjects

@app.get("/faculty/timetable_history")
async def get_faculty_timetable_history(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Not authorized")
    user = await app.faculty_db[USERS_COLLECTION].find_one({"_id": ObjectId(current_user["user_id"])})
    subject_ids = user.get("subjects", [])
    timetables = []
    async for slot in app.faculty_db[TIMETABLES_COLLECTION].find({"subject_id": {"$in": subject_ids}, "instructor_id": current_user["user_id"]}).sort("date", -1):
        subject = await app.faculty_db[SUBJECTS_COLLECTION].find_one({"_id": ObjectId(slot["subject_id"])})
        timetables.append({
            "subject": subject["name"],
            "day": slot["day"],
            "time": slot["time"],
            "room": slot["room"],
            "class": slot["class_name"],
            "students": slot["students"],
            "type": slot["type"],
            "date": slot["date"]
        })
    return timetables

@app.post("/faculty/update_status")
async def update_faculty_status(status_data: StatusUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Not authorized")
    result = await app.faculty_db[USERS_COLLECTION].update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": {"currentStatus": status_data.status, "statusNote": status_data.statusNote}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Status updated successfully"}

@app.post("/faculty/cancel_class")
async def cancel_class(action: ClassAction, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Not authorized")
    result = await app.faculty_db[TIMETABLES_COLLECTION].delete_one({
        "instructor_id": current_user["user_id"],
        "subject_id": action.subject_id,
        "day": action.day,
        "time": action.time
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Class not found")
    await app.student_db[TIMETABLES_COLLECTION].delete_one({
        "instructor_id": current_user["user_id"],
        "subject_id": action.subject_id,
        "day": action.day,
        "time": action.time
    })
    await app.admin_db[TIMETABLES_COLLECTION].delete_one({
        "instructor_id": current_user["user_id"],
        "subject_id": action.subject_id,
        "day": action.day,
        "time": action.time
    })
    return {"message": "Class cancelled successfully"}

@app.post("/faculty/reschedule_class")
async def reschedule_class(action: ClassAction, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Not authorized")
    if not action.new_day or not action.new_time:
        raise HTTPException(status_code=400, detail="New day and time required")
    conflict = await app.faculty_db[TIMETABLES_COLLECTION].find_one({
        "instructor_id": current_user["user_id"],
        "day": action.new_day,
        "time": action.new_time
    })
    if conflict:
        raise HTTPException(status_code=400, detail="Time slot already occupied")
    result = await app.faculty_db[TIMETABLES_COLLECTION].update_one(
        {
            "instructor_id": current_user["user_id"],
            "subject_id": action.subject_id,
            "day": action.day,
            "time": action.time
        },
        {"$set": {"day": action.new_day, "time": action.new_time}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Class not found")
    await app.student_db[TIMETABLES_COLLECTION].update_one(
        {
            "instructor_id": current_user["user_id"],
            "subject_id": action.subject_id,
            "day": action.day,
            "time": action.time
        },
        {"$set": {"day": action.new_day, "time": action.new_time}}
    )
    await app.admin_db[TIMETABLES_COLLECTION].update_one(
        {
            "instructor_id": current_user["user_id"],
            "subject_id": action.subject_id,
            "day": action.day,
            "time": action.time
        },
        {"$set": {"day": action.new_day, "time": action.new_time}}
    )
    return {"message": "Class rescheduled successfully"}

# Admin endpoints
@app.get("/admin/me")
async def get_admin_info(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    user = await app.admin_db[USERS_COLLECTION].find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"username": user["username"], "email": user["email"], "role": user.get("role", "admin")}

@app.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    total_classes = await app.admin_db[TIMETABLES_COLLECTION].count_documents({})
    total_subjects = await app.admin_db[SUBJECTS_COLLECTION].count_documents({})
    total_teachers = await app.faculty_db[USERS_COLLECTION].count_documents({})
    total_rooms = len(await app.admin_db[TIMETABLES_COLLECTION].distinct("room"))
    return {
        "totalClasses": total_classes,
        "totalSubjects": total_subjects,
        "totalTeachers": total_teachers,
        "totalRooms": total_rooms
    }

@app.get("/admin/timetable_history")
async def get_admin_timetable_history(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    timetables = []
    async for slot in app.admin_db[TIMETABLES_COLLECTION].find().sort("date", -1):
        subject = await app.admin_db[SUBJECTS_COLLECTION].find_one({"_id": ObjectId(slot["subject_id"])})
        timetables.append({
            "subject": subject["name"],
            "day": slot["day"],
            "time": slot["time"],
            "room": slot["room"],
            "instructor": slot["instructor"],
            "class": slot["class_name"],
            "students": slot["students"],
            "type": slot["type"],
            "date": slot["date"]
        })
    return timetables

@app.get("/admin/week_schedule")
async def get_week_schedule(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    today = datetime.utcnow()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    schedule = []
    for i in range(7):
        date = (week_start + timedelta(days=i)).strftime("%Y-%m-%d")
        events = []
        async for slot in app.admin_db[TIMETABLES_COLLECTION].find({"date": date}):
            subject = await app.admin_db[SUBJECTS_COLLECTION].find_one({"_id": ObjectId(slot["subject_id"])})
            events.append({
                "title": f"{subject['name']} {slot['type']}",
                "start": f"{date}T{slot['time']}:00",
                "end": f"{date}T{str(int(slot['time'].split(':')[0]) + 1).zfill(2)}:{slot['time'].split(':')[1]}:00",
                "department": slot["department"],
                "color": subject.get("color", "#667eea")
            })
        schedule.append({"date": date, "events": events})
    return schedule

@app.post("/admin/upload_teachers")
async def upload_teachers(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    content = await file.read()
    csv_file = StringIO(content.decode('utf-8'))
    reader = csv.DictReader(csv_file)
    teachers = []
    for row in reader:
        hashed_password = pwd_context.hash(row["password"]) if "password" in row else pwd_context.hash("default_password")
        teacher_data = {
            "username": row["username"],
            "email": row["email"],
            "password": hashed_password,
            "subjects": [],
            "currentStatus": row.get("availability", "available"),
            "statusNote": "",
            "role": "faculty",
            "photos": [row["photo"]] if "photo" in row else [],
            "teacher_id": row.get("teacher_id", str(uuid.uuid4())),
            "title": row.get("title", ""),
            "department": row.get("department", "")
        }
        existing = await app.faculty_db[USERS_COLLECTION].find_one({"email": teacher_data["email"]})
        if not existing:
            teachers.append(teacher_data)
    if teachers:
        await app.faculty_db[USERS_COLLECTION].insert_many(teachers)
    return {"message": f"{len(teachers)} teachers uploaded successfully"}

@app.post("/admin/upload_courses")
async def upload_courses(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    content = await file.read()
    csv_file = StringIO(content.decode('utf-8'))
    reader = csv.DictReader(csv_file)
    subjects = []
    for row in reader:
        subject = {
            "_id": row["code"],
            "name": row["name"],
            "credits": int(row.get("credits", 0)),
            "students": int(row.get("students", 0)),
            "department": row.get("department", ""),
            "color": row.get("color", "subject-default")
        }
        subjects.append(subject)
        faculty = await app.faculty_db[USERS_COLLECTION].find_one({"department": subject["department"]})
        if faculty:
            await app.faculty_db[USERS_COLLECTION].update_one(
                {"_id": faculty["_id"]},
                {"$addToSet": {"subjects": subject["_id"]}}
            )
        async for student in app.student_db[USERS_COLLECTION].find({"class_name": {"$regex": subject["department"], "$options": "i"}}):
            await app.student_db[USERS_COLLECTION].update_one(
                {"_id": student["_id"]},
                {"$addToSet": {"subjects": subject["_id"]}}
            )
    if subjects:
        await app.admin_db[SUBJECTS_COLLECTION].insert_many(subjects)
        await app.student_db[SUBJECTS_COLLECTION].insert_many(subjects)
        await app.faculty_db[SUBJECTS_COLLECTION].insert_many(subjects)
    return {"message": "Courses uploaded successfully"}

@app.post("/admin/upload_students")
async def upload_students(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    content = await file.read()
    csv_file = StringIO(content.decode('utf-8'))
    reader = csv.DictReader(csv_file)
    students = []
    for row in reader:
        hashed_password = pwd_context.hash(row["password"]) if "password" in row else pwd_context.hash("default_password")
        student_data = {
            "username": row["username"],
            "email": row["email"],
            "password": hashed_password,
            "subjects": [],
            "role": "student",
            "class_name": row.get("class_name", "N/A"),
            "semester": row.get("semester", "N/A")
        }
        existing = await app.student_db[USERS_COLLECTION].find_one({"email": student_data["email"]})
        if not existing:
            students.append(student_data)
    if students:
        await app.student_db[USERS_COLLECTION].insert_many(students)
    return {"message": f"{len(students)} students uploaded successfully"}

@app.post("/admin/generate_timetable")
async def generate_timetable(data: TimetableGenerate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    subjects = []
    async for subject in app.admin_db[SUBJECTS_COLLECTION].find({"department": data.department}):
        subjects.append(subject)
    faculty = []
    async for f in app.faculty_db[USERS_COLLECTION].find({"department": data.department, "currentStatus": "available"}):
        faculty.append(f)
    if not subjects or not faculty:
        raise HTTPException(status_code=400, detail="No subjects or available faculty found")

    time_slots = [f"{h:02d}:00" for h in range(8, 8 + data.timeSlots)]
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    rooms = [f"Room-{i}" for i in range(1, 11)]
    timetable = []

    for subject in subjects:
        for _ in range(subject["credits"]):
            day = random.choice(days)
            time = random.choice(time_slots)
            room = random.choice(rooms)
            instructor = random.choice(faculty)
            conflict = await app.admin_db[TIMETABLES_COLLECTION].find_one({
                "$or": [
                    {"instructor_id": str(instructor["_id"]), "day": day, "time": time},
                    {"room": room, "day": day, "time": time}
                ]
            })
            if not conflict:
                slot = {
                    "subject_id": subject["_id"],
                    "day": day,
                    "time": time,
                    "room": room,
                    "instructor_id": str(instructor["_id"]),
                    "instructor": instructor["username"],
                    "class_name": f"{data.department} - Year {random.randint(1, 4)}",
                    "students": subject["students"],
                    "type": random.choice(["Lecture", "Tutorial", "Practical"]),
                    "department": data.department,
                    "semester": data.semester,
                    "date": (datetime.utcnow() + timedelta(days=days.index(day))).strftime("%Y-%m-%d"),
                    "created": datetime.utcnow().strftime("%Y-%m-%d"),
                    "status": "completed"
                }
                timetable.append(slot)

    if timetable:
        await app.admin_db[TIMETABLES_COLLECTION].insert_many(timetable)
        await app.student_db[TIMETABLES_COLLECTION].insert_many(timetable)
        await app.faculty_db[TIMETABLES_COLLECTION].insert_many(timetable)
    return {"message": f"Timetable generated for {data.department} - Semester {data.semester}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)