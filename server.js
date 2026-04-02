/* ================================================================
   SERVER.JS - Servidor Backend com Node.js + Express
   
   ESTE ARQUIVO É O "CORAÇÃO" DO BACKEND. Ele:
   1. Cria um servidor HTTP usando Express
   2. Define rotas da API REST para o CRUD de tarefas
   3. Lê e escreve no arquivo db.json (nosso banco de dados)
   4. Serve os arquivos estáticos do frontend (pasta public/)
   
   CONCEITOS IMPORTANTES:
   - require() → importa módulos (bibliotecas) do Node.js
   - Express → framework web que facilita criar APIs
   - REST API → padrão de comunicação usando métodos HTTP (GET, POST, PUT, DELETE)
   - fs (File System) → módulo nativo do Node para ler/escrever arquivos
   - JSON → formato de dados usado para armazenar e transmitir informações
   - Middleware → funções que processam a requisição antes da rota final
   ================================================================ */


/* ================================================================
   1. IMPORTAÇÃO DE MÓDULOS
   
   require() é a forma do Node.js importar bibliotecas/módulos.
   É similar ao "import" do Python ou "#include" do C.
   ================================================================ */

// Express: framework web que cria o servidor e gerencia rotas
// Em vez de lidar com HTTP puro, Express simplifica tudo
const express = require('express');

// Path: módulo NATIVO do Node.js para manipular caminhos de arquivos
// Ajuda a construir caminhos de forma segura em qualquer sistema operacional
const path = require('path');

// fs (File System): módulo NATIVO do Node.js para ler/escrever arquivos
// É com ele que vamos ler e salvar o db.json
const fs = require('fs');

// CORS: middleware que permite requisições de diferentes origens
// Sem ele, o navegador bloquearia as requisições da API
const cors = require('cors');


/* ================================================================
   2. CONFIGURAÇÃO DO SERVIDOR
   ================================================================ */

// Cria uma instância do Express (nosso servidor)
const app = express();

// Porta onde o servidor vai rodar
// process.env.PORT permite definir via variável de ambiente (útil em produção)
// Se não existir, usa 3000 como padrão
const PORT = process.env.PORT || 3000;

// Caminho absoluto para o arquivo de banco de dados
// __dirname = pasta onde este arquivo (server.js) está localizado
// path.join() junta os pedaços do caminho de forma segura
const DB_PATH = path.join(__dirname, 'db.json');


/* ================================================================
   3. MIDDLEWARES
   
   Middlewares são funções que rodam ANTES das rotas.
   Eles processam cada requisição que chega ao servidor.
   
   app.use() registra um middleware para TODAS as rotas.
   ================================================================ */

// Habilita CORS para permitir requisições do frontend
app.use(cors());

/*
   express.json() é um middleware que:
   1. Intercepta requisições com Content-Type: application/json
   2. Lê o corpo (body) da requisição
   3. Converte o JSON em objeto JavaScript
   4. Disponibiliza em req.body
   
   Sem isso, req.body seria undefined!
*/
app.use(express.json());

/*
   express.static() serve arquivos estáticos (HTML, CSS, JS, imagens)
   da pasta 'public/' automaticamente.
   
   Quando alguém acessa http://localhost:3000/, o Express procura
   por 'public/index.html' e o serve automaticamente.
*/
app.use(express.static(path.join(__dirname, 'public')));


/* ================================================================
   4. FUNÇÕES DE ACESSO AO BANCO DE DADOS (db.json)
   
   Estas funções encapsulam a leitura e escrita no arquivo JSON.
   São usadas por todas as rotas da API.
   
   IMPORTANTE: fs.readFileSync e fs.writeFileSync são SÍNCRONOS,
   ou seja, bloqueiam a execução até terminar. Para um app pequeno
   isso é aceitável. Em produção, usaríamos as versões assíncronas.
   ================================================================ */

/*
   readDatabase() - Lê o arquivo db.json e retorna seu conteúdo como objeto JS
   
   Processo:
   1. fs.readFileSync() lê o arquivo como string
   2. 'utf-8' define a codificação (para ler acentos corretamente)
   3. JSON.parse() converte a string JSON em objeto JavaScript
   
   Se o arquivo não existir ou estiver corrompido, cria um novo banco vazio.
*/
function readDatabase() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // Se o arquivo não existe ou está corrompido, cria um banco vazio
        console.error('⚠️ Erro ao ler db.json, criando banco vazio:', error.message);
        const emptyDb = {
            metadata: {
                version: '1.0.0',
                appName: 'ToDo List Inteligente',
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                totalTasksCreated: 0
            },
            tasks: []
        };
        writeDatabase(emptyDb);
        return emptyDb;
    }
}

