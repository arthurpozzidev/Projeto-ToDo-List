**# 📋 ToDo List Inteligente — Resumo do Projeto

Um aplicativo de lista de tarefas completo, usando apenas **HTML, CSS e JavaScript puro** (sem frameworks), com persistência de dados via **localStorage + JSON**.

---

## 📁 Arquivos Criados

| Arquivo | Função | Linhas |
|---------|--------|--------|
| [index.html](file:///c:/Users/ARTHUR/Documents/Teste/Aulas%20de%20JS/index.html) | Estrutura da página (formulários, lista, modais) | ~230 |
| [style.css](file:///c:/Users/ARTHUR/Documents/Teste/Aulas%20de%20JS/style.css) | Visual dark premium com animações e responsividade | ~630 |
| [app.js](file:///c:/Users/ARTHUR/Documents/Teste/Aulas%20de%20JS/app.js) | Lógica completa: CRUD, localStorage, filtros, eventos | ~580 |

---

## 🎨 Design

Interface dark premium com:
- Gradientes sutis e cores vibrantes (roxo como cor principal)
- Cards com bordas coloridas por prioridade (🟢 verde, 🟡 amarelo, 🔴 vermelho)
- Animações de entrada/saída nos cards
- Hover effects em todos os elementos interativos
- Checkbox customizado com CSS puro
- Toast notifications (mensagens temporárias)
- Modais com backdrop blur
- Responsivo (adapta para celular e tablet)

---

## ⚙️ Funcionalidades (CRUD)

### ➕ CREATE (Criar)
- Formulário com título, categoria, prioridade, prazo e descrição
- ID único gerado com `Date.now()` + `Math.random()`
- Validação de campo obrigatório (título)

### 📖 READ (Ler)
- Lista todas as tarefas com cards visuais
- Badges coloridos para categoria e prioridade
- Indicador de prazo vencido (⏰ Atrasada)

### ✏️ UPDATE (Atualizar)
- Modal de edição com todos os campos preenchidos
- Toggle de conclusão via checkbox
- Registro de data/hora de conclusão

### 🗑️ DELETE (Excluir)
- Modal de confirmação antes de excluir
- Animação de saída (slide out)
- Botão para limpar todas as concluídas de uma vez

---

## 🔍 Recursos Extras

| Recurso | Como funciona |
|---------|---------------|
| **Busca** | Filtra tarefas por título e descrição em tempo real |
| **Filtros** | Todas / Pendentes / Concluídas |
| **Ordenação** | Recentes, Antigas, Prioridade, Prazo, A-Z |
| **Estatísticas** | Cards no topo: Total, Pendentes, Concluídas, Urgentes |
| **Data atual** | Exibida no header formatada em pt-BR |
| **Segurança** | Escape de HTML para prevenir XSS |
| **Persistência** | localStorage com JSON (dados sobrevivem ao recarregar) |

---

## 🧠 Conceitos JavaScript Ensinados no Código

Os comentários no código explicam em detalhe cada conceito. Aqui está um resumo:

| Conceito | Onde é usado |
|----------|-------------|
| **Classes (ES6)** | Toda a lógica está na classe `TodoApp` |
| **Constructor** | Inicialização do app, referências ao DOM |
| **localStorage** | `loadFromStorage()` e `saveToStorage()` |
| **JSON.parse/stringify** | Converter dados entre objeto e string |
| **Arrow Functions** | Callbacks em `filter()`, `sort()`, `find()`, etc. |
| **Template Literals** | Construção de HTML dinâmico com `` ` `` |
| **Spread Operator (...)** | Merge de objetos no `updateTask()` |
| **Array Methods** | `push`, `filter`, `find`, `findIndex`, `sort`, `some`, `forEach` |
| **Event Delegation** | Um listener no container pai para todos os cards |
| **DOM Manipulation** | `createElement`, `querySelector`, `classList`, `dataset` |
| **Date API** | Formatação de datas com `toLocaleDateString()` |
| **try/catch** | Tratamento de erros no localStorage |

---

## 💡 Como usar

1. Abra o arquivo `index.html` no navegador (duplo clique)
2. Digite o título da tarefa e configure categoria/prioridade/prazo
3. Clique em **"Adicionar Tarefa"**
4. Use o checkbox ☑️ para marcar como concluída
5. Use ✏️ para editar e 🗑️ para excluir
6. Filtre, busque e ordene suas tarefas como preferir
7. Os dados são salvos automaticamente no navegador!

---
