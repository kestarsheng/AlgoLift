from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel


class UserCreate(SQLModel):
    username: str
    email: str
    password: str


class UserLogin(SQLModel):
    username: str
    password: str


class UserPublic(SQLModel):
    id: int
    username: str
    email: str
    created_at: datetime


class ProblemCreate(SQLModel):
    title: str
    difficulty: str = "medium"
    category: str = ""
    url: str = ""
    notes: str = ""
    status: str = "todo"


class ProblemUpdate(SQLModel):
    """部分更新：所有字段可选，只改前端传回来的那几个。"""

    title: Optional[str] = None
    difficulty: Optional[str] = None
    category: Optional[str] = None
    url: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class ProblemPublic(SQLModel):
    id: int
    user_id: int
    title: str
    difficulty: str
    category: str
    url: str
    notes: str
    status: str
    created_at: datetime
    updated_at: datetime


class WrongQuestionCreate(SQLModel):
    title: str
    source: str = ""
    wrong_reason: str = ""
    correct_solution: str = ""
    review_count: int = 0
    mastered: bool = False


class WrongQuestionUpdate(SQLModel):
    """部分更新：所有字段可选，只改前端传回来的那几个。"""

    title: Optional[str] = None
    source: Optional[str] = None
    wrong_reason: Optional[str] = None
    correct_solution: Optional[str] = None
    review_count: Optional[int] = None
    mastered: Optional[bool] = None


class WrongQuestionPublic(SQLModel):
    id: int
    user_id: int
    title: str
    source: str
    wrong_reason: str
    correct_solution: str
    review_count: int
    mastered: bool
    created_at: datetime
    updated_at: datetime