/*
   writeDatabase(data) - Salva um objeto JavaScript no arquivo db.json
   
   Processo:
   1. Atualiza o campo lastModified nos metadados
   2. JSON.stringify(data, null, 2) converte o objeto em string JSON:
      - data: o objeto a converter
      - null: sem função de substituição (replacer)
      - 2: indentação de 2 espaços (deixa o JSON formatado e legível)
   3. fs.writeFileSync() escreve a string no arquivo
*/
function writeDatabase(data) {
    try {
        // Atualiza a data de última modificação nos metadados
        data.metadata.lastModified = new Date().toISOString();
        
        // Converte para JSON formatado (2 espaços de indentação) e salva
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('❌ Erro ao escrever no db.json:', error.message);
        throw error; // Re-lança o erro para a rota tratar
    }
}


/* ================================================================
   5. ROTAS DA API REST
   
   REST (Representational State Transfer) é um padrão de API que usa
   os métodos HTTP para definir as operações:
   
   | Método HTTP | Operação CRUD | Descrição                    |
   |-------------|---------------|------------------------------|
   | GET         | READ          | Buscar/ler dados             |
   | POST        | CREATE        | Criar novos dados            |
   | PUT         | UPDATE        | Atualizar dados existentes   |
   | DELETE      | DELETE        | Excluir dados                |
   | PATCH       | UPDATE parcial| Atualizar parte dos dados    |
   
   Cada rota recebe dois parâmetros:
   - req (request): objeto com dados da requisição (params, body, query)
   - res (response): objeto para enviar a resposta de volta ao cliente
   ================================================================ */


/* ----------------------------------------------------------
   GET /api/tasks - LISTAR TODAS AS TAREFAS (READ)
   
   Lê o banco de dados e retorna todas as tarefas.
   
   Exemplo de uso no frontend:
   fetch('/api/tasks')
     .then(res => res.json())
     .then(data => console.log(data.tasks))
   ---------------------------------------------------------- */
app.get('/api/tasks', (req, res) => {
    try {
        const db = readDatabase();
        
        /*
           res.json() envia uma resposta JSON com:
           - Status 200 (OK) por padrão
           - Content-Type: application/json
           - O objeto convertido em JSON
        */
        res.json({
            success: true,
            count: db.tasks.length,
            metadata: db.metadata,
            tasks: db.tasks
        });
    } catch (error) {
        // Status 500 = Internal Server Error
        res.status(500).json({
            success: false,
            error: 'Erro ao ler o banco de dados',
            details: error.message
        });
    }
});


/* ----------------------------------------------------------
   GET /api/tasks/:id - BUSCAR UMA TAREFA POR ID (READ)
   
   :id é um PARÂMETRO DE ROTA (route parameter).
   Quando alguém acessa /api/tasks/abc123, req.params.id = 'abc123'
   ---------------------------------------------------------- */
app.get('/api/tasks/:id', (req, res) => {
    try {
        const db = readDatabase();
        
        // Busca a tarefa pelo ID usando find()
        const task = db.tasks.find(t => t.id === req.params.id);
        
        if (!task) {
            // Status 404 = Not Found (recurso não encontrado)
            return res.status(404).json({
                success: false,
                error: 'Tarefa não encontrada'
            });
        }
        
        res.json({ success: true, task });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar tarefa',
            details: error.message
        });
    }
});


/* ----------------------------------------------------------
   POST /api/tasks - CRIAR NOVA TAREFA (CREATE)
   
   O corpo da requisição (req.body) contém os dados da nova tarefa.
   O servidor gera o ID e os timestamps automaticamente.
   
   Exemplo de uso no frontend:
   fetch('/api/tasks', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ title: 'Minha tarefa', priority: 'alta' })
   })
   ---------------------------------------------------------- */
app.post('/api/tasks', (req, res) => {
    try {
        const db = readDatabase();
        
        // Desestruturação: extrai as propriedades do corpo da requisição
        const { title, category, priority, dueDate, description } = req.body;
        
        // Validação: título é obrigatório
        if (!title || !title.trim()) {
            // Status 400 = Bad Request (requisição inválida)
            return res.status(400).json({
                success: false,
                error: 'O título da tarefa é obrigatório'
            });
        }
        
        // Cria o objeto da nova tarefa
        const newTask = {
            // ID único: timestamp em base36 + número aleatório em base36
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            title: title.trim(),
            category: category || 'pessoal',
            priority: priority || 'media',
            dueDate: dueDate || null,
            description: (description || '').trim(),
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        
        // Adiciona a tarefa ao array no banco de dados
        db.tasks.push(newTask);
        
        // Incrementa o contador de tarefas criadas nos metadados
        db.metadata.totalTasksCreated++;
        
        // Salva o banco de dados atualizado
        writeDatabase(db);
        
        // Status 201 = Created (recurso criado com sucesso)
        res.status(201).json({
            success: true,
            message: 'Tarefa criada com sucesso',
            task: newTask
        });
        
        console.log(`✅ Tarefa criada: "${newTask.title}" (ID: ${newTask.id})`);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao criar tarefa',
            details: error.message
        });
    }
});


