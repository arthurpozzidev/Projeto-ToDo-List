/* ================================================================
   APP.JS - Frontend do ToDo List Inteligente
   
   DIFERENÇA PRINCIPAL DA VERSÃO ANTERIOR:
   Antes, o app salvava dados no localStorage (navegador).
   Agora, o app se comunica com o SERVIDOR (server.js) via API REST.
   
   Cada operação CRUD faz uma requisição HTTP ao servidor:
   - fetch('/api/tasks')          → GET    → Listar tarefas
   - fetch('/api/tasks', POST)    → POST   → Criar tarefa
   - fetch('/api/tasks/:id', PUT) → PUT    → Atualizar tarefa
   - fetch('/api/tasks/:id', DEL) → DELETE → Excluir tarefa
   
   O servidor então lê/escreve no arquivo db.json (banco de dados real).
   
   CONCEITO CHAVE: fetch() API
   fetch() é a forma moderna de fazer requisições HTTP no JavaScript.
   Ele retorna uma PROMISE (promessa de resultado futuro).
   Usamos async/await para lidar com Promises de forma mais legível.
   ================================================================ */


/* ================================================================
   CLASSE TodoApp
   
   Mesma estrutura da versão anterior, mas agora TODAS as operações
   de dados passam pela API do servidor em vez do localStorage.
   ================================================================ */
class TodoApp {

    constructor() {
        // ============================================
        // PROPRIEDADES
        // ============================================
        
        // Array local de tarefas (será preenchido pela API)
        this.tasks = [];
        
        // Filtro, busca e ordenação atuais
        this.currentFilter = 'todas';
        this.currentSearch = '';
        this.currentSort = 'recentes';
        
        // ID da tarefa a ser excluída (usado pelo modal de confirmação)
        this.taskToDelete = null;
        
        // URL base da API (mesmo servidor que serve o frontend)
        this.API_URL = '/api/tasks';

        // ============================================
        // REFERÊNCIAS AOS ELEMENTOS DO DOM
        // ============================================
        this.form = document.getElementById('taskForm');
        this.titleInput = document.getElementById('taskTitle');
        this.categorySelect = document.getElementById('taskCategory');
        this.prioritySelect = document.getElementById('taskPriority');
        this.dateInput = document.getElementById('taskDate');
        this.descriptionInput = document.getElementById('taskDescription');
        this.btnSubmit = document.getElementById('btnSubmit');
        
        this.tasksList = document.getElementById('tasksList');
        this.emptyState = document.getElementById('emptyState');
        
        this.searchInput = document.getElementById('searchInput');
        this.sortSelect = document.getElementById('sortSelect');
        
        this.statTotal = document.getElementById('statTotal');
        this.statPending = document.getElementById('statPending');
        this.statCompleted = document.getElementById('statCompleted');
        this.statUrgent = document.getElementById('statUrgent');
        
        this.editModal = document.getElementById('editModal');
        this.editForm = document.getElementById('editForm');
        this.editTaskId = document.getElementById('editTaskId');
        this.editTitle = document.getElementById('editTitle');
        this.editCategory = document.getElementById('editCategory');
        this.editPriority = document.getElementById('editPriority');
        this.editDate = document.getElementById('editDate');
        this.editDescription = document.getElementById('editDescription');
        
        this.confirmModal = document.getElementById('confirmModal');
        this.actionsBar = document.getElementById('actionsBar');
        
        this.toast = document.getElementById('toast');
        this.toastIcon = document.getElementById('toastIcon');
        this.toastMessage = document.getElementById('toastMessage');
        
        // Novos elementos para gerenciamento de dados
        this.saveIndicator = document.getElementById('saveIndicator');
        this.saveText = document.getElementById('saveText');

        // ============================================
        // INICIALIZAÇÃO
        // ============================================
        this.bindEvents();
        this.updateCurrentDate();
        
        /*
           Carrega as tarefas DO SERVIDOR (não mais do localStorage).
           loadTasks() é async, então usamos .then() ou simplesmente chamamos.
           A primeira chamada popula this.tasks e renderiza a lista.
        */
        this.loadTasks();
    }


