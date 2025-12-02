from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ✅ Create FastAPI app
app = FastAPI()

# ✅ Allow requests from your Firebase hosted app
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://fnodatadashboardstreamlite.web.app",
        "https://fnodatadashboardstreamlite.firebaseapp.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Model for incoming login data
class LoginData(BaseModel):
    email: str
    name: str
    deviceId: str

# ✅ Root endpoint (for quick status check)
@app.get("/")
def root():
    return {"message": "Backend is running successfully 🚀"}

# ✅ Login endpoint (dummy example — replace with real logic later)
@app.post("/loginUser")
def login_user(data: LoginData):
    print(f"🔐 Login attempt from: {data.email} — Device: {data.deviceId}")
    # Simulated response
    return {
        "ok": True,
        "role": "user",
        "status": "SUCCESS",
        "email": data.email
    }
