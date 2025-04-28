#!/bin/bash

# Node.js pod name
POD_NAME="nodejs-app-5d95667bbf-kmlz9"

# Local source code folder
LOCAL_NODE_APP="./apps/nodejs-app"

# Remote path inside the container (adjust if needed!)
REMOTE_NODE_PATH="/app"

echo "Syncing Node.js app files to pod: $POD_NAME"

# Copy the updated files
kubectl cp "$LOCAL_NODE_APP/." "$POD_NAME:$REMOTE_NODE_PATH"

# Restart the Node.js process (simple way: kill it)
kubectl exec "$POD_NAME" -- pkill -f 'node'