/* ----------------------------------------------------------
   PUT /api/tasks/:id - ATUALIZAR UMA TAREFA (UPDATE)
   
   Recebe o ID na URL e os dados atualizados no body.
   Atualiza apenas os campos enviados (merge).
   ---------------------------------------------------------- */
app.put('/api/tasks/:id', (req, res) => {
    try {
        const db = readDatabase();
        
        // Encontra o ÍNDICE da tarefa no array
        const index = db.tasks.findIndex(t => t.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: 'Tarefa não encontrada'
            });
        }
        
        // Extrai os campos atualizáveis do body
        const { title, category, priority, dueDate, description } = req.body;
        
        // Validação do título (se enviado, não pode ser vazio)
        if (title !== undefined && !title.trim()) {
            return res.status(400).json({
                success: false,
                error: 'O título não pode estar vazio'
            });
        }
        
        /*
           Spread Operator para MERGE (fusão):
           
           { ...db.tasks[index], ...updates }
           
           1. Copia todos os campos da tarefa original
           2. Sobrescreve com os campos do updates (se existirem)
           3. Campos não enviados permanecem inalterados
        */
        const updates = {};
        if (title !== undefined) updates.title = title.trim();
        if (category !== undefined) updates.category = category;
        if (priority !== undefined) updates.priority = priority;
        if (dueDate !== undefined) updates.dueDate = dueDate || null;
        if (description !== undefined) updates.description = description.trim();
        
        db.tasks[index] = { ...db.tasks[index], ...updates };
        
        writeDatabase(db);
        
        res.json({
            success: true,
            message: 'Tarefa atualizada com sucesso',
            task: db.tasks[index]
        });
        
        console.log(`✏️ Tarefa atualizada: "${db.tasks[index].title}" (ID: ${req.params.id})`);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao atualizar tarefa',
            details: error.message
        });
    }
});


/* ----------------------------------------------------------
   PATCH /api/tasks/:id/toggle - ALTERNAR CONCLUSÃO (UPDATE parcial)
   
   PATCH é usado para atualizações PARCIAIS (apenas um campo).
   Aqui, alternamos o status completed (true ↔ false).
   ---------------------------------------------------------- */
app.patch('/api/tasks/:id/toggle', (req, res) => {
    try {
        const db = readDatabase();
        
        const task = db.tasks.find(t => t.id === req.params.id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Tarefa não encontrada'
            });
        }
        
        // Inverte o status: true → false, false → true
        task.completed = !task.completed;
        
        // Registra quando foi concluída (ou limpa se foi reaberta)
        task.completedAt = task.completed ? new Date().toISOString() : null;
        
        writeDatabase(db);
        
        res.json({
            success: true,
            message: task.completed ? 'Tarefa concluída!' : 'Tarefa reaberta!',
            task
        });
        
        console.log(`${task.completed ? '✔️' : '↩️'} Tarefa "${task.title}": ${task.completed ? 'concluída' : 'reaberta'}`);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao alternar status',
            details: error.message
        });
    }
});


/* ----------------------------------------------------------
   DELETE /api/tasks/:id - EXCLUIR UMA TAREFA (DELETE)
   
   Remove a tarefa com o ID especificado do banco de dados.
   ---------------------------------------------------------- */
app.delete('/api/tasks/:id', (req, res) => {
    try {
        const db = readDatabase();
        
        // Verifica se a tarefa existe
        const taskIndex = db.tasks.findIndex(t => t.id === req.params.id);
        
        if (taskIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Tarefa não encontrada'
            });
        }
        
        // Guarda referência antes de remover (para o log)
        const removedTask = db.tasks[taskIndex];
        
        /*
           splice(index, quantidade) remove 'quantidade' itens a partir do 'index'
           Diferente do filter(), splice modifica o array original diretamente
        */
        db.tasks.splice(taskIndex, 1);
        
        writeDatabase(db);
        
        res.json({
            success: true,
            message: 'Tarefa excluída com sucesso',
            deletedTask: removedTask
        });
        
        console.log(`🗑️ Tarefa excluída: "${removedTask.title}" (ID: ${req.params.id})`);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao excluir tarefa',
            details: error.message
        });
    }
});


/* ----------------------------------------------------------
   DELETE /api/tasks - LIMPAR TAREFAS CONCLUÍDAS (DELETE em massa)
   
   Remove todas as tarefas que estão com completed: true.
   Usa query parameter ?completed=true para segurança.
   ---------------------------------------------------------- */
