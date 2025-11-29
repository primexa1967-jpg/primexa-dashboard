from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# ✅ Allow frontend origin (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your frontend address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Model for incoming login data
class LoginData(BaseModel):
    email: str
    name: str
    deviceId: str

@app.get("/")
def root():
    return {"message": "Backend is running successfully 🚀"}

@app.post("/loginUser")
def login_user(data: LoginData):
    # Dummy success response (simulate real login logic)
    return {"ok": True, "role": "user", "status": "SUCCESS"}
