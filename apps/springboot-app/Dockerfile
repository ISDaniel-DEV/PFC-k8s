FROM openjdk:17-jdk-alpine
COPY target/*.jar app.jar
EXPOSE 8888
ENTRYPOINT ["java", "-jar", "/app.jar"]
