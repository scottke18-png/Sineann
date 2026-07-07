"""Backend API tests for Sineann Winery."""
import os
import io
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://vineyard-heritage-1.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@sineann.com"
ADMIN_PASSWORD = "Sineann2026!"


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(api):
    r = api.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and data["user"]["email"] == ADMIN_EMAIL
    return data["token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------------- Health / Auth ----------------
class TestHealthAndAuth:
    def test_root(self, api):
        r = api.get(f"{API}/")
        assert r.status_code == 200
        assert "Sineann" in r.json()["message"]

    def test_login_invalid(self, api):
        r = api.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongpass"})
        assert r.status_code == 401

    def test_login_success_returns_token_and_user(self, api):
        r = api.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d["token"], str) and len(d["token"]) > 20
        assert d["user"]["role"] == "admin"

    def test_me_requires_auth(self, api):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_with_bearer(self, auth_headers):
        r = requests.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL


# ---------------- Wines ----------------
class TestWines:
    def test_list_wines_seeded(self, api):
        r = api.get(f"{API}/wines")
        assert r.status_code == 200
        wines = r.json()
        assert isinstance(wines, list) and len(wines) >= 6
        # ensure _id not returned
        for w in wines:
            assert "_id" not in w
            assert "id" in w and "slug" in w

    def test_list_wines_featured_filter(self, api):
        r = api.get(f"{API}/wines", params={"featured": "true"})
        assert r.status_code == 200
        wines = r.json()
        assert len(wines) >= 3
        assert all(w["featured"] for w in wines)

    def test_list_wines_series_filter(self, api):
        r = api.get(f"{API}/wines", params={"series": "Train Graffiti"})
        assert r.status_code == 200
        wines = r.json()
        assert all(w["series"] == "Train Graffiti" for w in wines)
        assert len(wines) >= 1

    def test_get_wine_by_slug(self, api):
        r = api.get(f"{API}/wines/old-vine-zinfandel-2024")
        assert r.status_code == 200
        assert r.json()["varietal"].lower().startswith("zinfandel")

    def test_get_wine_not_found(self, api):
        r = api.get(f"{API}/wines/nonexistent-slug-xyz")
        assert r.status_code == 404

    def test_create_wine_requires_auth(self, api):
        r = api.post(f"{API}/wines", json={"name": "TEST Wine"})
        assert r.status_code == 401

    def test_wine_crud_flow(self, auth_headers):
        payload = {"name": f"TEST_Wine_{uuid.uuid4().hex[:6]}", "vintage": "2024",
                   "varietal": "Merlot", "price": "$40", "series": "Estate", "featured": False}
        # Create
        r = requests.post(f"{API}/wines", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        w = r.json()
        wine_id = w["id"]
        assert w["name"] == payload["name"] and w["slug"]

        # Verify via GET by slug
        g = requests.get(f"{API}/wines/{w['slug']}")
        assert g.status_code == 200 and g.json()["id"] == wine_id

        # Update
        upd = {**payload, "name": payload["name"] + " Updated", "price": "$50"}
        r = requests.put(f"{API}/wines/{wine_id}", json=upd, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["price"] == "$50"
        assert "Updated" in r.json()["name"]

        # Delete
        r = requests.delete(f"{API}/wines/{wine_id}", headers=auth_headers)
        assert r.status_code == 200
        # Confirm gone
        g = requests.get(f"{API}/wines/{w['slug']}")
        assert g.status_code == 404


# ---------------- Posts ----------------
class TestPosts:
    def test_list_posts(self, api):
        r = api.get(f"{API}/posts")
        assert r.status_code == 200 and len(r.json()) >= 3

    def test_get_post_by_slug(self, api):
        r = api.get(f"{API}/posts/spring-release-2026")
        assert r.status_code == 200
        assert "body" in r.json() and len(r.json()["body"]) > 0

    def test_post_crud_flow(self, auth_headers):
        payload = {"title": f"TEST_Post_{uuid.uuid4().hex[:6]}",
                   "excerpt": "test", "body": "test body", "published": True}
        r = requests.post(f"{API}/posts", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        p = r.json()
        pid = p["id"]

        # Get by slug
        g = requests.get(f"{API}/posts/{p['slug']}")
        assert g.status_code == 200

        # Update
        r = requests.put(f"{API}/posts/{pid}", json={**payload, "title": payload["title"] + " Upd"},
                         headers=auth_headers)
        assert r.status_code == 200 and "Upd" in r.json()["title"]

        # Delete
        r = requests.delete(f"{API}/posts/{pid}", headers=auth_headers)
        assert r.status_code == 200


# ---------------- Pages ----------------
class TestPages:
    def test_get_home_page_public(self, api):
        r = api.get(f"{API}/pages/home")
        assert r.status_code == 200
        assert "content" in r.json()

    def test_list_pages_requires_auth(self):
        r = requests.get(f"{API}/pages")
        assert r.status_code == 401

    def test_list_pages_auth(self, auth_headers):
        r = requests.get(f"{API}/pages", headers=auth_headers)
        assert r.status_code == 200 and isinstance(r.json(), list)

    def test_update_page(self, auth_headers):
        # Non-destructive: read current content, add/modify a marker field, PUT full doc back
        orig = requests.get(f"{API}/pages/home").json()["content"]
        marker_value = f"TEST_marker_{uuid.uuid4().hex[:6]}"
        merged = {**orig, "test_marker": marker_value}
        r = requests.put(f"{API}/pages/home", json={"content": merged}, headers=auth_headers)
        assert r.status_code == 200
        g = requests.get(f"{API}/pages/home")
        assert g.status_code == 200
        assert g.json()["content"]["test_marker"] == marker_value
        # Restore original content (drop test_marker) so live UI is not polluted
        restore = requests.put(f"{API}/pages/home", json={"content": orig}, headers=auth_headers)
        assert restore.status_code == 200
        assert "test_marker" not in restore.json()["content"]


# ---------------- Submissions ----------------
class TestSubmissions:
    _created_id = None

    def test_submission_create_public(self, api):
        payload = {"type": "general", "name": "TEST User",
                   "email": "test_sub@example.com", "message": "Hello"}
        r = api.post(f"{API}/submissions", json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "ok" and "id" in d
        TestSubmissions._created_id = d["id"]

    def test_submission_list_requires_auth(self):
        r = requests.get(f"{API}/submissions")
        assert r.status_code == 401

    def test_submission_list_and_mark_and_delete(self, auth_headers):
        r = requests.get(f"{API}/submissions", headers=auth_headers)
        assert r.status_code == 200
        subs = r.json()
        assert any(s["id"] == TestSubmissions._created_id for s in subs)

        # Mark read
        r = requests.patch(f"{API}/submissions/{TestSubmissions._created_id}/read", headers=auth_headers)
        assert r.status_code == 200

        # Verify read=True
        r = requests.get(f"{API}/submissions", headers=auth_headers)
        target = next(s for s in r.json() if s["id"] == TestSubmissions._created_id)
        assert target["read"] is True

        # Delete
        r = requests.delete(f"{API}/submissions/{TestSubmissions._created_id}", headers=auth_headers)
        assert r.status_code == 200


# ---------------- Newsletter ----------------
class TestNewsletter:
    def test_newsletter_signup(self, api):
        email = f"test_{uuid.uuid4().hex[:6]}@example.com"
        r = api.post(f"{API}/newsletter", json={"email": email, "name": "T"})
        assert r.status_code == 200 and r.json()["status"] == "subscribed"
        # Duplicate
        r2 = api.post(f"{API}/newsletter", json={"email": email})
        assert r2.status_code == 200 and r2.json()["status"] == "already_subscribed"

    def test_newsletter_list_requires_auth(self):
        r = requests.get(f"{API}/newsletter")
        assert r.status_code == 401

    def test_newsletter_list_auth(self, auth_headers):
        r = requests.get(f"{API}/newsletter", headers=auth_headers)
        assert r.status_code == 200 and isinstance(r.json(), list)


# ---------------- Media ----------------
class TestMedia:
    def test_media_upload_requires_auth(self):
        files = {"file": ("test.png", b"\x89PNG\r\n\x1a\n" + b"0" * 20, "image/png")}
        r = requests.post(f"{API}/media/upload", files=files)
        assert r.status_code == 401

    def test_media_upload_and_list(self, token):
        headers = {"Authorization": f"Bearer {token}"}
        files = {"file": ("test.png", b"\x89PNG\r\n\x1a\n" + b"0" * 40, "image/png")}
        r = requests.post(f"{API}/media/upload", files=files, headers=headers)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["url"].endswith(d["storage_path"])
        assert "/api/files/" in d["url"]

        # List should include it
        r = requests.get(f"{API}/media", headers=headers)
        assert r.status_code == 200
        assert any(m["storage_path"] == d["storage_path"] for m in r.json())

        # Download the file publicly
        r = requests.get(d["url"])
        assert r.status_code == 200
        assert r.headers.get("Content-Type", "").startswith("image/")
