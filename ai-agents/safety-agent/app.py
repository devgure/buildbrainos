from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel

app = FastAPI()

class SafetyResult(BaseModel):
    violations: int
    details: list[str]

@app.get('/health')
def health():
    return {"status":"ok","service":"safety-agent"}

@app.post('/analyze-photo', response_model=SafetyResult)
async def analyze_photo(file: UploadFile = File(...)):
    # placeholder: integrate YOLOv8/OpenCV here
    return SafetyResult(violations=0, details=["no-issues-detected"])
