# Use Python base image
FROM python:3.12

# Set working directory inside the container
WORKDIR /backend

# Copy only requirements.txt first (for better caching)
COPY ../../backend/requirements.txt /backend/

# Install dependencies
RUN pip install --no-cache-dir -r ../../backend/requirements.txt || echo "No requirements.txt found"

# Copy the entire backend code
COPY ../../backend /backend

# Expose the port Flask runs on
EXPOSE 8000

# Default command
CMD ["python", "main.py"]
