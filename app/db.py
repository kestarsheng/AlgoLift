import os

from sqlmodel import SQLModel, Session, create_engine

# 用环境变量驱动：默认本地 SQLite，换 Postgres 只改 DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./algolift.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)


def create_db_and_tables() -> None:
    """应用启动时建表（MVP 阶段手写建表，后续可换 Alembic）。"""
    SQLModel.metadata.create_all(engine)


def get_db():
    """FastAPI 依赖：每个请求一个 Session，用完自动关闭。"""
    with Session(engine) as session:
        yield session
