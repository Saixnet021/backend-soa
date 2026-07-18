# --- Stage 1: Build the monolithic application ---
FROM maven:3.8.8-eclipse-temurin-17 AS build
WORKDIR /app

# Copy root pom and module poms to cache dependency downloads
COPY pom.xml .
COPY lote-pesca-service/pom.xml lote-pesca-service/
RUN mvn dependency:go-offline -B -pl lote-pesca-service

# Copy source code and build the package
COPY lote-pesca-service/src lote-pesca-service/src
RUN mvn package -DskipTests -pl lote-pesca-service

# --- Stage 2: Runtime image ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/lote-pesca-service/target/lote-pesca-service-1.0.0-SNAPSHOT.jar app.jar

# Expose target port (Render will bind to $PORT dynamically)
EXPOSE 8080

ENTRYPOINT ["java", "-Dserver.port=${PORT:8080}", "-jar", "app.jar"]
