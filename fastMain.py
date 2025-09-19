from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from bson import ObjectId
from fastapi.security import OAuth2PasswordBearer
import jwt
from datetime import datetime, timedelta

# MongoDB connection details (replace <db-username> and <db-password> with your Atlas credentials)
MONGO_URI = "mongodb+srv://shweta:VJJ55vVcUUr8@userdata.3xjunnx.mongodb.net/?retryWrites=true&w=majority&appName=UserData"
STUDENT_DB_NAME = "student_data"
FACULTY_DB_NAME = "faculty_data"
ADMIN_DB_NAME = "admin_data"

# JWT configuration
SECRET_KEY = "40f6d37c1c3be9e2512b1ef529b108284f5277bf497507a8a188e46fe8c04fa7"  # Hardcoded for testing
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")  # Placeholder for docs

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()

# Add CORS middleware
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

class Timetable(BaseModel):
    data: str  # Timetable data (string for simplicity)

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

# Test MongoDB connections
@app.get("/test-db")
async def test_db():
    try:
        await app.student_db.test_collection.insert_one({"test": "student_ok"})
        await app.faculty_db.test_collection.insert_one({"test": "faculty_ok"})
        await app.admin_db.test_collection.insert_one({"test": "admin_ok"})
        return {"message": "MongoDB connections successful"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Student signup
@app.post("/student_signup")
async def student_signup(user: UserSignup):
    try:
        db = app.student_db
        existing_user = await db.users.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_password = pwd_context.hash(user.password)
        user_data = user.dict()
        user_data['password'] = hashed_password
        user_data['timetables'] = []  # Initialize empty history

        result = await db.users.insert_one(user_data)
        return {"message": "Student registered successfully!", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Faculty signup
@app.post("/faculty_signup")
async def faculty_signup(user: UserSignup):
    try:
        db = app.faculty_db
        existing_user = await db.users.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_password = pwd_context.hash(user.password)
        user_data = user.dict()
        user_data['password'] = hashed_password
        user_data['timetables'] = []  # Initialize empty history

        result = await db.users.insert_one(user_data)
        return {"message": "Faculty registered successfully!", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Admin signup
@app.post("/admin_signup")
async def admin_signup(user: UserSignup):
    try:
        db = app.admin_db
        existing_user = await db.users.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_password = pwd_context.hash(user.password)
        user_data = user.dict()
        user_data['password'] = hashed_password
        user_data['timetables'] = []  # Initialize empty history

        result = await db.users.insert_one(user_data)
        return {"message": "Admin registered successfully!", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Student login
@app.post("/student_login")
async def student_login(user: UserLogin):
    try:
        db = app.student_db
        existing_user = await db.users.find_one({"email": user.email})
        if not existing_user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if not pwd_context.verify(user.password, existing_user["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token_data = {
            "sub": str(existing_user["_id"]),
            "username": existing_user["username"],
            "exp": datetime.utcnow() + timedelta(minutes=60)  # 1 hour expiry
        }
        token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
        return {
            "message": "Student login successful!",
            "access_token": token,
            "token_type": "bearer",
            "user_id": str(existing_user["_id"]),
            "username": existing_user["username"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Faculty login
@app.post("/faculty_login")
async def faculty_login(user: UserLogin):
    try:
        db = app.faculty_db
        existing_user = await db.users.find_one({"email": user.email})
        if not existing_user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if not pwd_context.verify(user.password, existing_user["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token_data = {
            "sub": str(existing_user["_id"]),
            "username": existing_user["username"],
            "exp": datetime.utcnow() + timedelta(minutes=60)  # 1 hour expiry
        }
        token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
        return {
            "message": "Faculty login successful!",
            "access_token": token,
            "token_type": "bearer",
            "user_id": str(existing_user["_id"]),
            "username": existing_user["username"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Admin login
@app.post("/admin_login")
async def admin_login(user: UserLogin):
    try:
        db = app.admin_db
        existing_user = await db.users.find_one({"email": user.email})
        if not existing_user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if not pwd_context.verify(user.password, existing_user["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token_data = {
            "sub": str(existing_user["_id"]),
            "username": existing_user["username"],
            "exp": datetime.utcnow() + timedelta(minutes=30)  # 30 min expiry
        }
        token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
        return {
            "message": "Admin login successful!",
            "access_token": token,
            "token_type": "bearer",
            "user_id": str(existing_user["_id"]),
            "username": existing_user["username"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Student protected data
@app.get("/student/me")
async def read_student_me(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    db = app.student_db
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"username": user["username"], "email": user["email"]}

# Faculty protected data
@app.get("/faculty/me")
async def read_faculty_me(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    db = app.faculty_db
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"username": user["username"], "email": user["email"]}

# Admin protected data
@app.get("/admin/me")
async def read_admin_me(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    db = app.admin_db
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"username": user["username"], "email": user["email"]}

# Add student timetable
@app.post("/student/timetable")
async def add_student_timetable(timetable: Timetable, token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    db = app.student_db
    result = await db.users.update_one({"_id": ObjectId(user_id)}, {"$push": {"timetables": timetable.data}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Timetable added successfully"}

# Get student timetables
@app.get("/student/timetables")
async def get_student_timetables(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    db = app.student_db
    user = await db.users.find_one({"_id": ObjectId(user_id)}, {"timetables": 1})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"timetables": user.get("timetables", [])}

# Add faculty timetable
@app.post("/faculty/timetable")
async def add_faculty_timetable(timetable: Timetable, token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    db = app.faculty_db
    result = await db.users.update_one({"_id": ObjectId(user_id)}, {"$push": {"timetables": timetable.data}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Timetable added successfully"}

# Get faculty timetables
@app.get("/faculty/timetables")
async def get_faculty_timetables(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    db = app.faculty_db
    user = await db.users.find_one({"_id": ObjectId(user_id)}, {"timetables": 1})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"timetables": user.get("timetables", [])}

# Add admin timetable
@app.post("/admin/timetable")
async def add_admin_timetable(timetable: Timetable, token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    db = app.admin_db
    result = await db.users.update_one({"_id": ObjectId(user_id)}, {"$push": {"timetables": timetable.data}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Timetable added successfully"}

# Get admin timetables
@app.get("/admin/timetables")
async def get_admin_timetables(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    db = app.admin_db
    user = await db.users.find_one({"_id": ObjectId(user_id)}, {"timetables": 1})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"timetables": user.get("timetables", [])}

# Serve student login form
@app.get("/", response_class=HTMLResponse)
async def serve_student_form():
    try:
        with open("student_login.html", "r") as f:
            return f.read()
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="student_login.html not found")

# Serve faculty login form
@app.get("/faculty", response_class=HTMLResponse)
async def serve_faculty_form():
    try:
        with open("faculty_login.html", "r") as f:
            return f.read()
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="faculty_login.html not found")

# Serve admin login form
@app.get("/admin", response_class=HTMLResponse)
async def serve_admin_form():
    try:
        with open("admin_login.html", "r") as f:
            return f.read()
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="admin_login.html not found")