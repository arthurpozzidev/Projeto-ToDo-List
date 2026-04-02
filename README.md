# ✅ ToDo List Inteligente

> Aplicação completa de gerenciamento de tarefas com **backend Node.js**, **banco de dados JSON** e **interface dark premium**.

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## 📋 Sobre o Projeto

O **ToDo List Inteligente** é uma aplicação web fullstack desenvolvida para fins educacionais. Todo o código é **extensivamente comentado em português**, explicando cada conceito de programação utilizado — ideal para quem está aprendendo **JavaScript**, **Node.js** e **desenvolvimento web**.

### ✨ Destaques

- 🎯 **CRUD Completo** — Criar, Ler, Atualizar e Excluir tarefas
- 💾 **Banco de Dados JSON** — Persistência real em arquivo `db.json` no servidor
- 🌐 **API REST** — Backend com Express servindo endpoints HTTP
- 🔍 **Busca, Filtros e Ordenação** — Interface inteligente para organizar tarefas
- 📊 **Estatísticas em tempo real** — Cards dinâmicos com métricas das tarefas
- 📥 **Exportar/Importar JSON** — Backup e restauração de dados
- 🌙 **Design Dark Premium** — Interface moderna com glassmorphism e animações
- 📱 **Responsivo** — Funciona em desktop, tablet e celular
- 💬 **Código 100% comentado** — Cada linha explicada para fins didáticos

---

## 🏗️ Arquitetura do Projeto

```
📂 ToDo List Inteligente/
│
├── 📄 package.json          # Dependências e scripts do Node.js
├── 📄 server.js             # 🟢 Backend — Servidor Express + API REST
├── 📄 db.json               # 🗄️ Banco de Dados — Arquivo JSON persistente
│
├── 📂 public/               # 🎨 Frontend — Servido pelo Express
│   ├── 📄 index.html        # Estrutura HTML da interface
│   ├── 📄 style.css         # Estilos CSS (dark theme, animações, responsivo)
│   └── 📄 app.js            # Lógica frontend (fetch API → servidor → db.json)
│
└── 📂 node_modules/         # Dependências instaladas (gerado pelo npm)
```

### Fluxo de Dados

```
┌─────────────┐     fetch()      ┌──────────────┐     fs.read/write     ┌──────────┐
│   Navegador │ ───────────────► │  Express.js  │ ──────────────────► │ db.json  │
│  (Frontend) │ ◄─────────────── │  (Backend)   │ ◄────────────────── │  (Banco) │
│  app.js     │    JSON response │  server.js   │    JSON file I/O    │          │
└─────────────┘                  └──────────────┘                     └──────────┘
```

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior instalado
- npm (vem junto com o Node.js)

### Instalação

```bash
# 1. Clone ou baixe o projeto
git clone <url-do-repositorio>
cd "Aulas de JS"

# 2. Instale as dependências
npm install

# 3. Inicie o servidor
node server.js
```

### Acesse no navegador

```
http://localhost:3000
```

Você verá a interface do ToDo List Inteligente pronta para uso! 🎉

---

## 🔌 API REST — Endpoints

O backend expõe uma API REST completa. Todos os endpoints estão sob `/api/`.

| Método   | Endpoint                      | Descrição                       | Status Codes    |
|----------|-------------------------------|---------------------------------|-----------------|
| `GET`    | `/api/tasks`                  | Listar todas as tarefas         | `200`, `500`    |
| `GET`    | `/api/tasks/:id`              | Buscar uma tarefa por ID        | `200`, `404`    |
| `POST`   | `/api/tasks`                  | Criar nova tarefa               | `201`, `400`    |
| `PUT`    | `/api/tasks/:id`              | Atualizar tarefa existente      | `200`, `404`    |
| `PATCH`  | `/api/tasks/:id/toggle`       | Alternar conclusão da tarefa    | `200`, `404`    |
| `DELETE` | `/api/tasks/:id`              | Excluir uma tarefa              | `200`, `404`    |
| `DELETE` | `/api/tasks?completed=true`   | Limpar todas as concluídas      | `200`, `400`    |
| `GET`    | `/api/stats`                  | Estatísticas do banco           | `200`           |
| `GET`    | `/api/export`                 | Exportar banco como JSON        | `200`           |
| `POST`   | `/api/import`                 | Importar dados de backup JSON   | `200`, `400`    |

