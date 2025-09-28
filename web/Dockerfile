# ===================================================================================
# ESTÁGIO 1: O "Builder" (O nosso canteiro de obras)
# ===================================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Otimização de cache, copiando primeiro o package.json
COPY package*.json ./

# Instala todas as dependências, incluindo as de desenvolvimento para o build
RUN npm install

# Copia o resto do código-fonte do projeto
COPY . .

# Roda o script de build do Vite
# Isso vai gerar a pasta /app/dist com os arquivos estáticos
RUN npm run build

# ===================================================================================
# ESTÁGIO 2: O "Production" (Servindo com Nginx)
# ===================================================================================
# Começamos com uma imagem oficial e super leve do Nginx
FROM nginx:1.27-alpine

# O Nginx por padrão serve arquivos desta pasta.
# Nós vamos copiar o resultado do nosso build para lá.
# O comando abaixo copia o conteúdo de /app/dist do estágio 'builder'
# para dentro do diretório padrão do Nginx.
COPY --from=builder /app/dist /usr/share/nginx/html

# [IMPORTANTE] Copia nossa configuração customizada do Nginx (ver abaixo)
# para dentro do contêiner. Isso é essencial para o React Router funcionar.
COPY config/nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80, que é a porta padrão do Nginx
EXPOSE 80

# Comando padrão para iniciar o Nginx e mantê-lo rodando em primeiro plano
CMD ["nginx", "-g", "daemon off;"]