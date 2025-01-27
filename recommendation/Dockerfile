# Use the official Python image from the Docker Hub
FROM python:3.10-slim

# Install required build tools and libraries
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libffi-dev \
    libopenblas-dev \
    liblapack-dev \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip to the latest version
RUN pip install --upgrade pip

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["python", "server.py"]