### Exemplos de Uso (cURL)

```bash
# Listar todas as tarefas
curl http://localhost:3000/api/tasks

# Criar uma nova tarefa
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Estudar JavaScript", "priority": "alta", "category": "estudos"}'

# Concluir uma tarefa
curl -X PATCH http://localhost:3000/api/tasks/<id>/toggle

# Excluir uma tarefa
curl -X DELETE http://localhost:3000/api/tasks/<id>

# Exportar banco de dados
curl http://localhost:3000/api/export -o backup.json
```

---

## 📁 Estrutura do Banco de Dados (`db.json`)

O banco de dados é um arquivo JSON com a seguinte estrutura:

```json
{
  "metadata": {
    "version": "1.0.0",
    "appName": "ToDo List Inteligente",
    "createdAt": "2026-04-02T00:00:00.000Z",
    "lastModified": "2026-04-02T08:46:58.726Z",
    "totalTasksCreated": 3
  },
  "tasks": [
    {
      "id": "mnh8dzty9qvrzdd8in9",
      "title": "Programar um ToDo List",
      "category": "pessoal",
      "priority": "media",
      "dueDate": null,
      "description": "",
      "completed": false,
      "createdAt": "2026-04-02T08:46:58.726Z",
      "completedAt": null
    }
  ]
}
```

### Campos de uma Tarefa

| Campo         | Tipo       | Descrição                                    |
|---------------|------------|----------------------------------------------|
| `id`          | `string`   | Identificador único (gerado automaticamente) |
| `title`       | `string`   | Título da tarefa (obrigatório, max 100 chars) |
| `category`    | `string`   | Categoria: `pessoal`, `trabalho`, `estudos`, `saude`, `financas`, `outros` |
| `priority`    | `string`   | Prioridade: `baixa`, `media`, `alta`         |
| `dueDate`     | `string\|null` | Data de prazo no formato `YYYY-MM-DD`    |
| `description` | `string`   | Descrição opcional (max 300 chars)            |
| `completed`   | `boolean`  | Status de conclusão                           |
| `createdAt`   | `string`   | Data/hora de criação (ISO 8601)               |
| `completedAt` | `string\|null` | Data/hora de conclusão                   |

---

## 🎨 Funcionalidades da Interface

### Gerenciamento de Tarefas
- ➕ **Adicionar** tarefas com título, categoria, prioridade, prazo e descrição
- ✏️ **Editar** tarefas existentes via modal
- 🗑️ **Excluir** tarefas com confirmação
- ✅ **Concluir/Reabrir** tarefas com checkbox
- 🧹 **Limpar concluídas** de uma vez

### Organização Inteligente
- 🔍 **Busca** em tempo real por título e descrição
- 🏷️ **Filtros** por status: Todas, Pendentes, Concluídas
- 📊 **Ordenação** por: Recentes, Antigas, Prioridade, Prazo, Alfabética
- 📈 **Estatísticas** ao vivo: Total, Pendentes, Concluídas, Urgentes

### Seção Recolhível
- 🔽 **Nova Tarefa** pode ser recolhida/expandida clicando no cabeçalho
- Animação suave de colapso com transição CSS

### Backup de Dados
- 📥 **Exportar JSON** — Baixa o banco de dados completo como arquivo `.json`
- 📤 **Importar JSON** — Carrega dados de um arquivo de backup
- 🟢 **Indicador de conexão** — Mostra se o frontend está sincronizado com o servidor

### Design e UX
- 🌙 **Tema dark** premium com fundo gradiente
- 💎 **Glassmorphism** em cards e modais
- ✨ **Micro-animações** em hover, transições e notificações
- 🔔 **Toast notifications** para feedback de ações
- 📱 **Design responsivo** para mobile e desktop
- 🛡️ **Proteção XSS** contra injeção de código HTML

