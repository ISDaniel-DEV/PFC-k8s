#!/bin/bash

# Get the frontend pod name automatically
POD_NAME=$(kubectl get pods -l app=frontend -o jsonpath='{.items[0].metadata.name}')

if [ -z "$POD_NAME" ]; then
    echo "Error: Frontend pod not found!"
    exit 1
fi

echo "Syncing frontend files to pod: $POD_NAME"

kubectl cp ./apps/frontend-app/dist/. "$POD_NAME":/usr/share/nginx/html

echo "Sync complete!"