    /* ==========================================================
       ==================== COMUNICAÇÃO COM A API ================
       
       Todas as operações agora usam fetch() para se comunicar
       com o servidor Express (server.js).
       
       PADRÃO DAS REQUISIÇÕES:
       1. fetch(url, opções) → envia a requisição HTTP
       2. response.json() → converte a resposta em objeto JS
       3. Trata o resultado ou erro
       
       async/await:
       - async: marca a função como assíncrona (retorna uma Promise)
       - await: pausa a execução até a Promise resolver
       - Sem await, o código continuaria sem esperar a resposta
       ========================================================== */

    /*
       LOAD TASKS - Carrega todas as tarefas do servidor
       
       Faz GET /api/tasks e preenche this.tasks com o resultado.
       Chamada na inicialização e após cada operação CRUD.
    */
    async loadTasks() {
        try {
            /*
               fetch() sem segundo argumento = requisição GET
               
               await pausa aqui até o servidor responder.
               
               A resposta (response) contém:
               - status: código HTTP (200, 404, 500, etc.)
               - ok: true se status é 200-299
               - json(): método que lê o corpo como JSON
            */
            const response = await fetch(this.API_URL);
            
            // Verifica se a resposta foi bem-sucedida
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            // Converte o corpo da resposta de JSON para objeto JS
            const data = await response.json();
            
            // Atualiza o array local com as tarefas do servidor
            this.tasks = data.tasks || [];
            
            // Atualiza o indicador de conexão
            this.updateConnectionStatus(true);
            
            // Re-renderiza a interface com os dados atualizados
            this.renderTasks();
            this.updateStats();
            
        } catch (error) {
            console.error('❌ Erro ao carregar tarefas:', error);
            this.updateConnectionStatus(false);
            this.showToast('❌', 'Erro ao conectar com o servidor');
        }
    }