---

## 🧠 Conceitos de Programação Abordados

O código é comentado para ensinar os seguintes conceitos:

### JavaScript (Frontend — `app.js`)
| Conceito | Onde é usado |
|----------|-------------|
| Classes ES6 (`class`) | Estrutura principal `TodoApp` |
| `async/await` | Todas as operações com a API |
| `fetch()` API | Comunicação HTTP com o backend |
| Promises | Leitura de arquivos (FileReader) |
| Template Literals | Criação de HTML dinâmico |
| Destructuring | Extração de dados dos formulários |
| Arrow Functions (`=>`) | Callbacks e event handlers |
| Array Methods (`filter`, `find`, `sort`, `map`) | Filtragem e ordenação |
| Event Delegation | Cliques delegados na lista de tarefas |
| `classList.toggle()` | Toggle de recolher/expandir seção |
| `Blob` + `URL.createObjectURL` | Download de arquivo JSON |
| DOM Manipulation | Criação e atualização de elementos |

### Node.js (Backend — `server.js`)
| Conceito | Onde é usado |
|----------|-------------|
| `require()` / Módulos | Importação de Express, fs, path |
| Express Framework | Criação do servidor e rotas |
| REST API | Endpoints CRUD (GET, POST, PUT, PATCH, DELETE) |
| Middleware | `express.json()`, `express.static()`, `cors()` |
| `fs.readFileSync/writeFileSync` | Leitura/escrita do `db.json` |
| `JSON.parse/stringify` | Serialização de dados |
| Route Parameters (`:id`) | Identificação de recursos na URL |
| Query Parameters (`?key=value`) | Filtros na exclusão em massa |
| Error Handling (`try/catch`) | Tratamento de erros em todas as rotas |
| HTTP Status Codes | 200, 201, 400, 404, 500 |

### CSS (`style.css`)
| Conceito | Onde é usado |
|----------|-------------|
| CSS Custom Properties (`--var`) | Sistema de design (cores, espaçamentos) |
| Flexbox | Layouts horizontais e alinhamento |
| CSS Grid | Cards de estatísticas e form options |
| `@keyframes` | Animações de entrada, saída e flutuação |
| `transition` | Hover effects e micro-animações |
| `max-height` + `overflow` | Seção colapsável |
| Media Queries | Responsividade mobile/tablet |
| Pseudo-elementos (`::after`) | Checkbox customizado |
| `backdrop-filter: blur()` | Efeito glassmorphism nos modais |

---

## 📦 Dependências

| Pacote | Versão | Descrição |
|--------|--------|-----------|
| [express](https://expressjs.com/) | ^4.18.2 | Framework web para Node.js |
| [cors](https://www.npmjs.com/package/cors) | ^2.8.5 | Middleware para permitir requisições cross-origin |

> 💡 O frontend é **100% vanilla** (sem frameworks como React/Vue). Apenas HTML, CSS e JavaScript puro.

---

## 🔧 Scripts Disponíveis

```bash
# Iniciar o servidor
npm start

# Ou diretamente
node server.js
```

---

## 🗂️ Configuração

### Porta do Servidor

Por padrão, o servidor roda na porta `3000`. Para alterar:

```bash
# Via variável de ambiente
PORT=8080 node server.js
```

### Banco de Dados

O arquivo `db.json` é criado automaticamente na raiz do projeto. Se for deletado ou corrompido, o servidor cria um novo banco vazio automaticamente.

---

## 📄 Licença

Este projeto é de código aberto e está sob a licença [MIT](https://opensource.org/licenses/MIT). Sinta-se livre para usar, modificar e distribuir.

---

## 👨‍💻 Autor

Desenvolvido como projeto educacional para aprendizado de **JavaScript fullstack**.

---

<p align="center">
  Feito com ❤️ e ☕ — <strong>ToDo List Inteligente v1.0.0</strong>
</p>
