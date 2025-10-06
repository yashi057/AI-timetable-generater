from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.requests import Request
from pydantic import BaseModel
import motor.motor_asyncio
import bcrypt
from fastapi.middleware.cors import CORSMiddleware

# MongoDB Atlas connection (replace with your connection string)
MONGO_URI = "mongodb+srv://manishaa011103_db_user:tI10AxekPgnPG1sS@cluster0.fvc0drh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "auth_db"
COLLECTION_NAME = "users"

# Connect to MongoDB Atlas
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]

app = FastAPI()

# Mount static files (CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Set up templates
templates = Jinja2Templates(directory="template")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8000/"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for request body
class UserData(BaseModel):
    email: str
    password: str
    mode: str

# Serve HTML form
@app.get("/", response_class=HTMLResponse)
async def serve_form(request: Request):
    return templates.TemplateResponse("student_login.html", {"request": request})

# Handle form submission
@app.post("/submit")
async def submit_data(user_data: UserData):
    try:
        if user_data.mode == "signup":
            # Check if user exists
            existing_user = await collection.find_one({"email": user_data.email})
            if existing_user:
                raise HTTPException(status_code=400, detail="User already exists")

            # Hash password
            hashed_password = bcrypt.hashpw(user_data.password.encode("utf-8"), bcrypt.gensalt())

            # Insert user
            await collection.insert_one({
                "email": user_data.email,
                "password": hashed_password.decode("utf-8")
            })
            return {"message": "User signed up successfully"}

        elif user_data.mode == "login":
            # Verify credentials
            user = await collection.find_one({"email": user_data.email})
            if not user or not bcrypt.checkpw(user_data.password.encode("utf-8"), user["password"].encode("utf-8")):
                raise HTTPException(status_code=401, detail="Invalid credentials")
            return {"message": "Login successful"}

        else:
            raise HTTPException(status_code=400, detail="Invalid mode")

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
