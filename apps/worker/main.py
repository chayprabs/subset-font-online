"""FontOps QA worker — optional FontBakery-style checks (AGPL-3.0)."""

from __future__ import annotations

import hashlib
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="FontOps Worker", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class CheckItem(BaseModel):
    id: str
    status: str
    message: str


class QAReport(BaseModel):
    profile: str
    checks: list[CheckItem]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/v1/qa", response_model=QAReport)
async def qa(file: UploadFile = File(...)) -> QAReport:
    checks: list[CheckItem] = []
    with tempfile.TemporaryDirectory(prefix="fontops-") as tmp:
        safe_name = Path(file.filename or "font.bin").name
        if not safe_name or safe_name in (".", ".."):
            safe_name = "font.bin"
        dest = Path(tmp) / safe_name
        data = await file.read()
        if len(data) > 50_000_000:
            from fastapi import HTTPException

            raise HTTPException(status_code=413, detail="File too large (max 50MB)")
        dest.write_bytes(data)
        size = len(data)
        checks.append(
            CheckItem(
                id="file-size",
                status="PASS" if size < 50_000_000 else "WARN",
                message=f"Uploaded {size} bytes",
            )
        )
        digest = hashlib.sha256(data).hexdigest()[:16]
        checks.append(CheckItem(id="sha256", status="PASS", message=f"sha256 prefix {digest}"))

        ots = shutil.which("ots-sanitize") or shutil.which("ots")
        if ots:
            proc = subprocess.run(
                [ots, str(dest)],
                capture_output=True,
                text=True,
                timeout=60,
                check=False,
            )
            checks.append(
                CheckItem(
                    id="ots-sanitize",
                    status="PASS" if proc.returncode == 0 else "FAIL",
                    message=(proc.stderr or proc.stdout or "done")[:500],
                )
            )
        else:
            checks.append(
                CheckItem(
                    id="ots-sanitize",
                    status="SKIP",
                    message="ots-sanitize not installed in worker image",
                )
            )

        try:
            from fontTools.ttLib import TTFont  # type: ignore

            font = TTFont(str(dest))
            glyph_count = font.getGlyphSet().keys()
            checks.append(
                CheckItem(
                    id="fonttools-parse",
                    status="PASS",
                    message=f"Parsed font with {len(list(glyph_count))} glyphs",
                )
            )
            font.close()
        except Exception:
            checks.append(
                CheckItem(id="fonttools-parse", status="FAIL", message="Font could not be parsed")
            )

        fb = shutil.which("fontbakery")
        if fb:
            proc = subprocess.run(
                [fb, "check-universal", str(dest), "-c", "os2_metrics_match_hhea"],
                capture_output=True,
                text=True,
                timeout=120,
                check=False,
            )
            checks.append(
                CheckItem(
                    id="fontbakery-sample",
                    status="PASS" if proc.returncode == 0 else "WARN",
                    message=(proc.stdout or proc.stderr or "")[:500],
                )
            )
        else:
            checks.append(
                CheckItem(
                    id="fontbakery",
                    status="SKIP",
                    message="fontbakery CLI not installed; install optional qa deps",
                )
            )

    profile = os.environ.get("FONTOPS_QA_PROFILE", "googlefonts")
    return QAReport(profile=profile, checks=checks)
