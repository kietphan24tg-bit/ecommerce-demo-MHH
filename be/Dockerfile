FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir uv

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY . .

RUN chmod +x scripts/entrypoint.sh

ENV PORT=4000

EXPOSE 4000

ENTRYPOINT ["./scripts/entrypoint.sh"]
