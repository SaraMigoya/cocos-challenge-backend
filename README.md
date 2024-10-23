# cocos-challenge-backend

# Configuración del entorno creando una base de datos desde cero

1. Variables de entorno: Crear un archivo .env en la raíz del proyecyo y pegar las variables de entorno previamente dadas
2. Correr el siguiente comando "npm init -y" para inicializar el pryecto
3. Correr el siguiente comando "npm i" para instalar las dependencias
4. Levantar los Servicios con Docker Compose: Ejecutar el siguiente comando para levantar los servicios de la base de datos "docker compose up -d"
5. Crear y conectarse a la base de datos postgres
6. Levantar el servicio ejecutando el siguiente comando: "npm run dev"
7. Poblar la base de datos usando el siguiente comando: "cat populate_tables.sql | docker exec -i postgres-db psql -U myuser -d cocos_challenge
"

# Configuración del entorno conectandose a una base de datos existente

1. Variables de entorno: Crear un archivo .env en la raíz del proyecyo y pegar las variables de entorno que **ya tienen de cocos**
2. Correr el siguiente comando "npm init -y" para inicializar el pryecto
3. Correr el siguiente comando "npm i" para instalar las dependencias
4. Levantar los Servicios con Docker Compose: Ejecutar el siguiente comando para levantar los servicios de la base de datos "docker compose up -d"
6. Conectarse a la base de datos postgres que existe previamente
5. Levantar el servicio ejecutando el siguiente comando: "npm run dev"

# Test funcional 

1. Correr el comando "npm test" 