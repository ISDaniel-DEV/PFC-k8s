#!/bin/bash

while true; do
    echo "Syncing all apps at $(date)..."

    ./sync-frontend.sh
    echo "Frontend synced ✅"

    ./sync-springboot.sh
    echo "Spring Boot backend synced ✅"

    ./sync-node.sh
    echo "Node.js app synced ✅"

    echo "Waiting 5 minutes before next sync..."
    sleep 300 # 3 minutes = 180 seconds
done
