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
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Optional
import base64


app = FastAPI()

# MongoDB connection details
MONGO_URI = "mongodb://localhost:27017/"
STUDENT_DB_NAME = "student_data"
FACULTY_DB_NAME = "faculty_data"
ADMIN_DB_NAME = "admin_data"
USERS_COLLECTION = "users"
SUBJECTS_COLLECTION = "subjects"
TIMETABLES_COLLECTION = "timetables"
ACTIVITY_COLLECTION = "activity_logs"

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

class AdminProfileUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    photo: Optional[str] = None

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


# ==================== TEACHER PHOTO UPLOAD ====================
@app.post("/admin/upload_teacher_photo/{teacher_id}")
async def upload_teacher_photo(
        teacher_id: str,
        file: UploadFile = File(...),
        current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Find teacher
    teacher = await app.faculty_db[USERS_COLLECTION].find_one({"teacher_id": teacher_id})
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # Read and encode photo
    content = await file.read()
    base64_image = base64.b64encode(content).decode('utf-8')
    content_type = file.content_type or "image/jpeg"
    photo_url = f"data:{content_type};base64,{base64_image}"

    # Update teacher photo
    result = await app.faculty_db[USERS_COLLECTION].update_one(
        {"teacher_id": teacher_id},
        {"$set": {"photo": photo_url, "photos": [photo_url]}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Failed to update photo")

    # Log activity
    await log_activity(
        action="teacher_photo_updated",
        description=f"Updated photo for teacher {teacher.get('firstName', '')} {teacher.get('lastName', '')}",
        user_id=current_user["user_id"],
        username=current_user["username"]
    )

    return {"message": "Photo uploaded successfully", "photo": photo_url}


# ==================== GET SINGLE TEACHER ====================
@app.get("/admin/teachers/{teacher_id}")
async def get_teacher_by_id(teacher_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    teacher = await app.faculty_db[USERS_COLLECTION].find_one({"teacher_id": teacher_id})

    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    teacher["id"] = str(teacher["_id"])
    teacher.pop("_id", None)
    teacher.pop("password", None)

    return teacher

    # ==================== ADD SINGLE TEACHER (Manual Form) ====================


@app.post("/admin/add_teacher")
async def add_single_teacher(teacher_data: dict, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if teacher exists
    existing = await app.faculty_db[USERS_COLLECTION].find_one({
        "$or": [
            {"email": teacher_data["email"]},
            {"teacher_id": teacher_data["teacher_id"]}
        ]
    })
    if existing:
        raise HTTPException(status_code=400, detail="Teacher with this email or ID already exists")

    # Add required fields
    teacher_data["password"] = pwd_context.hash("default123")  # Default password
    teacher_data["username"] = f"{teacher_data.get('firstName', '')} {teacher_data.get('lastName', '')}".strip()
    teacher_data["role"] = "faculty"
    teacher_data["currentStatus"] = "available"
    teacher_data["statusNote"] = ""
    teacher_data["photos"] = []

    # Insert into database
    result = await app.faculty_db[USERS_COLLECTION].insert_one(teacher_data)

    # Log activity
    await log_activity(
        action="teacher_added",
        description=f"Added new teacher: {teacher_data['firstName']} {teacher_data['lastName']}",
        user_id=current_user["user_id"],
        username=current_user["username"]
    )

    return {
        "message": "Teacher added successfully",
        "id": str(result.inserted_id),
        "teacher_id": teacher_data["teacher_id"]
    }

# ==================== UPDATE TEACHER ====================
@app.put("/admin/teachers/{teacher_id}")
async def update_teacher(
        teacher_id: str,
        teacher_data: dict,
        current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Remove fields that shouldn't be updated
    teacher_data.pop("password", None)
    teacher_data.pop("_id", None)
    teacher_data.pop("id", None)

    result = await app.faculty_db[USERS_COLLECTION].update_one(
        {"teacher_id": teacher_id},
        {"$set": teacher_data}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Teacher not found or no changes made")

    # Log activity
    await log_activity(
        action="teacher_updated",
        description=f"Updated teacher profile: {teacher_id}",
        user_id=current_user["user_id"],
        username=current_user["username"]
    )

    return {"message": "Teacher updated successfully"}


# ==================== DELETE TEACHER ====================
@app.delete("/admin/teachers/{teacher_id}")
async def delete_teacher(teacher_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await app.faculty_db[USERS_COLLECTION].delete_one({"teacher_id": teacher_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # Log activity
    await log_activity(
        action="teacher_deleted",
        description=f"Deleted teacher: {teacher_id}",
        user_id=current_user["user_id"],
        username=current_user["username"]
    )

    return {"message": "Teacher deleted successfully"}

# Admin endpoints
@app.get("/admin/me")
async def get_admin_info(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    user = await app.admin_db[USERS_COLLECTION].find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": str(user["_id"]),
        "username": user.get("username", "Admin"),
        "email": user.get("email", ""),
        "firstName": user.get("firstName", ""),
        "lastName": user.get("lastName", ""),
        "fullName": f"{user.get('firstName', '')} {user.get('lastName', '')}".strip() or user.get("username", "Admin"),
        "department": user.get("department", "Administration"),
        "phone": user.get("phone", ""),
        "photo": user.get("photo", "https://via.placeholder.com/40"),
        "role": user.get("role", "admin"),
        "joinDate": user.get("joinDate", datetime.utcnow().strftime("%Y-%m-%d"))
    }



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
    async for slot in app.admin_db[TIMETABLES_COLLECTION].find().sort("created", -1).limit(50):
        subject = await app.admin_db[SUBJECTS_COLLECTION].find_one({"_id": ObjectId(slot["subject_id"])})

        if subject:
            timetables.append({
                "id": str(slot["_id"]),
                "subject": subject.get("name", "Unknown Subject"),
                "subject_code": subject.get("code", ""),
                "day": slot.get("day", ""),
                "time": slot.get("time", ""),
                "room": slot.get("room", ""),
                "instructor": slot.get("instructor", "N/A"),
                "class_name": slot.get("class_name", ""),
                "students": slot.get("students", 0),
                "type": slot.get("type", "Lecture"),
                "date": slot.get("date", ""),
                "created": slot.get("created", ""),
                "created_by": slot.get("created_by", current_user["username"]),
                "status": slot.get("status", "completed"),
                "department": slot.get("department", "")
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


#============New Endpoints=======================================
# Activity logging helper function
async def log_activity(action: str, description: str, user_id: str, username: str):
    activity = {
        "action": action,
        "description": description,
        "user_id": user_id,
        "username": username,
        "timestamp": datetime.utcnow().isoformat(),
        "date": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    }
    await app.admin_db[ACTIVITY_COLLECTION].insert_one(activity)


# Profile update endpoint
@app.put("/admin/profile")
async def update_admin_profile(
        profile_data: AdminProfileUpdate,
        current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    update_fields = {k: v for k, v in profile_data.dict().items() if v is not None}

    if update_fields:
        result = await app.admin_db[USERS_COLLECTION].update_one(
            {"_id": ObjectId(current_user["user_id"])},
            {"$set": update_fields}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="User not found")

        # Log activity
        await log_activity(
            action="profile_update",
            description="Updated admin profile",
            user_id=current_user["user_id"],
            username=current_user["username"]
        )

    return {"message": "Profile updated successfully"}


# Photo upload endpoint
@app.post("/admin/upload_photo")
async def upload_profile_photo(
        file: UploadFile = File(...),
        current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Read file content
    content = await file.read()

    # Convert to base64 for storage
    base64_image = base64.b64encode(content).decode('utf-8')

    # Determine image type
    content_type = file.content_type or "image/jpeg"
    photo_url = f"data:{content_type};base64,{base64_image}"

    # Update user profile
    result = await app.admin_db[USERS_COLLECTION].update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": {"photo": photo_url}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "Photo uploaded successfully", "photo": photo_url}


# Activity feed endpoint
@app.get("/admin/activity_feed")
async def get_activity_feed(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    activities = []

    # Get recent activities from activity log
    async for activity in app.admin_db[ACTIVITY_COLLECTION].find().sort("timestamp", -1).limit(20):
        activities.append({
            "action": activity.get("action", ""),
            "description": activity.get("description", ""),
            "username": activity.get("username", "Admin"),
            "timestamp": activity.get("timestamp", ""),
            "date": activity.get("date", "")
        })

    # If no activities in log, generate from timetable history
    if not activities:
        async for slot in app.admin_db[TIMETABLES_COLLECTION].find().sort("created", -1).limit(10):
            subject = await app.admin_db[SUBJECTS_COLLECTION].find_one({"_id": ObjectId(slot["subject_id"])})
            if subject:
                activities.append({
                    "action": "timetable_generated",
                    "description": f"Generated timetable for {subject.get('name', 'Unknown')} - {slot.get('day', '')} at {slot.get('time', '')}",
                    "username": slot.get("created_by", "Admin"),
                    "timestamp": slot.get("created", ""),
                    "date": slot.get("created", "")
                })

    return activities

# -------------Not sure about students upload ---------------------------

# ==================== STUDENT MANAGEMENT ENDPOINTS ====================

# Get all students
@app.get("/admin/students")
async def get_all_students(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    students = await app.student_db[USERS_COLLECTION].find({"role": "student"}).to_list(1000)

    for student in students:
        student["id"] = str(student["_id"])
        student.pop("_id", None)
        student.pop("password", None)

    return students


# Upload students CSV
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
    added = 0
    updated = 0

    for row in reader:
        # Skip empty rows
        if not row.get("ID") or not row.get("Email"):
            continue

        # Parse enrolled courses (comma-separated)
        enrolled_courses = row.get("Enrolled Courses", "").split(",") if row.get("Enrolled Courses") else []
        enrolled_courses = [c.strip() for c in enrolled_courses if c.strip()]

        student_data = {
            "student_id": row["ID"],
            "username": f"{row.get('First Name', '')} {row.get('Last Name', '')}".strip(),
            "firstName": row.get("First Name", ""),
            "lastName": row.get("Last Name", ""),
            "email": row["Email"],
            "password": pwd_context.hash(row.get("Password", "default123")),
            "phone": row.get("Phone", ""),
            "dateOfBirth": row.get("Date of Birth", ""),
            "gender": row.get("Gender", "").lower(),
            "department": row.get("Department", ""),
            "year": int(row.get("Year", 1)) if row.get("Year") else 1,
            "class": row.get("Class", ""),
            "semester": row.get("Semester", ""),
            "status": row.get("Status", "active").lower(),
            "photo": row.get("Photo", "https://via.placeholder.com/40"),
            "enrollmentDate": row.get("Enrollment Date", ""),
            "address": row.get("Address", ""),
            "emergencyContact": row.get("Emergency Contact", ""),
            "gpa": float(row.get("GPA", 0.0)) if row.get("GPA") else 0.0,
            "credits": int(row.get("Credits", 0)) if row.get("Credits") else 0,
            "subjects": enrolled_courses,
            "enrolledCourses": enrolled_courses,
            "role": "student"
        }

        # Check if student exists
        existing = await app.student_db[USERS_COLLECTION].find_one({"email": student_data["email"]})

        if existing:
            update_data = {k: v for k, v in student_data.items() if k != "password"}
            await app.student_db[USERS_COLLECTION].update_one(
                {"email": student_data["email"]},
                {"$set": update_data}
            )
            updated += 1
        else:
            students.append(student_data)
            added += 1

    if students:
        await app.student_db[USERS_COLLECTION].insert_many(students)

    return {
        "message": "Students uploaded successfully",
        "added": added,
        "updated": updated,
        "total": added + updated
    }


# Add single student
@app.post("/admin/add_student")
async def add_student(student_data: dict, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if student exists
    existing = await app.student_db[USERS_COLLECTION].find_one({"email": student_data["email"]})
    if existing:
        raise HTTPException(status_code=400, detail="Student with this email already exists")

    student_data["password"] = pwd_context.hash(student_data.get("password", "default123"))
    student_data["role"] = "student"

    result = await app.student_db[USERS_COLLECTION].insert_one(student_data)

    return {
        "message": "Student added successfully",
        "id": str(result.inserted_id)
    }


# Update student
@app.put("/admin/update_student/{student_id}")
async def update_student(
        student_id: str,
        student_data: dict,
        current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Remove password from update if present
    student_data.pop("password", None)

    result = await app.student_db[USERS_COLLECTION].update_one(
        {"student_id": student_id},
        {"$set": student_data}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")

    return {"message": "Student updated successfully"}


# Delete student
@app.delete("/admin/delete_student/{student_id}")
async def delete_student(student_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await app.student_db[USERS_COLLECTION].delete_one({"student_id": student_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")

    return {"message": "Student deleted successfully"}

# ==================== UPLOAD TEACHERS ====================
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
    added = 0
    updated = 0

    for row in reader:
        # Skip empty rows
        if not row.get("ID") or not row.get("Email"):
            continue

        # Parse subjects (comma-separated)
        subjects = row.get("subjects", "").split(",") if row.get("subjects") else []
        subjects = [s.strip() for s in subjects if s.strip()]

        # Parse preferred days (comma-separated)
        preferred_days = row.get("Preferred days", "").split(",") if row.get("Preferred days") else []
        preferred_days = [d.strip().lower() for d in preferred_days if d.strip()]

        # ✅ NEW: Extract first and last name
        first_name = row.get("First Name", "").strip()
        last_name = row.get("Last Name", "").strip()
        full_name = f"{first_name} {last_name}".strip() or "Unknown Teacher"

        # Create teacher data
        teacher_data = {
            "teacher_id": row["ID"],
            "firstName": first_name,  # ✅ NEW
            "lastName": last_name,    # ✅ NEW
            "username": full_name,     # Keep for backward compatibility
            "email": row["Email"],
            "password": pwd_context.hash("default123"),  # Default password
            "phone": row.get("Phone", ""),
            "title": row.get("Title", "").lower().replace(" ", "-"),
            "position": row.get("Title", "Lecturer"),
            "department": row.get("Department", ""),
            "status": row.get("Status", "active").lower(),
            "availability_status": row.get("Status", "active").lower(),
            "photo": row.get("Photo", "https://via.placeholder.com/100"),
            "photos": [row.get("Photo", "")] if row.get("Photo") else [],
            "joinDate": row.get("Join Date", ""),
            "qualification": row.get("Qualification", "").lower(),
            "experience": int(row.get("Experience", 0)) if row.get("Experience") else 0,
            "maxHours": int(row.get("Max hours", 20)) if row.get("Max hours") else 20,
            "subjects": subjects,
            "preferredDays": preferred_days,
            "currentHours": int(row.get("Current Hours", 0)) if row.get("Current Hours") else 0,
            "totalStudents": int(row.get("Total students", 0)) if row.get("Total students") else 0,
            "officeHours": row.get("Office hours", "TBD"),
            "officeLocation": row.get("office locations", "TBD"),
            "role": "faculty",
            "currentStatus": "available",
            "statusNote": ""
        }

        # Check if teacher exists
        existing = await app.faculty_db[USERS_COLLECTION].find_one({"email": teacher_data["email"]})

        if existing:
            # Update existing
            update_data = {k: v for k, v in teacher_data.items() if k != "password"}
            await app.faculty_db[USERS_COLLECTION].update_one(
                {"email": teacher_data["email"]},
                {"$set": update_data}
            )
            updated += 1
        else:
            # Add new
            teachers.append(teacher_data)
            added += 1

    if teachers:
        await app.faculty_db[USERS_COLLECTION].insert_many(teachers)

    return {
        "message": "Teachers uploaded successfully",
        "added": added,
        "updated": updated,
        "total": added + updated
    }


# ==================== UPLOAD COURSES ====================
@app.post("/admin/upload_courses")
async def upload_courses(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    csv_file = StringIO(content.decode('utf-8'))
    reader = csv.DictReader(csv_file)

    courses = []
    added = 0
    updated = 0

    for row in reader:
        # Skip empty rows
        if not row.get("Course code") or not row.get("course Name"):
            continue

        # Parse enrollment (e.g., "45/50")
        enrolled = row.get("Enrolled", "0/0")
        current_enrollment = 0
        max_enrollment = 50
        if "/" in enrolled:
            parts = enrolled.split("/")
            current_enrollment = int(parts[0]) if parts[0].strip() else 0
            max_enrollment = int(parts[1]) if parts[1].strip() else 50

        # Parse schedule (e.g., "MWF 9:00-10:00")
        schedule = row.get("Schedule", "")
        meeting_days = []
        start_time = ""
        end_time = ""

        if schedule:
            parts = schedule.split()
            if len(parts) >= 2:
                # Parse days (e.g., "MWF" -> ["monday", "wednesday", "friday"])
                day_codes = parts[0]
                day_map = {
                    'M': 'monday',
                    'T': 'tuesday',
                    'W': 'wednesday',
                    'R': 'thursday',
                    'F': 'friday',
                    'S': 'saturday'
                }
                meeting_days = [day_map[d] for d in day_codes if d in day_map]

                # Parse time (e.g., "9:00-10:00")
                if '-' in parts[1]:
                    times = parts[1].split('-')
                    start_time = times[0]
                    end_time = times[1]

        course_data = {
            "code": row["Course code"],
            "name": row["course Name"],
            "department": row.get("Department", ""),
            "credits": int(row.get("Credits", 3)) if row.get("Credits") else 3,
            "instructor": row.get("Instructor", ""),
            "instructorId": "",  # Will be filled by matching instructor name
            "faculty_id": "",
            "maxEnrollment": max_enrollment,
            "currentEnrollment": current_enrollment,
            "students": current_enrollment,
            "schedule": {
                "days": meeting_days,
                "startTime": start_time,
                "endTime": end_time,
                "room": "",
                "roomType": "lecture"
            },
            "status": row.get("Status", "active").lower(),
            "color": "subject-computer",
            "description": "",
            "prerequisites": [],
            "corequisites": [],
            "syllabus": "",
            "textbook": "",
            "level": 100,
            "created": datetime.utcnow().strftime("%Y-%m-%d"),
            "lastModified": datetime.utcnow().strftime("%Y-%m-%d")
        }

        # Try to find instructor ID by name
        if course_data["instructor"]:
            instructor = await app.faculty_db[USERS_COLLECTION].find_one({
                "username": {"$regex": course_data["instructor"], "$options": "i"}
            })
            if instructor:
                course_data["instructorId"] = instructor.get("teacher_id", "")
                course_data["faculty_id"] = instructor.get("teacher_id", "")

        # Check if course exists
        existing = await app.admin_db[SUBJECTS_COLLECTION].find_one({"code": course_data["code"]})

        if existing:
            await app.admin_db[SUBJECTS_COLLECTION].update_one({"code": course_data["code"]}, {"$set": course_data})
            await app.student_db[SUBJECTS_COLLECTION].update_one({"code": course_data["code"]}, {"$set": course_data})
            await app.faculty_db[SUBJECTS_COLLECTION].update_one({"code": course_data["code"]}, {"$set": course_data})
            updated += 1
        else:
            courses.append(course_data)
            added += 1

    if courses:
        await app.admin_db[SUBJECTS_COLLECTION].insert_many(courses)
        await app.student_db[SUBJECTS_COLLECTION].insert_many(courses)
        await app.faculty_db[SUBJECTS_COLLECTION].insert_many(courses)

    return {
        "message": "Courses uploaded successfully",
        "added": added,
        "updated": updated,
        "total": added + updated
    }


# ==================== UPLOAD CLASSROOMS ====================
@app.post("/admin/upload_classrooms")
async def upload_classrooms(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    csv_file = StringIO(content.decode('utf-8'))
    reader = csv.DictReader(csv_file)

    classrooms = []
    added = 0
    updated = 0

    for row in reader:
        # Skip empty rows
        if not row.get("Class no"):
            continue

        classroom_data = {
            "room_number": row["Class no"],
            "name": row.get("Name", row["Class no"]),
            "class": row.get("class", ""),
            "timeSlot": row.get("Time Slot", ""),
            "capacity": int(row.get("class capacity", 50)) if row.get("class capacity") else 50,
            "department": row.get("Department", ""),
            "year": row.get("Year", ""),
            "status": row.get("status", "active").lower(),
            "type": row.get("Type", "Lecture Hall"),
            "building": "Main Building",
            "equipment": []
        }

        # Check if classroom exists
        existing = await app.faculty_db.classrooms.find_one({"room_number": classroom_data["room_number"]})

        if existing:
            await app.faculty_db.classrooms.update_one(
                {"room_number": classroom_data["room_number"]},
                {"$set": classroom_data}
            )
            updated += 1
        else:
            classrooms.append(classroom_data)
            added += 1

    if classrooms:
        await app.faculty_db.classrooms.insert_many(classrooms)

    return {
        "message": "Classrooms uploaded successfully",
        "added": added,
        "updated": updated,
        "total": added + updated
    }


# Get all teachers
@app.get("/admin/teachers")
async def get_all_teachers(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    teachers = await app.faculty_db[USERS_COLLECTION].find({"role": "faculty"}).to_list(1000)

    # Convert ObjectId to string
    for teacher in teachers:
        teacher["id"] = str(teacher["_id"])
        teacher.pop("_id", None)
        teacher.pop("password", None)  # Don't send passwords

    return teachers


# Get all courses
@app.get("/admin/courses")
async def get_all_courses(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    courses = await app.admin_db[SUBJECTS_COLLECTION].find({}).to_list(1000)

    for course in courses:
        course["id"] = str(course["_id"])
        course.pop("_id", None)

    return courses


# Get all classrooms
@app.get("/admin/classrooms")
async def get_all_classrooms(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    classrooms = await app.faculty_db.classrooms.find({}).to_list(1000)

    for classroom in classrooms:
        classroom["id"] = str(classroom["_id"])
        classroom.pop("_id", None)

    return classrooms

# Timetable generation endpoint ---------

@app.post("/admin/generate_timetable")
async def generate_timetable(data: TimetableGenerate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    subjects = []
    async for subject in app.admin_db[SUBJECTS_COLLECTION].find({"department": data.department}):
        subjects.append(subject)

    faculty = []
    async for f in app.faculty_db[USERS_COLLECTION].find({"department": data.department}):
        faculty.append(f)

    if not subjects or not faculty:
        raise HTTPException(status_code=400, detail="No subjects or available faculty found")

    time_slots = [f"{h:02d}:00" for h in range(8, 8 + data.timeSlots)]
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    rooms = [f"Room-{i}" for i in range(1, 11)]
    timetable = []
    created_timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    for subject in subjects:
        for _ in range(subject.get("credits", 3)):
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
                    "subject_id": str(subject["_id"]),
                    "day": day,
                    "time": time,
                    "room": room,
                    "instructor_id": str(instructor["_id"]),
                    "instructor": instructor.get("username", "Unknown"),
                    "class_name": f"{data.department} - {data.semester}",
                    "students": subject.get("students", 0),
                    "type": random.choice(["Lecture", "Tutorial", "Practical"]),
                    "department": data.department,
                    "semester": data.semester,
                    "date": (datetime.utcnow() + timedelta(days=days.index(day))).strftime("%Y-%m-%d"),
                    "created": created_timestamp,
                    "created_by": current_user["username"],
                    "status": "completed"
                }
                timetable.append(slot)

    if timetable:
        await app.admin_db[TIMETABLES_COLLECTION].insert_many(timetable)
        await app.student_db[TIMETABLES_COLLECTION].insert_many(timetable)
        await app.faculty_db[TIMETABLES_COLLECTION].insert_many(timetable)

        # Log activity
        await log_activity(
            action="timetable_generated",
            description=f"Generated {len(timetable)} timetable slots for {data.department} - {data.semester}",
            user_id=current_user["user_id"],
            username=current_user["username"]
        )

    return {
        "message": f"Timetable generated for {data.department} - Semester {data.semester}",
        "slots_created": len(timetable)
    }

    # ===== ADD THIS AT THE VERY END =====

    # Serve individual HTML files
    #@app.get("/")
    #async def root():
        #return FileResponse("admin.html")


    #@app.get("/admin.html")
    #async def serve_admin():
      #  return FileResponse("admin.html")


   # @app.get("/dashboard.html")
    #async def serve_dashboard():
       # return FileResponse("dashboard.html")
    # ========== STATIC FILE SERVING (NO INDENTATION!) ==========

@app.get("/students.html")
async def serve_students():
 return FileResponse("students.html")

@app.get("/teachers.html")
async def serve_teachers():
 return FileResponse("teachers.html")

@app.get("/courses.html")
async def serve_courses():
 return FileResponse("courses.html")

@app.get("/classrooms.html")
async def serve_classrooms():
        return FileResponse("classrooms.html")

@app.get("/timetable.html")
async def serve_timetable():
        return FileResponse("timetable.html")

@app.get("/dashboard.html")
async def serve_dashboard():
       return FileResponse("dashboard.html")

@app.get("/dashboard.css")
async def serve_dashboard_css():
    return FileResponse("dashboard.css", media_type="text/css")

@app.get("/timetable.css")
async def serve_dashboard_css():
    return FileResponse("timetable.css", media_type="text/css")

@app.get("/timetable.html")
async def serve_dashboard():
        return FileResponse("timetable.html")

@app.get("/timetable.js")
async def serve_dashboard_js():
  return FileResponse("timetable.js", media_type="application/javascript")

    # @app.get("/students.css")
    # async def serve_students_css():
    # return FileResponse("students.css", media_type="text/css")

@app.get("/navigation.js")
async def serve_navigation_js():
    return FileResponse("navigation.js", media_type="application/javascript")

@app.get("/dashboard.js")
async def serve_dashboard_js():
 return FileResponse("dashboard.js", media_type="application/javascript")




    # ========== THIS MUST BE AT THE VERY END ==========
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
    # For any other static files (images, fonts, etc.)
    # Add them as needed following the same pattern
