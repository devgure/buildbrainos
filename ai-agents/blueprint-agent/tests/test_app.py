import io
from fastapi.testclient import TestClient
from app import app


client = TestClient(app)


def test_health():
    r = client.get('/health')
    assert r.status_code == 200
    assert r.json()['service'] == 'blueprint-agent'


def test_analyze():
    data = {'file': ('test.pdf', io.BytesIO(b'%PDF-1.4 fake pdf'), 'application/pdf')}
    r = client.post('/analyze', files=data)
    assert r.status_code == 200
    j = r.json()
    assert 'text' in j
    assert isinstance(j.get('components', []), list)