    /*
       CREATE TASK - Envia nova tarefa para o servidor
       
       Faz POST /api/tasks com os dados no corpo da requisição.
       O servidor cria a tarefa no db.json e retorna o objeto criado.
    */
    async createTask(title, category, priority, dueDate, description) {
        try {
            /*
               fetch() com segundo argumento = configuração da requisição
               
               method: 'POST' → tipo de requisição HTTP
               headers: define que o corpo é JSON
               body: JSON.stringify(...) → converte o objeto em string JSON
               
               O servidor receberá esses dados em req.body
            */
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    category,
                    priority,
                    dueDate,
                    description
                })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error);
            }
            
            // Recarrega todas as tarefas do servidor para sincronizar
            await this.loadTasks();
            
            return data.task;
        } catch (error) {
            console.error('❌ Erro ao criar tarefa:', error);
            this.showToast('❌', 'Erro ao salvar no servidor');
            throw error;
        }
    }

    /*
       UPDATE TASK - Atualiza uma tarefa existente no servidor
       
       Faz PUT /api/tasks/:id com os dados atualizados.
    */
    async updateTask(id, updates) {
        try {
            const response = await fetch(`${this.API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error);
            }
            
            await this.loadTasks();
            return data.task;
        } catch (error) {
            console.error('❌ Erro ao atualizar tarefa:', error);
            this.showToast('❌', 'Erro ao atualizar no servidor');
            throw error;
        }
    }

    /*
       TOGGLE COMPLETE - Alterna o status de conclusão
       
       Faz PATCH /api/tasks/:id/toggle
       PATCH é usado para atualizações parciais (apenas um campo)
    */
    async toggleComplete(id) {
        try {
            const response = await fetch(`${this.API_URL}/${id}/toggle`, {
                method: 'PATCH'
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error);
            }
            
            await this.loadTasks();
            return data.task;
        } catch (error) {
            console.error('❌ Erro ao alternar status:', error);
            this.showToast('❌', 'Erro ao atualizar no servidor');
            throw error;
        }
    }

    /*
       DELETE TASK - Remove uma tarefa do servidor
       
       Faz DELETE /api/tasks/:id
    */
    async deleteTask(id) {
        try {
            const response = await fetch(`${this.API_URL}/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error);
            }
            
            await this.loadTasks();
        } catch (error) {
            console.error('❌ Erro ao excluir tarefa:', error);
            this.showToast('❌', 'Erro ao excluir no servidor');
            throw error;
        }
    }

    /*
       CLEAR COMPLETED - Remove todas as tarefas concluídas
       
       Faz DELETE /api/tasks?completed=true
    */
    async clearCompleted() {
        try {
            const response = await fetch(`${this.API_URL}?completed=true`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error);
            }
            
            await this.loadTasks();
        } catch (error) {
            console.error('❌ Erro ao limpar concluídas:', error);
            this.showToast('❌', 'Erro ao limpar no servidor');
        }
    }

    /*
       EXPORT DATA - Exporta o banco de dados como arquivo .json
       
       Faz GET /api/export e cria um download do arquivo.
       
       Conceito: Blob (Binary Large Object)
       - Blob é uma representação de dados binários no navegador
       - Criamos um Blob com o JSON e geramos uma URL temporária
       - Simulamos um clique em um link de download invisível
    */
    async exportData() {
        try {
            const response = await fetch('/api/export');
            const data = await response.json();
            
            // Cria um Blob (arquivo virtual) com o JSON formatado
            const blob = new Blob(
                [JSON.stringify(data, null, 2)],  // conteúdo formatado com 2 espaços
                { type: 'application/json' }       // tipo MIME
            );
            
            // URL.createObjectURL() cria uma URL temporária para o Blob
            const url = URL.createObjectURL(blob);
            
            // Cria um elemento <a> invisível para simular o download
            const a = document.createElement('a');
            a.href = url;
            a.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
            
            // Adiciona ao DOM, clica e remove
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Libera a URL temporária da memória
            URL.revokeObjectURL(url);
            
            this.showToast('📥', 'Backup exportado com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao exportar:', error);
            this.showToast('❌', 'Erro ao exportar dados');
        }
    }

    /*
       IMPORT DATA - Importa dados de um arquivo .json
       
       Faz POST /api/import com o conteúdo do arquivo.
       
       Conceito: FileReader API
       - FileReader permite ler arquivos do computador do usuário
       - Lemos o arquivo como texto e processamos o JSON
    */
    async importData(file) {
        try {
            /*
               FileReader é uma API do navegador para ler arquivos.
               
               Processo:
               1. Cria um FileReader
               2. Define o callback onload (quando terminar de ler)
               3. Chama readAsText(file) para iniciar a leitura
               
               Aqui encapsulamos em uma Promise para usar com await.
            */
            const text = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
                reader.readAsText(file);
            });
            
            // Converte o texto lido em objeto JavaScript
            const importedData = JSON.parse(text);
            
            // Validação básica
            if (!importedData.tasks || !Array.isArray(importedData.tasks)) {
                throw new Error('Formato inválido');
            }
            
            // Envia para o servidor
            const response = await fetch('/api/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(importedData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error);
            }
            
            // Recarrega as tarefas do servidor
            await this.loadTasks();
            
            this.showToast('📤', `${data.count} tarefas importadas!`);
        } catch (error) {
            console.error('❌ Erro ao importar:', error);
            this.showToast('❌', 'Erro ao importar: arquivo inválido');
        }
    }


    /* ==========================================================
       ==================== FILTRAGEM LOCAL =====================
       Filtros, busca e ordenação são aplicados LOCALMENTE nos dados
       já carregados do servidor (para melhor performance)
       ========================================================== */

    getTaskById(id) {
        return this.tasks.find(task => task.id === id);
    }

    getFilteredTasks() {
        // Filtra por status
        let filtered = this.tasks.filter(task => {
            if (this.currentFilter === 'pendentes') return !task.completed;
            if (this.currentFilter === 'concluidas') return task.completed;
            return true;
        });

        // Filtra por busca
        if (this.currentSearch) {
            const search = this.currentSearch.toLowerCase();
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(search) ||
                task.description.toLowerCase().includes(search)
            );
        }

        // Ordena
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'recentes':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'antigas':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'prioridade':
                    const order = { alta: 0, media: 1, baixa: 2 };
                    return order[a.priority] - order[b.priority];
                case 'prazo':
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                case 'alfabetica':
                    return a.title.localeCompare(b.title, 'pt-BR');
                default:
                    return 0;
            }
        });

        return filtered;
    }


    /* ==========================================================
       ==================== EVENTOS =============================
       ========================================================== */

    bindEvents() {
        // Formulário de adicionar tarefa
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddTask();
        });

        // Campo de busca
        this.searchInput.addEventListener('input', (e) => {
            this.currentSearch = e.target.value;
            this.renderTasks();
        });

        // Botões de filtro
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderTasks();
            });
        });

        // Ordenação
        this.sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderTasks();
        });

        // Limpar concluídas
        document.getElementById('btnClearCompleted').addEventListener('click', async () => {
            await this.clearCompleted();
            this.showToast('🗑️', 'Tarefas concluídas removidas!');
        });

        // Modal de edição
        this.editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditTask();
        });

        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal(this.editModal);
        });

        // Modal de confirmação
        document.getElementById('btnCancelDelete').addEventListener('click', () => {
            this.closeModal(this.confirmModal);
        });

        document.getElementById('btnConfirmDelete').addEventListener('click', () => {
            this.handleConfirmDelete();
        });

        // Fechar modais clicando fora
        [this.editModal, this.confirmModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal(modal);
            });
        });

        // Fechar modais com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal(this.editModal);
                this.closeModal(this.confirmModal);
            }
        });

        // Delegação de eventos na lista de tarefas
        this.tasksList.addEventListener('click', (e) => {
            const card = e.target.closest('.task-card');
            if (!card) return;
            const taskId = card.dataset.id;

            if (e.target.classList.contains('task-checkbox')) {
                // Previne o comportamento padrão do checkbox
                e.preventDefault();
                this.handleToggle(taskId);
            }

            if (e.target.closest('.btn-edit')) {
                this.openEditModal(taskId);
            }

            if (e.target.closest('.btn-delete')) {
                this.openConfirmModal(taskId);
            }
        });

        // ---- BOTÕES DE EXPORTAR/IMPORTAR JSON ----
        document.getElementById('btnExportJson').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('btnImportJson').addEventListener('click', () => {
            // Simula clique no input file oculto
            document.getElementById('fileInput').click();
        });

        // Quando o usuário seleciona um arquivo para importar
        document.getElementById('fileInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.importData(file);
                // Limpa o input para permitir reimportar o mesmo arquivo
                e.target.value = '';
            }
        });
    }


    /* ==========================================================
       ==================== HANDLERS ============================
       ========================================================== */

    async handleAddTask() {
        const title = this.titleInput.value;
        const category = this.categorySelect.value;
        const priority = this.prioritySelect.value;
        const dueDate = this.dateInput.value;
        const description = this.descriptionInput.value;

        if (!title.trim()) {
            this.showToast('⚠️', 'Digite um título para a tarefa!');
            return;
        }

        try {
            await this.createTask(title, category, priority, dueDate, description);
            this.form.reset();
            this.showToast('✅', 'Tarefa salva no banco de dados!');
            this.titleInput.focus();
        } catch (error) {
            // Erro já tratado no createTask
        }
    }

    async handleEditTask() {
        const id = this.editTaskId.value;
        
        const updates = {
            title: this.editTitle.value.trim(),
            category: this.editCategory.value,
            priority: this.editPriority.value,
            dueDate: this.editDate.value || null,
            description: this.editDescription.value.trim()
        };

        if (!updates.title) {
            this.showToast('⚠️', 'O título não pode estar vazio!');
            return;
        }

        try {
            await this.updateTask(id, updates);
            this.closeModal(this.editModal);
            this.showToast('✏️', 'Tarefa atualizada no banco!');
        } catch (error) {
            // Erro já tratado
        }
    }

    async handleToggle(taskId) {
        try {
            const task = await this.toggleComplete(taskId);
            if (task && task.completed) {
                this.showToast('🎉', 'Tarefa concluída!');
            } else {
                this.showToast('↩️', 'Tarefa reaberta!');
            }
        } catch (error) {
            // Erro já tratado
        }
    }

    async handleConfirmDelete() {
        if (this.taskToDelete) {
            const card = document.querySelector(`[data-id="${this.taskToDelete}"]`);
            
            if (card) {
                card.classList.add('removing');
                setTimeout(async () => {
                    try {
                        await this.deleteTask(this.taskToDelete);
                        this.taskToDelete = null;
                        this.closeModal(this.confirmModal);
                        this.showToast('🗑️', 'Tarefa excluída do banco!');
                    } catch (error) {
                        // Erro já tratado
                    }
                }, 300);
            } else {
                try {
                    await this.deleteTask(this.taskToDelete);
                    this.taskToDelete = null;
                    this.closeModal(this.confirmModal);
                    this.showToast('🗑️', 'Tarefa excluída do banco!');
                } catch (error) {
                    // Erro já tratado
                }
            }
        }
    }


    /* ==========================================================
       ==================== MODAIS ==============================
       ========================================================== */

    openEditModal(taskId) {
        const task = this.getTaskById(taskId);
        if (!task) return;

        this.editTaskId.value = task.id;
        this.editTitle.value = task.title;
        this.editCategory.value = task.category;
        this.editPriority.value = task.priority;
        this.editDate.value = task.dueDate || '';
        this.editDescription.value = task.description;

        this.editModal.classList.add('active');
    }

    openConfirmModal(taskId) {
        this.taskToDelete = taskId;
        this.confirmModal.classList.add('active');
    }

    closeModal(modal) {
        modal.classList.remove('active');
    }


    /* ==========================================================
       ==================== RENDERIZAÇÃO ========================
       ========================================================== */

    renderTasks() {
        const tasks = this.getFilteredTasks();

        if (tasks.length === 0) {
            this.tasksList.innerHTML = '';
            this.tasksList.appendChild(this.createEmptyState());
            this.actionsBar.style.display = 'none';
            return;
        }

        this.tasksList.innerHTML = '';
        tasks.forEach(task => {
            this.tasksList.appendChild(this.createTaskCard(task));
        });

        const hasCompleted = this.tasks.some(t => t.completed);
        this.actionsBar.style.display = hasCompleted ? 'block' : 'none';
    }

    createEmptyState() {
        const div = document.createElement('div');
        div.className = 'empty-state';
        
        let message = 'Comece adicionando sua primeira tarefa acima!';
        let title = 'Nenhuma tarefa encontrada';
        
        if (this.currentSearch) {
            title = 'Nenhum resultado';
            message = `Nenhuma tarefa corresponde à busca "${this.currentSearch}"`;
        } else if (this.currentFilter === 'pendentes') {
            title = 'Tudo em dia! 🎉';
            message = 'Você não tem tarefas pendentes.';
        } else if (this.currentFilter === 'concluidas') {
            title = 'Nenhuma tarefa concluída';
            message = 'Complete suas tarefas para vê-las aqui.';
        }
        
        div.innerHTML = `
            <div class="empty-icon">📋</div>
            <h3>${title}</h3>
            <p>${message}</p>
        `;
        return div;
    }

    createTaskCard(task) {
        const card = document.createElement('div');
        card.className = `task-card priority-${task.priority} ${task.completed ? 'completed' : ''}`;
        card.dataset.id = task.id;

        const categoryEmojis = {
            pessoal: '🏠', trabalho: '💼', estudos: '📚',
            saude: '💪', financas: '💰', outros: '📌'
        };

        const priorityLabels = { baixa: '🟢 Baixa', media: '🟡 Média', alta: '🔴 Alta' };

        let dateHtml = '';
        if (task.dueDate) {
            const isOverdue = this.isOverdue(task);
            const dateClass = isOverdue && !task.completed ? 'badge-overdue' : 'badge-date';
            const dateLabel = isOverdue && !task.completed ? '⏰ Atrasada' : `📅 ${this.formatDate(task.dueDate)}`;
            dateHtml = `<span class="badge ${dateClass}">${dateLabel}</span>`;
        }

        const descriptionHtml = task.description
            ? `<p class="task-description">${this.escapeHtml(task.description)}</p>`
            : '';

        card.innerHTML = `
            <div class="task-card-top">
                <input type="checkbox" class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    aria-label="Marcar como ${task.completed ? 'pendente' : 'concluída'}">
                <div class="task-content">
                    <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                    <div class="task-meta">
                        <span class="badge badge-category">
                            ${categoryEmojis[task.category] || '📌'} ${task.category}
                        </span>
                        <span class="badge badge-priority-${task.priority}">
                            ${priorityLabels[task.priority]}
                        </span>
                        ${dateHtml}
                    </div>
                    ${descriptionHtml}
                </div>
                <div class="task-actions">
                    <button class="btn-action btn-edit" title="Editar">✏️</button>
                    <button class="btn-action btn-delete" title="Excluir">🗑️</button>
                </div>
            </div>
        `;

        return card;
    }


    /* ==========================================================
       ==================== ESTATÍSTICAS ========================
       ========================================================== */

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const urgent = this.tasks.filter(t => t.priority === 'alta' && !t.completed).length;

        this.statTotal.querySelector('.stat-number').textContent = total;
        this.statPending.querySelector('.stat-number').textContent = pending;
        this.statCompleted.querySelector('.stat-number').textContent = completed;
        this.statUrgent.querySelector('.stat-number').textContent = urgent;
    }


    /* ==========================================================
       ==================== UTILIDADES ==========================
       ========================================================== */

    updateCurrentDate() {
        const now = new Date();
        const formatted = now.toLocaleDateString('pt-BR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        document.getElementById('currentDate').textContent = 
            formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    }

    isOverdue(task) {
        if (!task.dueDate || task.completed) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate + 'T00:00:00');
        return dueDate < today;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /*
       Atualiza o indicador visual de conexão com o servidor
       - connected = true: bolinha verde pulsante + "Conectado ao servidor"
       - connected = false: bolinha vermelha + "Desconectado"
    */
    updateConnectionStatus(connected) {
        if (connected) {
            this.saveIndicator.classList.remove('disconnected');
            this.saveText.textContent = `Sincronizado com db.json • ${new Date().toLocaleTimeString('pt-BR')}`;
        } else {
            this.saveIndicator.classList.add('disconnected');
            this.saveText.textContent = 'Desconectado do servidor';
        }
    }

    showToast(icon, message, duration = 3000) {
        this.toastIcon.textContent = icon;
        this.toastMessage.textContent = message;
        this.toast.classList.add('show');
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, duration);
    }
}


/* ================================================================
   INICIALIZAÇÃO
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
    console.log('✅ ToDo List Inteligente carregado!');
    console.log('💾 Backend: Node.js + Express');
    console.log('📁 Banco de dados: db.json');
    console.log('💡 Dica: acesse "app" no console para debug');
});
