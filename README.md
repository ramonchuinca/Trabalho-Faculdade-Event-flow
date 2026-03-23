# 🚀 EventFlow

Sistema web para gerenciamento de eventos, permitindo visualizar, filtrar e cadastrar eventos com localização no mapa.

---

## 📌 Sobre o projeto

O **EventFlow** é uma aplicação front-end que simula uma plataforma de eventos.
O usuário pode visualizar eventos vindos de uma API e também criar seus próprios eventos, que ficam armazenados localmente no navegador.

Este projeto foi desenvolvido com foco em **prática de arquitetura front-end, manipulação de DOM, organização em módulos e experiência do usuário**.

---

## ✨ Funcionalidades

* 📅 Listagem de eventos
* 🔍 Busca por nome do evento
* 🏷️ Filtro por categoria
* ➕ Cadastro de novos eventos
* 🗑️ Exclusão de eventos
* 📍 Seleção de localização no mapa (Leaflet)
* 🖼️ Upload de banner (via URL)
* 📄 Link de documento do evento
* 🎨 Categoria com cores dinâmicas
* 🔔 Feedback visual com Toast
* ⏳ Indicador de carregamento

---

## 🛠️ Tecnologias utilizadas

* HTML5
* CSS3 (com TailwindCSS)
* JavaScript (ES Modules)
* Leaflet.js (mapa interativo)
* LocalStorage (persistência de dados)

---

## 📂 Estrutura do projeto

```
📁 project
 ┣ 📁 css
 ┃ ┗ stars.css
 ┣ 📁 js
 ┃ ┣ 📁 controllers
 ┃ ┃ ┗ eventController.js
 ┃ ┣ 📁 models
 ┃ ┃ ┗ eventModel.js
 ┃ ┣ 📁 services
 ┃ ┃ ┗ api.js
 ┃ ┗ guard.js
 ┣ 📄 index.html
 ┣ 📄 home.html
 ┗ 📄 register.html
```

---

## 📍 Como funciona a localização

O sistema utiliza o **Leaflet.js** para permitir que o usuário selecione a localização do evento diretamente no mapa.

* Clique no mapa para definir o local
* Latitude e longitude são armazenadas junto ao evento

---

## 💾 Armazenamento de dados

* Eventos da API → carregados dinamicamente
* Eventos do usuário → armazenados no **LocalStorage**

---

## ▶️ Como executar o projeto

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/eventflow.git
```

2. Acesse a pasta:

```bash
cd eventflow
```

3. Abra o arquivo:

```bash
index.html
```

---

## 🎯 Objetivo

Este projeto foi desenvolvido com o objetivo de:

* Praticar JavaScript moderno (ES6+)
* Trabalhar com arquitetura em camadas (controller, service, model)
* Criar uma interface moderna com Tailwind
* Simular funcionalidades reais de sistemas de eventos

---

## 🚀 Possíveis melhorias

* ✏️ Edição de eventos via modal
* 📍 Botão "ver no mapa"
* 🔐 Autenticação real com backend
* ☁️ Integração com banco de dados
* 📸 Upload real de imagens

---

## 👨‍💻 Autor

Desenvolvido por **Ramon Chuinca**
Front-End Developer

---

## 📄 Licença

Este projeto está sob a licença MIT.