app.delete('/api/tasks', (req, res) => {
    try {
        // Só permite exclusão em massa se o parâmetro ?completed=true for enviado
        if (req.query.completed !== 'true') {
            return res.status(400).json({
                success: false,
                error: 'Use ?completed=true para limpar tarefas concluídas'
            });
        }
        
        const db = readDatabase();
        
        const totalBefore = db.tasks.length;
        
        // Mantém apenas as tarefas NÃO concluídas
        db.tasks = db.tasks.filter(t => !t.completed);
        
        const removedCount = totalBefore - db.tasks.length;
        
        writeDatabase(db);
        
        res.json({
            success: true,
            message: `${removedCount} tarefa(s) concluída(s) removida(s)`,
            removedCount,
            remainingCount: db.tasks.length
        });
        
        console.log(`🧹 ${removedCount} tarefas concluídas removidas`);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao limpar tarefas',
            details: error.message
        });
    }
});


/* ----------------------------------------------------------
   GET /api/export - EXPORTAR BANCO DE DADOS COMPLETO
   
   Retorna o db.json completo para download/backup.
   ---------------------------------------------------------- */
app.get('/api/export', (req, res) => {
    try {
        const db = readDatabase();
        
        // Define headers para download do arquivo
        res.setHeader('Content-Disposition', 'attachment; filename=todo-backup.json');
        res.setHeader('Content-Type', 'application/json');
        
        res.json(db);
        
        console.log('📥 Banco de dados exportado');
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao exportar dados'
        });
    }
});


/* ----------------------------------------------------------
   POST /api/import - IMPORTAR DADOS DE UM BACKUP JSON
   
   Recebe um JSON no body e substitui o banco de dados.
   ---------------------------------------------------------- */
app.post('/api/import', (req, res) => {
    try {
        const importedData = req.body;
        
        // Validação: verifica se o JSON tem a estrutura esperada
        if (!importedData.tasks || !Array.isArray(importedData.tasks)) {
            return res.status(400).json({
                success: false,
                error: 'Formato inválido. O JSON deve conter um array "tasks".'
            });
        }
        
        // Reconstrói o banco com metadados atualizados
        const db = {
            metadata: {
                ...importedData.metadata,
                lastModified: new Date().toISOString(),
                importedAt: new Date().toISOString()
            },
            tasks: importedData.tasks
        };
        
        writeDatabase(db);
        
        res.json({
            success: true,
            message: `${db.tasks.length} tarefa(s) importada(s) com sucesso`,
            count: db.tasks.length
        });
        
        console.log(`📤 ${db.tasks.length} tarefas importadas`);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao importar dados',
            details: error.message
        });
    }
});


/* ----------------------------------------------------------
   GET /api/stats - ESTATÍSTICAS DO BANCO DE DADOS
   
   Retorna métricas calculadas sobre as tarefas.
   ---------------------------------------------------------- */
app.get('/api/stats', (req, res) => {
    try {
        const db = readDatabase();
        const tasks = db.tasks;
        
        const stats = {
            total: tasks.length,
            completed: tasks.filter(t => t.completed).length,
            pending: tasks.filter(t => !t.completed).length,
            urgent: tasks.filter(t => t.priority === 'alta' && !t.completed).length,
            // Agrupa por categoria
            byCategory: tasks.reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + 1;
                return acc;
            }, {}),
            // Agrupa por prioridade
            byPriority: tasks.reduce((acc, t) => {
                acc[t.priority] = (acc[t.priority] || 0) + 1;
                return acc;
            }, {}),
            metadata: db.metadata
        };
        
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao calcular estatísticas'
        });
    }
});


/* ================================================================
   6. INICIALIZAÇÃO DO SERVIDOR
   
   app.listen(porta, callback) inicia o servidor na porta especificada.
   O callback é executado quando o servidor está pronto para receber conexões.
   ================================================================ */
app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║     ✅ ToDo List Inteligente - Servidor      ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  🌐 URL: http://localhost:${PORT}              ║`);
    console.log(`║  📁 DB:  ${path.basename(DB_PATH)}                        ║`);
    console.log('║  📂 Frontend: /public                       ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');
    console.log('📋 Rotas da API:');
    console.log('   GET    /api/tasks          → Listar todas');
    console.log('   GET    /api/tasks/:id      → Buscar por ID');
    console.log('   POST   /api/tasks          → Criar nova');
    console.log('   PUT    /api/tasks/:id      → Atualizar');
    console.log('   PATCH  /api/tasks/:id/toggle → Concluir/Reabrir');
    console.log('   DELETE /api/tasks/:id      → Excluir');
    console.log('   DELETE /api/tasks?completed=true → Limpar concluídas');
    console.log('   GET    /api/stats          → Estatísticas');
    console.log('   GET    /api/export         → Exportar JSON');
    console.log('   POST   /api/import         → Importar JSON');
    console.log('');
});
