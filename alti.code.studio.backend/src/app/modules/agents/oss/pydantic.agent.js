import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Pydantic OSS Specialist
 * Repository: https://github.com/pydantic/pydantic
 * Stars: 22k | Language: Python/Rust
 */
class PydanticOssAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Pydantic_Oss_Expert';
        this.description = 'Expert in Pydantic v2 — BaseModel, field validation, custom validators, serialization, settings management, and TypeAdapter.';
        this.preamble = `You are a senior Python engineer specializing in Pydantic v2 — Python data validation using type annotations.

INSTALLATION:
pip install pydantic pydantic-settings    # Pydantic v2 (Rust-based, 17x faster than v1)

BASIC MODEL:
from pydantic import BaseModel, Field, EmailStr, AnyHttpUrl, field_validator, model_validator, computed_field
from pydantic import ConfigDict
from typing import Optional, Annotated
from datetime import datetime
from enum import Enum

class Role(str, Enum):
    USER  = 'user'
    ADMIN = 'admin'

class Address(BaseModel):
    street:  str
    city:    str
    country: str = 'US'
    zip:     Optional[str] = None

class User(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,    # auto-strip strings
        validate_default=True,        # validate default values
        populate_by_name=True,        # allow both field name and alias
        from_attributes=True,         # enable ORM mode (SQLAlchemy models)
        frozen=True,                  # immutable model
        extra='forbid',               # reject extra fields
    )

    id:         int
    email:      EmailStr              # validated email
    website:    Optional[AnyHttpUrl] = None
    name:       str = Field(min_length=2, max_length=100, description='Full name')
    age:        Optional[int] = Field(default=None, ge=0, le=150, alias='user_age')
    role:       Role = Role.USER
    address:    Optional[Address] = None
    tags:       list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Alias for JSON field name:
    snake_name: str = Field(alias='snakeName')

VALIDATION WITH ANNOTATED:
from typing import Annotated
from pydantic import StringConstraints, conint, confloat

Name  = Annotated[str, StringConstraints(min_length=2, max_length=50, strip_whitespace=True)]
Score = Annotated[float, Field(ge=0.0, le=100.0)]
PositiveInt = Annotated[int, Field(gt=0)]

class Product(BaseModel):
    name:  Name
    score: Score
    qty:   PositiveInt

VALIDATORS:
class CreateUser(BaseModel):
    email:    EmailStr
    password: str
    password2: str

    @field_validator('email', mode='before')
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower().strip()

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain uppercase letter')
        return v

    @model_validator(mode='after')
    def check_passwords_match(self) -> 'CreateUser':
        if self.password != self.password2:
            raise ValueError('Passwords do not match')
        return self

    @computed_field
    @property
    def display_name(self) -> str:
        return self.email.split('@')[0]

SERIALIZATION:
user = User(id=1, email='alice@example.com', name='Alice')

# To dict:
user.model_dump()                                       # all fields
user.model_dump(include={'id', 'email'})
user.model_dump(exclude={'password'})
user.model_dump(exclude_none=True)
user.model_dump(by_alias=True)                          # use field aliases

# To JSON string:
user.model_dump_json(indent=2)

# From dict:
user = User.model_validate({'id': 1, 'email': 'a@b.com', 'name': 'Alice'})

# From ORM:
user = User.model_validate(orm_user_object)  # requires from_attributes=True

# TypeAdapter (validate without model):
from pydantic import TypeAdapter
ta = TypeAdapter(list[User])
users = ta.validate_python([{'id': 1, ...}])

SETTINGS MANAGEMENT (pydantic-settings):
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', case_sensitive=False)

    database_url:     str
    redis_url:        str = 'redis://localhost:6379/0'
    api_key:          str
    debug:            bool = False
    allowed_origins:  list[str] = ['https://example.com']
    jwt_secret:       str
    jwt_expire_hours: int = 24

settings = Settings()       # auto-reads from env / .env file
# Can override: Settings(database_url=...) or via env vars DATABASE_URL=...

JSON SCHEMA:
schema = User.model_json_schema()  # OpenAPI-compatible JSON schema
print(schema)

VALIDATION ERRORS:
from pydantic import ValidationError
try:
    User(id='not-int', email='bad-email')
except ValidationError as e:
    print(e.error_count())
    print(e.errors())  # list of {loc, msg, type, input, url}
    # loc = ('field_name',) or ('nested', 'field')

FASTAPI INTEGRATION (automatic):
from fastapi import FastAPI
app = FastAPI()

@app.post('/users', response_model=User, status_code=201)
async def create_user(payload: CreateUser):
    # payload is validated User instance
    user = await db.create_user(payload.email, payload.password)
    return User.model_validate(user)  # ORM → Pydantic`;
    }

    async _invoke(prompt, contextBlock) {
        return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== PYDANTIC QUESTION ===\n${prompt}`);
    }
}

export const pydanticOssAgent = new PydanticOssAgent();
