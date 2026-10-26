FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Pre-packaged JAR layer for instant, cached startup
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar

ENV JAVA_OPTS="-XX:TieredStopAtLevel=1 -Xms64m -Xmx200m -XX:+UseSerialGC -Dspring.main.lazy-initialization=true -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
