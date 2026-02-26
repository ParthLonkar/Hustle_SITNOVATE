# Agrichain ML Service Dockerfile

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY ml_service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy ML service code
COPY ml_service/api ./api
COPY ml_service/models ./models
COPY ml_service/training ./training
COPY ml_service/explainability ./explainability

# Create models directory if it doesn't exist
RUN mkdir -p /app/models

# Expose port
EXPOSE 8000

# Run the ML service
CMD ["python", "api/main.py"]
