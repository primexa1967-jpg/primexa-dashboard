# ==========================================================
# PRIMEXA Option Buyer’s Dashboard - Backend API (FastAPI)
# ==========================================================
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="PRIMEXA Backend API",
    description="Handles user authentication for the dashboard",
    version="1.0.0"
)

# ✅ Allow frontend from Firebase Hosting
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://fnodatadashboardstreamlite.web.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Data model for login
class LoginData(BaseModel):
    email: str
    name: str
    deviceId: str

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Backend running successfully 🚀"}

@app.post("/loginUser")
async def login_user(data: LoginData):
    if not data.email:
        return {"ok": False, "status": "INVALID_REQUEST"}
    if data.email.endswith("@gmail.com"):
        role = "superadmin" if "admin" in data.email.lower() else "user"
        return {"ok": True, "role": role, "status": "SUCCESS"}
    return {"ok": False, "status": "MOBILE_MISMATCH"}
