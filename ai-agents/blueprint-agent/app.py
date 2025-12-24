from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import uvicorn
from models.blueprint_models import BlueprintAnalysis, Component

app = FastAPI(title='blueprint-agent')


@app.get('/health')
async def health():
    return {'status': 'ok', 'service': 'blueprint-agent'}


@app.post('/analyze', response_model=BlueprintAnalysis)
async def analyze(file: UploadFile = File(...)):
    content = await file.read()
    # Placeholder extraction: in production use PyMuPDF/Tika + OCR + LLM
    sample_component = Component(id='c1', name='Wall', type='structure', metadata={'material': 'concrete'})
    return BlueprintAnalysis(text=f'processed {len(content)} bytes', components=[sample_component], page_count=1)


if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8001)
