from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File, Header, Query, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
import uuid
import jwt
import bcrypt
import resend
import requests
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"
APP_NAME = "sineann"
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
storage_key = None

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------------- Auth helpers ----------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------- Storage helpers ----------------
def init_storage() -> str:
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple:
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

MIME_TYPES = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
              "gif": "image/gif", "webp": "image/webp"}


# ---------------- Email helper ----------------
async def send_email(to: str, subject: str, html: str) -> dict:
    api_key = os.environ.get("RESEND_API_KEY", "")
    if not api_key:
        logger.info(f"[EMAIL SKIPPED - no RESEND_API_KEY] to={to} subject={subject}")
        return {"status": "skipped"}
    try:
        resend.api_key = api_key
        params = {"from": os.environ.get("SENDER_EMAIL", "onboarding@resend.dev"),
                  "to": [to], "subject": subject, "html": html}
        result = await asyncio.to_thread(resend.Emails.send, params)
        return {"status": "sent", "id": result.get("id")}
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        return {"status": "error", "detail": str(e)}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------- Models ----------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Wine(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    name: str
    vintage: Optional[str] = ""
    varietal: Optional[str] = ""
    appellation: Optional[str] = ""
    vineyard: Optional[str] = ""
    tasting_notes: Optional[str] = ""
    production_notes: Optional[str] = ""
    price: Optional[str] = ""
    availability: Optional[str] = "Available"
    image_url: Optional[str] = ""
    label_image_url: Optional[str] = ""
    series: Optional[str] = "Estate"
    featured: bool = False
    order: int = 0
    created_at: str = Field(default_factory=now_iso)

class WineInput(BaseModel):
    slug: Optional[str] = None
    name: str
    vintage: Optional[str] = ""
    varietal: Optional[str] = ""
    appellation: Optional[str] = ""
    vineyard: Optional[str] = ""
    tasting_notes: Optional[str] = ""
    production_notes: Optional[str] = ""
    price: Optional[str] = ""
    availability: Optional[str] = "Available"
    image_url: Optional[str] = ""
    label_image_url: Optional[str] = ""
    series: Optional[str] = "Estate"
    featured: bool = False
    order: int = 0

class Post(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title: str
    excerpt: Optional[str] = ""
    body: Optional[str] = ""
    cover_image: Optional[str] = ""
    author: Optional[str] = "Sineann"
    published: bool = True
    published_at: str = Field(default_factory=now_iso)
    created_at: str = Field(default_factory=now_iso)

class PostInput(BaseModel):
    slug: Optional[str] = None
    title: str
    excerpt: Optional[str] = ""
    body: Optional[str] = ""
    cover_image: Optional[str] = ""
    author: Optional[str] = "Sineann"
    published: bool = True

class PageInput(BaseModel):
    content: Dict[str, Any]

class SubmissionInput(BaseModel):
    type: str = "general"
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    subject: Optional[str] = ""
    club_preference: Optional[str] = ""
    message: str

class NewsletterInput(BaseModel):
    email: EmailStr
    name: Optional[str] = ""


def slugify(text: str) -> str:
    s = "".join(c if c.isalnum() or c == " " else "" for c in text.lower()).strip()
    return "-".join(s.split())


# ---------------- Auth routes ----------------
@api_router.post("/auth/login")
async def login(payload: LoginRequest, response: Response) -> dict:
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    response.set_cookie(key="access_token", value=token, httponly=True, secure=True,
                        samesite="none", max_age=604800, path="/")
    return {"token": token, "user": {"id": user["id"], "email": user["email"],
                                     "name": user.get("name", "Admin"), "role": user.get("role", "admin")}}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"status": "ok"}

@api_router.get("/auth/me")
async def me(current=Depends(get_current_user)):
    return current


# ---------------- Wines ----------------
@api_router.get("/wines")
async def list_wines(featured: Optional[bool] = None, series: Optional[str] = None) -> list:
    q = {}
    if featured is not None:
        q["featured"] = featured
    if series:
        q["series"] = series
    wines = await db.wines.find(q, {"_id": 0}).sort("order", 1).to_list(500)
    return wines

@api_router.get("/wines/{slug}")
async def get_wine(slug: str) -> dict:
    wine = await db.wines.find_one({"slug": slug}, {"_id": 0})
    if not wine:
        raise HTTPException(status_code=404, detail="Wine not found")
    return wine

@api_router.post("/wines")
async def create_wine(payload: WineInput, current=Depends(get_current_user)):
    data = payload.model_dump()
    if not data.get("slug"):
        data["slug"] = slugify(f"{data['name']}-{data.get('vintage','')}")
    if await db.wines.find_one({"slug": data["slug"]}):
        data["slug"] = f"{data['slug']}-{str(uuid.uuid4())[:6]}"
    wine = Wine(**data)
    await db.wines.insert_one(wine.model_dump())
    return wine.model_dump()

@api_router.put("/wines/{wine_id}")
async def update_wine(wine_id: str, payload: WineInput, current=Depends(get_current_user)):
    existing = await db.wines.find_one({"id": wine_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Wine not found")
    data = payload.model_dump()
    if not data.get("slug"):
        data["slug"] = existing["slug"]
    await db.wines.update_one({"id": wine_id}, {"$set": data})
    return await db.wines.find_one({"id": wine_id}, {"_id": 0})

@api_router.delete("/wines/{wine_id}")
async def delete_wine(wine_id: str, current=Depends(get_current_user)):
    await db.wines.delete_one({"id": wine_id})
    return {"status": "deleted"}


# ---------------- Posts ----------------
@api_router.get("/posts")
async def list_posts(all: Optional[bool] = False):
    q = {} if all else {"published": True}
    posts = await db.posts.find(q, {"_id": 0}).sort("published_at", -1).to_list(500)
    return posts

@api_router.get("/posts/{slug}")
async def get_post(slug: str):
    post = await db.posts.find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@api_router.post("/posts")
async def create_post(payload: PostInput, current=Depends(get_current_user)):
    data = payload.model_dump()
    if not data.get("slug"):
        data["slug"] = slugify(data["title"])
    if await db.posts.find_one({"slug": data["slug"]}):
        data["slug"] = f"{data['slug']}-{str(uuid.uuid4())[:6]}"
    post = Post(**data)
    await db.posts.insert_one(post.model_dump())
    return post.model_dump()

@api_router.put("/posts/{post_id}")
async def update_post(post_id: str, payload: PostInput, current=Depends(get_current_user)):
    existing = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    data = payload.model_dump()
    if not data.get("slug"):
        data["slug"] = existing["slug"]
    await db.posts.update_one({"id": post_id}, {"$set": data})
    return await db.posts.find_one({"id": post_id}, {"_id": 0})

@api_router.delete("/posts/{post_id}")
async def delete_post(post_id: str, current=Depends(get_current_user)):
    await db.posts.delete_one({"id": post_id})
    return {"status": "deleted"}


# ---------------- Pages (editable content blocks) ----------------
@api_router.get("/pages")
async def list_pages(current=Depends(get_current_user)):
    return await db.pages.find({}, {"_id": 0}).to_list(100)

@api_router.get("/pages/{key}")
async def get_page(key: str):
    page = await db.pages.find_one({"key": key}, {"_id": 0})
    if not page:
        return {"key": key, "content": {}}
    return page

@api_router.put("/pages/{key}")
async def update_page(key: str, payload: PageInput, current=Depends(get_current_user)):
    await db.pages.update_one({"key": key},
                              {"$set": {"key": key, "content": payload.content, "updated_at": now_iso()}},
                              upsert=True)
    return await db.pages.find_one({"key": key}, {"_id": 0})


# ---------------- Submissions ----------------
@api_router.post("/submissions")
async def create_submission(payload: SubmissionInput):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["read"] = False
    doc["created_at"] = now_iso()
    await db.submissions.insert_one(doc)
    notify = os.environ.get("ADMIN_NOTIFY_EMAIL", "")
    if notify:
        html = f"""<table style="font-family:Arial,sans-serif;color:#222"><tr><td>
        <h2>New {doc['type']} inquiry</h2>
        <p><b>Name:</b> {doc['name']}</p>
        <p><b>Email:</b> {doc['email']}</p>
        <p><b>Phone:</b> {doc.get('phone','')}</p>
        <p><b>Subject:</b> {doc.get('subject','')}</p>
        {f"<p><b>Club preference:</b> {doc['club_preference']}</p>" if doc.get('club_preference') else ""}
        <p><b>Message:</b><br/>{doc['message']}</p>
        </td></tr></table>"""
        await send_email(notify, f"Sineann: new {doc['type']} inquiry from {doc['name']}", html)
    return {"status": "ok", "id": doc["id"]}

@api_router.get("/submissions")
async def list_submissions(current=Depends(get_current_user)):
    return await db.submissions.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)

@api_router.patch("/submissions/{sub_id}/read")
async def mark_read(sub_id: str, current=Depends(get_current_user)):
    await db.submissions.update_one({"id": sub_id}, {"$set": {"read": True}})
    return {"status": "ok"}

@api_router.delete("/submissions/{sub_id}")
async def delete_submission(sub_id: str, current=Depends(get_current_user)):
    await db.submissions.delete_one({"id": sub_id})
    return {"status": "deleted"}


# ---------------- Newsletter ----------------
@api_router.post("/newsletter")
async def newsletter_signup(payload: NewsletterInput):
    email = payload.email.lower()
    existing = await db.newsletter.find_one({"email": email})
    if existing:
        return {"status": "already_subscribed"}
    doc = {"id": str(uuid.uuid4()), "email": email, "name": payload.name, "created_at": now_iso()}
    await db.newsletter.insert_one(doc)
    notify = os.environ.get("ADMIN_NOTIFY_EMAIL", "")
    if notify:
        await send_email(notify, "Sineann: new newsletter signup",
                         f"<p>New subscriber: {email}</p>")
    return {"status": "subscribed"}

@api_router.get("/newsletter")
async def list_newsletter(current=Depends(get_current_user)):
    return await db.newsletter.find({}, {"_id": 0}).sort("created_at", -1).to_list(2000)


# ---------------- Media ----------------
@api_router.post("/media/upload")
async def upload_media(file: UploadFile = File(...), current=Depends(get_current_user)):
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "bin"
    path = f"{APP_NAME}/media/{uuid.uuid4()}.{ext}"
    data = await file.read()
    content_type = MIME_TYPES.get(ext, file.content_type or "application/octet-stream")
    result = await asyncio.to_thread(put_object, path, data, content_type)
    backend_url = os.environ.get("FRONTEND_URL", "")
    doc = {"id": str(uuid.uuid4()), "storage_path": result["path"],
           "original_filename": file.filename, "content_type": content_type,
           "size": result.get("size", len(data)), "is_deleted": False, "created_at": now_iso()}
    await db.media.insert_one(doc)
    doc.pop("_id", None)
    doc["url"] = f"{backend_url}/api/files/{result['path']}"
    return doc

@api_router.get("/media")
async def list_media(current=Depends(get_current_user)):
    items = await db.media.find({"is_deleted": False}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    backend_url = os.environ.get("FRONTEND_URL", "")
    for it in items:
        it["url"] = f"{backend_url}/api/files/{it['storage_path']}"
    return items

@api_router.delete("/media/{media_id}")
async def delete_media(media_id: str, current=Depends(get_current_user)):
    await db.media.update_one({"id": media_id}, {"$set": {"is_deleted": True}})
    return {"status": "deleted"}

@api_router.get("/files/{path:path}")
async def download_file(path: str):
    record = await db.media.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = await asyncio.to_thread(get_object, path)
    return Response(content=data, media_type=record.get("content_type", content_type))


@api_router.get("/")
async def root():
    return {"message": "Sineann Winery API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- Seeding ----------------
IMG = {
    "logo": "https://static.prod-images.emergentagent.com/jobs/867d0ff3-124f-4696-8f78-054541efb08c/images/4feb1b9d537e06de4d2cc7998b0cd375fa81647ea8c55fd12d2aef00440a2d57.png",
    "estate_red": "https://static.prod-images.emergentagent.com/jobs/867d0ff3-124f-4696-8f78-054541efb08c/images/a32467ef3419149eb007db8cd06950ee13ad96d4cec1a52bfa7581a3d19cbdd3.png",
    "estate_white": "https://static.prod-images.emergentagent.com/jobs/867d0ff3-124f-4696-8f78-054541efb08c/images/8e0916e86da82ab5415c39807d6a6b53d82774929b852ea8122ebcb365b92eb6.png",
    "train": "https://static.prod-images.emergentagent.com/jobs/867d0ff3-124f-4696-8f78-054541efb08c/images/c9760923be1bc2d8ae0ef7b02775e0f5d89d696717e7dc7223cb0e0a11848f37.png",
    "label": "https://static.prod-images.emergentagent.com/jobs/867d0ff3-124f-4696-8f78-054541efb08c/images/88c1a025feabf91a3e6d74e0c889e67287ee00e99c149b57124077412e85867a.png",
    "cellar": "https://images.unsplash.com/photo-1724082111671-eb2a4c01d40d",
    "detail": "https://images.unsplash.com/photo-1561461056-77634126673a",
    "graffiti": "https://images.unsplash.com/photo-1648154008739-bd1b8cbb9074",
}

SEED_WINES = [
    {"slug": "celtic-oak-cabernet-2021", "name": "Celtic Oak Cabernet Sauvignon", "vintage": "2021",
     "varietal": "Cabernet Sauvignon", "appellation": "Columbia Valley", "vineyard": "Champoux Vineyard",
     "tasting_notes": "Deep and brooding, with cassis, black cherry, cedar and a whisper of graphite. Fine-grained tannins carry a long, savory finish.",
     "production_notes": "Aged 20 months in French oak, 40% new. Native yeast fermentation.",
     "price": "$58", "availability": "Available", "image_url": IMG["estate_red"], "label_image_url": IMG["label"],
     "series": "Estate", "featured": True, "order": 1},
    {"slug": "aurora-pinot-gris-2023", "name": "Aurora Pinot Gris", "vintage": "2023",
     "varietal": "Pinot Gris", "appellation": "Willamette Valley", "vineyard": "Estate Block",
     "tasting_notes": "Bright and mineral-driven with white peach, pear skin and a saline lift. Crisp, textural and food-friendly.",
     "production_notes": "Whole-cluster pressed, stainless fermented, aged on fine lees.",
     "price": "$32", "availability": "Available", "image_url": IMG["estate_white"], "label_image_url": IMG["label"],
     "series": "Estate", "featured": True, "order": 2},
    {"slug": "grand-reserve-syrah-2020", "name": "Grand Réserve Syrah", "vintage": "2020",
     "varietal": "Syrah", "appellation": "Walla Walla Valley", "vineyard": "Old Vine Rocks District",
     "tasting_notes": "Smoked meat, violets, blackberry and cracked pepper. Full-bodied yet lifted, with a lingering mineral core.",
     "production_notes": "Co-fermented with 5% Viognier. Aged 22 months in neutral French oak.",
     "price": "$64", "availability": "Limited", "image_url": IMG["estate_red"], "label_image_url": IMG["label"],
     "series": "Estate", "featured": True, "order": 3},
    {"slug": "urban-rebel-red-2022", "name": "Urban Rebel Red — Artist Series No.1", "vintage": "2022",
     "varietal": "Red Blend", "appellation": "Columbia Valley", "vineyard": "Multiple Estate Blocks",
     "tasting_notes": "A bold, expressive blend bursting with ripe plum, mocha and spice. Approachable, generous and made to share.",
     "production_notes": "Cabernet, Merlot and Syrah blend. Label art by a commissioned street artist under signed permission.",
     "price": "$46", "availability": "Available", "image_url": IMG["train"], "label_image_url": IMG["train"],
     "series": "Train Graffiti", "featured": True, "order": 4},
    {"slug": "midnight-line-malbec-2022", "name": "Midnight Line Malbec — Artist Series No.2", "vintage": "2022",
     "varietal": "Malbec", "appellation": "Columbia Valley", "vineyard": "Stone Ridge",
     "tasting_notes": "Inky and plush with blueberry, cocoa and violet. Velvet tannins and a graffiti-bright finish.",
     "production_notes": "Second release in the Train Graffiti Art Series. Original artwork celebrates railway street culture.",
     "price": "$48", "availability": "Available", "image_url": IMG["train"], "label_image_url": IMG["train"],
     "series": "Train Graffiti", "featured": False, "order": 5},
    {"slug": "estate-chardonnay-2022", "name": "Estate Chardonnay", "vintage": "2022",
     "varietal": "Chardonnay", "appellation": "Willamette Valley", "vineyard": "Estate Hillside",
     "tasting_notes": "Elegant and restrained — Meyer lemon, hazelnut and crushed stone with a creamy, understated finish.",
     "production_notes": "Barrel fermented, 15% new oak, full malolactic. Aged 11 months sur lie.",
     "price": "$38", "availability": "Available", "image_url": IMG["estate_white"], "label_image_url": IMG["label"],
     "series": "Estate", "featured": False, "order": 6},
]

SEED_POSTS = [
    {"slug": "spring-release-2026", "title": "Spring 2026 Release: The Estate Collection Arrives",
     "excerpt": "Our newest estate bottlings are ready for the table — here's what's pouring this season.",
     "body": "We are thrilled to announce the Spring 2026 release of our estate wines. This year's growing season rewarded patience with wines of remarkable balance and depth.\n\nThe Celtic Oak Cabernet leads the release, followed by the mineral-driven Aurora Pinot Gris. Wine Club members receive first access before wines are offered to the public.\n\nVisit us this weekend or reach out to reserve your allocation.",
     "cover_image": IMG["cellar"], "author": "The Winemaker"},
    {"slug": "story-behind-train-graffiti", "title": "The Story Behind the Train Graffiti Art Series",
     "excerpt": "How a chance encounter with railway street art became one of our most talked-about collections.",
     "body": "Label art has always been part of Sineann's character. The Train Graffiti Art Series began with a simple idea: to celebrate the raw, kinetic energy of railway street art alongside wines meant to be shared.\n\nEach label in the series features original artwork created under signed permission from the artists. The result is a collection that feels current and expressive while honoring our long-standing commitment to craft.\n\nHeritage first, current collection second — that balance defines everything we do.",
     "cover_image": IMG["graffiti"], "author": "Sineann Studio"},
    {"slug": "a-note-on-celtic-heritage", "title": "A Note on Our Celtic Heritage",
     "excerpt": "The knotwork on our labels is more than decoration — it's a thread that runs through our identity.",
     "body": "The subtle Celtic knot that appears across our labels and this website is a quiet nod to the heritage woven into the Sineann name. We keep it restrained by design — heritage texture, not spectacle.\n\nIt reminds us that great wine is a continuous thread: vineyard to cellar, vintage to vintage, table to table.",
     "cover_image": IMG["label"], "author": "Sineann"},
]

SEED_PAGES = {
    "home": {
        "hero_overline": "Established 1878 · Estate Grown",
        "hero_title": "Wines woven from heritage & craft",
        "hero_subtitle": "Vineyard-driven winemaking meant to be shared around the table. A long-standing identity, quietly distinctive.",
        "intro_overline": "Our Approach",
        "intro_title": "Patient winemaking, honest fruit",
        "intro_body": "For generations, Sineann has followed a simple conviction: exceptional wine begins in the vineyard and is finished with restraint. We farm for balance, ferment with native yeasts, and let each site speak clearly. The result is a portfolio that feels both established and alive.",
    },
    "story": {
        "overline": "Our Story",
        "title": "A continuous thread, vintage to vintage",
        "body": "Sineann (shuh‑NAY‑uhn) is a small winery dedicated to crafting intensely expressive wines from the region’s finest vineyards. Nearly all our bottlings are single‑vineyard wines, grown at low crop levels so the character of the varietal and its terroir can shine.\n\nWe take a meticulous, minimalist approach in the cellar—gentle handling, careful fermentations, and aging in French oak—to preserve the individuality of each wine. The result is a portfolio that reflects both the skill of our growers and the pride we take in every bottle.\n\nAt the end of the day, we make the kind of wine we want on our own dinner table. We believe that food and wine, thoughtfully made and shared, bring people together and make life a little happier.",
        "label_history_title": "A light-touch label history",
        "label_history_body": "Label design has always been part of Sineann's personality. From engraved heritage crests to the bold artwork of our current series, each label marks a chapter in an evolving creative history.",
    },
    "visit": {
        "overline": "Visit",
        "title": "Sit with us a while",
        "body": "Our tasting room welcomes guests by appointment and on select weekends. Come taste current releases, walk the estate, and hear the stories behind the labels.",
        "hours": "Fri – Sun · 11am – 5pm\nWeekday visits by appointment",
        "address": "8400 Champoeg Rd.\nSt Paul, OR 97137",
        "phone": "(503) 341-2698",
    },
    "wineclub": {
        "overline": "Wine Club",
        "title": "Join the table",
        "body": "Membership is the best way to experience Sineann. Members receive first access to new releases, member pricing, and invitations to estate events.",
        "reds_title": "Reds Only",
        "reds_body": "For lovers of structure and depth. Two shipments per year featuring our estate reds and Artist Series releases.",
        "all_title": "All Wines",
        "all_body": "The full Sineann experience across reds and whites. Two to three shipments per year, curated by the winemaker.",
        "benefits": "First access to new releases\nMember pricing on all wines\nComplimentary tastings for members & guests\nInvitations to release events",
    },
    "howtobuy": {
        "overline": "How to Buy",
        "title": "Direct, personal, by inquiry",
        "body": "We sell our wines directly through personal inquiry rather than a checkout cart. Tell us what you're after — a specific bottle, a case, or a gift — and we'll be in touch to arrange it.",
    },
    "train": {
        "nav_label": "Art Series",
        "overline": "Current Feature",
        "title": "The Train Graffiti Art Series",
        "subtitle": "Railway street art meets estate winemaking",
        "hero_image": "https://images.unsplash.com/photo-1648154008739-bd1b8cbb9074",
        "series_filter": "Train Graffiti",
        "body": "The Train Graffiti Art Series is a current, expressive line within the broader Sineann story. Each release pairs bold, original label artwork — created under signed permission from the artists — with approachable, generous wines made to be shared.\n\nIt's a celebration of label art as part of our creative history: current and interesting, but never louder than the winery itself.",
    },
    "contact": {
        "overline": "Contact",
        "title": "Start a conversation",
        "body": "Whether you're inquiring about a purchase, the Wine Club, or planning a visit, we'd love to hear from you.",
        "email": "hello@sineann.com",
        "phone": "(503) 341-2698",
    },
}


@app.on_event("startup")
async def startup() -> None:
    # storage
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    # indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id")
    await db.wines.create_index("slug", unique=True)
    await db.posts.create_index("slug", unique=True)
    await db.pages.create_index("key", unique=True)
    # admin seed
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@sineann.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({"id": str(uuid.uuid4()), "email": admin_email,
                                   "password_hash": hash_password(admin_password),
                                   "name": "Admin", "role": "admin", "created_at": now_iso()})
        logger.info("Admin seeded")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_password)}})
    # content seed
    if await db.wines.count_documents({}) == 0:
        for w in SEED_WINES:
            await db.wines.insert_one(Wine(**w).model_dump())
        logger.info("Wines seeded")
    if await db.posts.count_documents({}) == 0:
        for p in SEED_POSTS:
            await db.posts.insert_one(Post(**p).model_dump())
        logger.info("Posts seeded")
    for key, content in SEED_PAGES.items():
        if await db.pages.find_one({"key": key}) is None:
            await db.pages.insert_one({"key": key, "content": content, "updated_at": now_iso()})


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

