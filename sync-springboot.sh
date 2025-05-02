#!/bin/bash

# Replace with your real pod name
POD_NAME="springboot-app-5fcbcdf985-fbtxp"

# Path to your local built JAR
LOCAL_JAR="./apps/springboot-app/target/springboot-app-0.0.1-SNAPSHOT.jar"

# Path inside container where the JAR is (adjust this based on your check!)
REMOTE_JAR_PATH="/app.jar"

echo "Syncing backend JAR to pod: $POD_NAME"

# Copy the JAR
kubectl cp "$LOCAL_JAR" "$POD_NAME:$REMOTE_JAR_PATH"

# Restart the application process (if needed)
kubectl exec "$POD_NAME" -- pkill -f 'java'
