
# Use an official Python runtime as a parent image
# NeMo often requires specific CUDA versions if GPU is used, but for CPU inference/testing, standard python is fine.
# Ideally use nvcr.io/nvidia/nemo:latest for GPU support, but it's huge.
# Using standard slim python for scaffold (user can swap to nvidia base image for production GPU)
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies required for NeMo (e.g., soundfile libs)
RUN apt-get update && apt-get install -y \
    build-essential \
    libsndfile1 \
    ffmpeg \
    git \
    tesseract-ocr \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
