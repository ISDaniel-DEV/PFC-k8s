#!/bin/bash

# Pod name based on your input
POD_NAME="frontend-76f8f855dc-2t9gj"

echo "Syncing frontend files to pod: $POD_NAME"

kubectl cp ./apps/frontend-app/dist/. $POD_NAME:/usr/share/nginx/html
