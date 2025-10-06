# Import all necessary modules at the top
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from  bson import ObjectId

# Hardcoded MongoDB connection details (replace with your Atlas details)
MONGO_URI = "mongodb+srv://manisha:manisha1234@cluster0.fvc0drh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "timetable_db"

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


# Pydantic model for signup form
class UserSignup(BaseModel):
    username: str
    email: str
    password: str


# Pydantic model for login form
class UserLogin(BaseModel):
    email: str
    password: str


# MongoDB connection
@app.on_event("startup")
async def startup_db_client():
    try:
        app.mongodb_client = AsyncIOMotorClient(MONGO_URI)
        app.database = app.mongodb_client[DATABASE_NAME]
        await app.database.command("ping")
        print("MongoDB connection successful")
    except Exception as e:
        print(f"MongoDB connection failed: {str(e)}")
        raise Exception(f"MongoDB connection failed: {str(e)}")


@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()


# Test MongoDB connection
@app.get("/test-db")
async def test_db():
    try:
        db = app.database
        await db.test_collection.insert_one({"test": "ok"})
        return {"message": "MongoDB connection successful"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Save signup form data
@app.post("/users")
async def create_user(user: UserSignup):
    try:
        db = app.database
        # Check if email already exists
        existing_user = await db.users.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Hash the password
        hashed_password = pwd_context.hash(user.password)
        user_data = user.dict()
        user_data['password'] = hashed_password

        # Insert user data into MongoDB
        result = await db.users.insert_one(user_data)
        return {"message": "User registered successfully!", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Student login endpoint
@app.post("/student_login")
async def student_login(user: UserLogin):
    try:
        db = app.database
        # Find user by email
        existing_user = await db.users.find_one({"email": user.email})
        if not existing_user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Verify password
        if not pwd_context.verify(user.password, existing_user["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        return {"message": "Login successful!", "user_id": str(existing_user["_id"]),
                "username": existing_user["username"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Serve form
@app.get("/", response_class=HTMLResponse)
async def serve_form():
    try:
        with open("student_login.html", "r") as f:
            return f.read()
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="student_login.html not found")