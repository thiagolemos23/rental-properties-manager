# ---------- STAGE 1: build ----------
FROM maven:3.9-eclipse-temurin-17 AS build

# pasta de trabalho dentro da imagem
WORKDIR /app

# copia o pom e baixa dependências (melhora cache)
COPY pom.xml .
RUN mvn -B dependency:go-offline

# copia o código
COPY src ./src

# build da aplicação sem rodar testes
RUN mvn -B clean package -DskipTests

# ---------- STAGE 2: runtime ----------
FROM eclipse-temurin:17-jre

WORKDIR /app

# copia o .jar gerado do stage de build
COPY --from=build /app/target/*.jar app.jar

# porta que sua API usa (Spring padrão = 8080)
EXPOSE 8080

# variável opcional pra tunar JVM se quiser depois
ENV JAVA_OPTS=""

# comando de entrada
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]