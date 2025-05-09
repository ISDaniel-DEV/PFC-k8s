#!/bin/bash

POD=$(kubectl get pods -l app=springboot-app -o jsonpath="{.items[0].metadata.name}")
JAR=./target/springboot-app-0.0.1-SNAPSHOT.jar

echo "Building app..."
./apps/springboot-app/mvnw clean package || exit 1

echo "Copying JAR to pod..."
kubectl cp $JAR $POD:/app.jar

echo "Restarting app..."
kubectl exec $POD -- pkill -f 'java'
