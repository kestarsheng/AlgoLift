from datetime import datetime, timezone
from typing import Optional

from sqlmodel import SQLModel, Field


def _now() -> datetime:
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str  # 只存 bcrypt 哈希，绝不存明文
    created_at: datetime = Field(default_factory=_now)


class Problem(SQLModel, table=True):
    """题目模块 —— MVP 的第一个隔离试验田，后续 7 个模块照此复制。"""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="user.id")  # 隔离的核心字段
    title: str = Field(index=True)
    difficulty: str = "medium"  # easy | medium | hard
    category: str = ""
    url: str = ""
    notes: str = ""
    status: str = "todo"  # todo | doing | done
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)


class WrongQuestion(SQLModel, table=True):
    """错题本模块 —— 套用题目(problems)模块的隔离模板复制而来。"""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="user.id")  # 隔离的核心字段
    title: str = Field(index=True)  # 题目标题
    source: str = ""  # 来源，如 LeetCode #1 / 牛客
    wrong_reason: str = ""  # 错误原因
    correct_solution: str = ""  # 正确解法
    review_count: int = 0  # 复盘次数
    mastered: bool = False  # 是否已掌握
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)
