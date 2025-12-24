from fastapi import FastAPI

app = FastAPI()

@app.get('/health')
def health():
    return {"status":"ok","service":"scheduler-agent"}

@app.get('/next-tasks')
def next_tasks():
    return {"tasks": []}
