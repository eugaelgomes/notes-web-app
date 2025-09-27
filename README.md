# Full-Stack App: Vite, Express.JS & Docker

Veja o projeto publicado ( Front-End ) [Clique aqui](https://notes.codaweb.com.br/)

Aplicação **full-stack** containerizada com Docker, desenvolvida com **foco em aprendizado** e prática de técnicas de containerização e orquestração.

<br>

## 📖 A História por Trás do Projeto

=> O Desafio Inicial: Unificar Front & Back

Vindo de uma jornada focada no Frontend, meu próximo passo natural era aprofundar em um ambiente Backend "puro". No entanto, a integração entre esses dois mundos **era** um ponto de dificuldade. Eu gerenciava os ambientes de forma manual, com terminais separados rodando ao mesmo tempo. Além disso, logo no início aprendendo Docker a ausência de um "hot-reload", algo tão fácil de configurar no front ou com Nodemon, parecia uma grande barreira para a produtividade e aprendizado.

### Mas por quê aprender docker?

Para mim, era claro que <ins>**dominar Docker não era opcional, mas uma habilidade essencial para evoluir como desenvolvedor full-stack**</ins>. A questão não era se eu deveria aprender, mas como eu poderia finalmente quebrar essa barreira.

### A Virada de Chave: Aprendizado Prático para uma Rotina Ágil

Com uma rotina corrida entre faculdade, trabalho e outros cursos complementares, eu precisava de um método de aprendizado que fosse rápido, prático e funcional. Foi então que decidi usar o [Gemini 2.5 Pro](https://gemini.google.com/) - Aprendizado Guiado - como uma parceira de estudos: uma ferramenta que estaria disponível a qualquer momento para responder dúvidas, simular cenários e me guiar de forma interativa. Isso me permitiria aplicar o conhecimento diretamente no meu projeto e organizar minhas anotações - no [Notion](https://notion.so), inclusive - conforme avançava, otimizando meu tempo e salvando conheciemento.

Deixei quase todas as linhas do dockerfiles e compose com os comentários Gemini. Afinal eu não queria somente que ele fizesse, mas sim entender o que ele fez.

![Gemini - Aprendizado Guiado - 1](assets/image.png)
![Gemini - Aprendizado Guiado - 2](assets/image-1.png)

### Trilha do Aprendiza: Ordem seguida

1. **docker-compose.yml**: Para o que serve? Como funciona cada linha? Como configurar?
Eu precisava entender o propósitos das instruções *'volumes'*, *'networs'*, *'dependes on'*, *'command'*, dentre outras.

2. **develop.watch**: Como configurar o develop.watch. Aprender a configurar a sincronização de arquivos em tempo real foi a virada de chave definitiva. 

3. **Nginx e dockerfiles**: Aprender a configurar corretamente os arquivos dos containers.

<br>

# Sobre o Web APP

Descrito das funcionalidades e stacks de cada container.

## ✨ Funcionalidades

    ✅ Aplicação Full-Stack: Frontend em Vite e Backend em Node.js/Express.

    🐳 100% Dockerizado: Ambiente de desenvolvimento e produção totalmente gerenciado pelo Docker Compose.

    🔄 Hot-Reload (develop.watch): Ambiente de desenvolvimento ágil com atualização em tempo real para frontend e backend.

    🚀 Builds Otimizados: Uso de multi-stage builds para criar imagens de produção leves e seguras.

<br>

## 🛠️ Tecnologias Utilizadas

    Front 

<br>

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para executar o projeto em seu ambiente de desenvolvimento.

Pré-requisitos

    Git

    Docker

    Docker Compose

Passo a Passo

    Clone o repositório:
    Bash

git clone https://github.com/eugaelgomes/dockerized-fullstack-app.git

Navegue até a pasta do projeto:
Bash

cd nome-do-projeto

Crie o arquivo de variáveis de ambiente:
Copie o arquivo de exemplo .env.example para um novo arquivo chamado .env.
Bash

cp .env.example .env

Obs: Você pode alterar as variáveis dentro do .env se desejar, como a porta do frontend.

Inicie a aplicação:
Este comando irá construir as imagens (se for a primeira vez) e iniciar todos os contêineres em modo de desenvolvimento, com o hot-reload ativado.
Bash

    docker-compose up --build

    Acesse a aplicação:

        Frontend: http://localhost:80

        Backend: A API estará rodando em http://localhost:8080

<br>