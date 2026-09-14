import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select

from .auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from .db import create_db_and_tables, get_db
from .models import Problem, User, WrongQuestion
from .schemas import (
    ProblemCreate,
    ProblemPublic,
    ProblemUpdate,
    UserCreate,
    UserLogin,
    UserPublic,
    WrongQuestionCreate,
    WrongQuestionPublic,
    WrongQuestionUpdate,
)

COOKIE_NAME = "access_token"
COOKIE_MAX_AGE = 60 * 60 * 24 * 7  # 7 天（秒）


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="AlgoLift API", lifespan=lifespan)

# 允许带凭证的跨域（前端若单独托管时用到）；同源托管时本配置无害
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _auth_response(user: User, code: int = 200):
    """构造带 httpOnly Cookie 的登录态响应。

    注意：直接 return 模型 + response_model 时，response 参数上的 set_cookie
    不会被带进最终响应，所以这里用 JSONResponse 显式带 cookie，最稳。
    """
    token = create_access_token(user.id)
    content = UserPublic.model_validate(user).model_dump(mode="json")
    resp = JSONResponse(content=content, status_code=code)
    resp.set_cookie(
        COOKIE_NAME,
        token,
        httponly=True,  # JS 读不到，防 XSS 偷 token
        samesite="lax",  # 本地 http 同源跨端口可用，无需 Secure
        max_age=COOKIE_MAX_AGE,
    )
    return resp


# ---------------- 认证 ----------------
@app.post("/api/auth/register")
def register(data: UserCreate, db: Session = Depends(get_db)):
    exists = db.exec(
        select(User).where(
            (User.username == data.username) | (User.email == data.email)
        )
    ).first()
    if exists:
        raise HTTPException(status_code=400, detail="用户名或邮箱已存在")
    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _auth_response(user, 201)


@app.post("/api/auth/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.exec(select(User).where(User.username == data.username)).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    return _auth_response(user, 200)


@app.post("/api/auth/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME)
    return {"ok": True}


@app.get("/api/auth/me", response_model=UserPublic)
def me(user: User = Depends(get_current_user)):
    return user


# ---------------- 题目模块（隔离 CRUD）----------------
@app.get("/api/problems", response_model=list[ProblemPublic])
def list_problems(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    # 隔离：只返回当前用户的题目
    return db.exec(
        select(Problem)
        .where(Problem.user_id == user.id)
        .order_by(Problem.created_at.desc())
    ).all()


@app.post("/api/problems", response_model=ProblemPublic, status_code=201)
def create_problem(
    data: ProblemCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # 隔离：user_id 由后端从 JWT 取，前端不可伪造
    problem = Problem(user_id=user.id, **data.model_dump())
    db.add(problem)
    db.commit()
    db.refresh(problem)
    return problem


@app.get("/api/problems/{problem_id}", response_model=ProblemPublic)
def get_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    problem = db.get(Problem, problem_id)
    if not problem or problem.user_id != user.id:
        raise HTTPException(status_code=404, detail="题目不存在")
    return problem


@app.patch("/api/problems/{problem_id}", response_model=ProblemPublic)
def update_problem(
    problem_id: int,
    data: ProblemUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    problem = db.get(Problem, problem_id)
    if not problem or problem.user_id != user.id:
        raise HTTPException(status_code=404, detail="题目不存在")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(problem, key, value)
    problem.updated_at = datetime.now(timezone.utc)
    db.add(problem)
    db.commit()
    db.refresh(problem)
    return problem


@app.delete("/api/problems/{problem_id}")
def delete_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    problem = db.get(Problem, problem_id)
    if not problem or problem.user_id != user.id:
        raise HTTPException(status_code=404, detail="题目不存在")
    db.delete(problem)
    db.commit()
    return {"ok": True}


# ---------------- 错题本模块（隔离 CRUD，照题目模块模板复制）----------------
@app.get("/api/wrong-questions", response_model=list[WrongQuestionPublic])
def list_wrong_questions(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    return db.exec(
        select(WrongQuestion)
        .where(WrongQuestion.user_id == user.id)
        .order_by(WrongQuestion.created_at.desc())
    ).all()


@app.post("/api/wrong-questions", response_model=WrongQuestionPublic, status_code=201)
def create_wrong_question(
    data: WrongQuestionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # 隔离：user_id 由后端从 JWT 取，前端不可伪造
    wq = WrongQuestion(user_id=user.id, **data.model_dump())
    db.add(wq)
    db.commit()
    db.refresh(wq)
    return wq


@app.get("/api/wrong-questions/{wq_id}", response_model=WrongQuestionPublic)
def get_wrong_question(
    wq_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    wq = db.get(WrongQuestion, wq_id)
    if not wq or wq.user_id != user.id:
        raise HTTPException(status_code=404, detail="错题不存在")
    return wq


@app.patch("/api/wrong-questions/{wq_id}", response_model=WrongQuestionPublic)
def update_wrong_question(
    wq_id: int,
    data: WrongQuestionUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    wq = db.get(WrongQuestion, wq_id)
    if not wq or wq.user_id != user.id:
        raise HTTPException(status_code=404, detail="错题不存在")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(wq, key, value)
    wq.updated_at = datetime.now(timezone.utc)
    db.add(wq)
    db.commit()
    db.refresh(wq)
    return wq


@app.delete("/api/wrong-questions/{wq_id}")
def delete_wrong_question(
    wq_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    wq = db.get(WrongQuestion, wq_id)
    if not wq or wq.user_id != user.id:
        raise HTTPException(status_code=404, detail="错题不存在")
    db.delete(wq)
    db.commit()
    return {"ok": True}


# ---------------- 同源托管前端 ----------------
_frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.isdir(_frontend_dir):
    app.mount("/", StaticFiles(directory=_frontend_dir, html=True), name="frontend")
