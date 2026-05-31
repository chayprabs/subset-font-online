FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml main.py ./

RUN pip install --no-cache-dir \
    "fastapi>=0.115.0" \
    "uvicorn[standard]>=0.32.0" \
    "python-multipart>=0.0.12" \
    "fonttools>=4.55.0" \
    "fontbakery>=0.12.0" \
    "opentype-sanitizer>=1.1.0" \
    "brotli>=1.1.0" \
    && python -c "import shutil; assert shutil.which('fontbakery')"

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/health')"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
