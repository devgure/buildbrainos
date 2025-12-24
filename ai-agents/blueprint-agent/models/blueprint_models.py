from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class Component(BaseModel):
    id: str
    name: str
    type: str
    metadata: Dict[str, str] = Field(default_factory=dict)

class BlueprintAnalysis(BaseModel):
    text: str
    components: List[Component] = Field(default_factory=list)
    issues: List[str] = Field(default_factory=list)
    page_count: Optional[int] = None
