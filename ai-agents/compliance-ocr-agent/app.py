from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel

app = FastAPI()

class COIResult(BaseModel):
    valid: bool
    expires_at: str | None

@app.get('/health')
def health():
    return {"status":"ok","service":"compliance-ocr-agent"}

@app.post('/validate-coi', response_model=COIResult)
async def validate_coi(file: UploadFile = File(...)):
    # placeholder: run OCR and parse COI fields
    return COIResult(valid=True, expires_at=None)
