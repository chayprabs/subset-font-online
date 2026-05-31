"""FontOps QA worker — FontBakery, OTS, TTX export, shaping checks (AGPL-3.0)."""

from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import tempfile
from enum import Enum
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field

app = FastAPI(title="FontOps Worker", version="1.0.0")

ALLOWED_ORIGINS = os.environ.get(
    "FONTOPS_CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS if o.strip()] or ["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

MAX_UPLOAD = 50_000_000


class CheckStatus(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    WARN = "WARN"
    SKIP = "SKIP"


class CheckItem(BaseModel):
    id: str
    status: CheckStatus
    message: str


class QAReport(BaseModel):
    profile: str
    checks: list[CheckItem] = Field(default_factory=list)


class ShapingItem(BaseModel):
    id: str
    label: str
    text: str
    status: CheckStatus
    message: str


def safe_dest(tmp: str, filename: str | None) -> Path:
    safe_name = Path(filename or "font.bin").name
    if not safe_name or safe_name in (".", ".."):
        safe_name = "font.bin"
    return Path(tmp) / safe_name


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/v1/qa", response_model=QAReport)
async def qa(
    file: UploadFile = File(...),
    profile: str = Form("googlefonts"),
) -> QAReport:
    checks: list[CheckItem] = []
    with tempfile.TemporaryDirectory(prefix="fontops-") as tmp:
        dest = safe_dest(tmp, file.filename)
        data = await file.read()
        if len(data) > MAX_UPLOAD:
            raise HTTPException(status_code=413, detail="File too large (max 50MB)")
        dest.write_bytes(data)

        checks.append(
            CheckItem(
                id="file-size",
                status=CheckStatus.PASS,
                message=f"Uploaded {len(data)} bytes",
            )
        )
        digest = hashlib.sha256(data).hexdigest()[:16]
        checks.append(CheckItem(id="sha256", status=CheckStatus.PASS, message=f"prefix {digest}"))

        ots = shutil.which("ots-sanitize")
        if ots:
            proc = subprocess.run(
                [ots, str(dest)],
                capture_output=True,
                text=True,
                timeout=90,
                check=False,
            )
            checks.append(
                CheckItem(
                    id="ots-sanitize",
                    status=CheckStatus.PASS if proc.returncode == 0 else CheckStatus.FAIL,
                    message=(proc.stderr or proc.stdout or "ok")[:500],
                )
            )
        else:
            checks.append(
                CheckItem(
                    id="ots-sanitize",
                    status=CheckStatus.SKIP,
                    message="ots-sanitize not installed",
                )
            )

        try:
            from fontTools.ttLib import TTFont

            font = TTFont(str(dest))
            glyph_count = len(font.getGlyphSet())
            checks.append(
                CheckItem(
                    id="fonttools-parse",
                    status=CheckStatus.PASS,
                    message=f"{glyph_count} glyphs",
                )
            )
            font.close()
        except Exception:
            checks.append(
                CheckItem(id="fonttools-parse", status=CheckStatus.FAIL, message="Parse failed")
            )

        fb = shutil.which("fontbakery")
        profile_flag = "googlefonts" if profile == "googlefonts" else "universal"
        if fb:
            proc = subprocess.run(
                [fb, f"check-{profile_flag}", str(dest), "-c", "family/win_ascent_and_descent"],
                capture_output=True,
                text=True,
                timeout=180,
                check=False,
            )
            checks.append(
                CheckItem(
                    id="fontbakery",
                    status=CheckStatus.PASS if proc.returncode == 0 else CheckStatus.WARN,
                    message=(proc.stdout or proc.stderr or "")[:800],
                )
            )
        else:
            checks.append(
                CheckItem(
                    id="fontbakery",
                    status=CheckStatus.SKIP,
                    message="fontbakery CLI not installed",
                )
            )

    return QAReport(profile=profile, checks=checks)


@app.post("/v1/ttx")
async def export_ttx(file: UploadFile = File(...)) -> PlainTextResponse:
    with tempfile.TemporaryDirectory(prefix="fontops-") as tmp:
        dest = safe_dest(tmp, file.filename)
        data = await file.read()
        if len(data) > MAX_UPLOAD:
            raise HTTPException(status_code=413, detail="File too large")
        dest.write_bytes(data)
        try:
            from fontTools.ttLib import TTFont

            font = TTFont(str(dest))
            ttx_path = dest.with_suffix(".ttx")
            font.saveXML(str(ttx_path))
            font.close()
            return PlainTextResponse(ttx_path.read_text(encoding="utf-8", errors="replace"))
        except Exception as exc:
            raise HTTPException(status_code=400, detail="TTX export failed") from exc


@app.post("/v1/shaping", response_model=list[ShapingItem])
async def shaping_check(file: UploadFile = File(...)) -> list[ShapingItem]:
    """Server-side cmap coverage check per script sample (complements browser canvas test)."""
    samples = [
        ("latin", "Latin", "Hello"),
        ("cyrillic", "Cyrillic", "Привет"),
        ("greek", "Greek", "Γειά"),
        ("arabic", "Arabic", "مرحبا"),
        ("thai", "Thai", "สวัสดี"),
        ("cjk", "CJK", "你好"),
    ]
    with tempfile.TemporaryDirectory(prefix="fontops-") as tmp:
        dest = safe_dest(tmp, file.filename)
        data = await file.read()
        if len(data) > MAX_UPLOAD:
            raise HTTPException(status_code=413, detail="File too large")
        dest.write_bytes(data)
        try:
            from fontTools.ttLib import TTFont

            font = TTFont(str(dest))
            cmap = font.getBestCmap() or {}
            font.close()
        except Exception:
            return [
                ShapingItem(
                    id=s[0],
                    label=s[1],
                    text=s[2],
                    status=CheckStatus.FAIL,
                    message="Font parse failed",
                )
                for s in samples
            ]

        out: list[ShapingItem] = []
        for sid, label, text in samples:
            missing = [c for c in text if ord(c) not in cmap and ord(c) > 31]
            if not missing:
                out.append(
                    ShapingItem(
                        id=sid,
                        label=label,
                        text=text,
                        status=CheckStatus.PASS,
                        message="All codepoints in cmap",
                    )
                )
            else:
                out.append(
                    ShapingItem(
                        id=sid,
                        label=label,
                        text=text,
                        status=CheckStatus.WARN,
                        message=f"Missing {len(missing)} codepoint(s) in cmap",
                    )
                )
        return out
