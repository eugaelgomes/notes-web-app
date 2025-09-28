# Versão do Node.js - Alpine
FROM node:20-alpine AS builder

# Instalação do Sharp - será removido por desuso
RUN apk add --no-cache \
    libc6-compat \
    vips-dev \
    build-base \
    python3 \
    make \
    g++

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copia todo o resto do código-fonte para o contêiner
COPY . .

RUN npm run build

# ===================================================================================
# ESTÁGIO 2: O "Production" (O nosso carro pronto)
# ===================================================================================
# Começamos de novo, com uma imagem limpa e leve
FROM node:20-alpine

# Instalação do Sharp - será removido por desuso
RUN apk add --no-cache \
    libc6-compat \
    vips

WORKDIR /app

# Copia os arquivos de dependência novamente
COPY package*.json ./

# Instala APENAS as dependências de produção.
# Isso ignora todas as 'devDependencies' e deixa a imagem final muito menor.
RUN npm install --omit=dev

# A mágica acontece aqui! Copiamos APENAS a pasta 'dist' que foi gerada
# no estágio 'builder' para a nossa imagem final.
COPY --from=builder /app/dist ./dist

# Expõe a porta 8080. Isso é uma documentação para dizer qual porta o contêiner usa.
# A publicação da porta é feita no docker-compose.yml.
EXPOSE 8080

# O comando para iniciar a aplicação. Ele vai rodar 'npm run start',
# que por sua vez executa 'node dist/index.js'.
CMD ["npm", "start"]