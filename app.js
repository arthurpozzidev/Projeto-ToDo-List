/* ================================================================
   APP.JS - Lógica do ToDo List Inteligente
   
   ESTE ARQUIVO CONTÉM:
   1. Classe TodoApp (gerenciador principal)
   2. CRUD completo (Create, Read, Update, Delete)
   3. Persistência com localStorage (dados salvos no navegador)
   4. Filtros, busca e ordenação
   5. Manipulação do DOM (atualização da interface)
   
   CONCEITOS IMPORTANTES USADOS:
   - Classes JavaScript (ES6+)
   - localStorage para persistência de dados
   - JSON para serialização/deserialização de dados
   - addEventListener para eventos do DOM
   - Template Literals para criar HTML dinâmico
   - Array methods (filter, sort, map, find, findIndex)
   - Date API para manipulação de datas
   ================================================================ */


/* ================================================================
   CLASSE TodoApp
   
   Uma CLASSE é como um "molde" ou "blueprint" que define:
   - PROPRIEDADES (dados que ela guarda)
   - MÉTODOS (funções que ela pode executar)
   
   Pense nela como um "robô" que sabe fazer tudo relacionado
   às tarefas: criar, ler, atualizar, deletar, filtrar, etc.
   ================================================================ */
class TodoApp {

    /* ==========================================================
       CONSTRUCTOR - Método especial chamado automaticamente
       quando criamos uma NOVA instância da classe com "new TodoApp()"
       
       Aqui definimos as propriedades iniciais e configuramos o app
       ========================================================== */
    constructor() {
        // ============================================
        // PROPRIEDADES DA CLASSE
        // ============================================
        
        /* 
           this.tasks = Array (lista) que guarda TODAS as tarefas
           - Cada tarefa é um OBJETO com propriedades como id, title, etc.
           - Carregamos do localStorage (se houver dados salvos) ou começamos vazio
        */
        this.tasks = this.loadFromStorage();
        
        /*
           Filtro e busca ativos atualmente
           - currentFilter: 'todas', 'pendentes' ou 'concluidas'
           - currentSearch: texto que o usuário digitou na busca
           - currentSort: tipo de ordenação selecionado
        */
        this.currentFilter = 'todas';
        this.currentSearch = '';
        this.currentSort = 'recentes';
        
        /*
           ID da tarefa que será excluída (usado pelo modal de confirmação)
           Guardamos aqui para saber QUAL tarefa excluir quando o usuário confirmar
        */
        this.taskToDelete = null;

        // ============================================
        // REFERÊNCIAS AOS ELEMENTOS DO DOM
        // ============================================
        /*
           document.getElementById('id') busca um elemento HTML pelo seu atributo id
           Guardamos referências para não precisar buscar toda vez que usarmos
        */
        
        // Formulário principal de adicionar tarefa
        this.form = document.getElementById('taskForm');
        this.titleInput = document.getElementById('taskTitle');
        this.categorySelect = document.getElementById('taskCategory');
        this.prioritySelect = document.getElementById('taskPriority');
        this.dateInput = document.getElementById('taskDate');
        this.descriptionInput = document.getElementById('taskDescription');
        this.btnSubmit = document.getElementById('btnSubmit');
        
        // Container onde os cards das tarefas são renderizados
        this.tasksList = document.getElementById('tasksList');
        this.emptyState = document.getElementById('emptyState');
        
        // Controles de busca, filtro e ordenação
        this.searchInput = document.getElementById('searchInput');
        this.sortSelect = document.getElementById('sortSelect');
        
        // Elementos de estatísticas (cards no topo)
        this.statTotal = document.getElementById('statTotal');
        this.statPending = document.getElementById('statPending');
        this.statCompleted = document.getElementById('statCompleted');
        this.statUrgent = document.getElementById('statUrgent');
        
        // Modal de edição
        this.editModal = document.getElementById('editModal');
        this.editForm = document.getElementById('editForm');
        this.editTaskId = document.getElementById('editTaskId');
        this.editTitle = document.getElementById('editTitle');
        this.editCategory = document.getElementById('editCategory');
        this.editPriority = document.getElementById('editPriority');
        this.editDate = document.getElementById('editDate');
        this.editDescription = document.getElementById('editDescription');
        
        // Modal de confirmação de exclusão
        this.confirmModal = document.getElementById('confirmModal');
        
        // Barra de ações (botão limpar concluídas)
        this.actionsBar = document.getElementById('actionsBar');
        
        // Toast (notificação)
        this.toast = document.getElementById('toast');
        this.toastIcon = document.getElementById('toastIcon');
        this.toastMessage = document.getElementById('toastMessage');

        // ============================================
        // INICIALIZAÇÃO
        // ============================================
        
        // Conectar os EVENTOS (cliques, submits, digitação, etc.)
        this.bindEvents();
        
        // Mostrar a data atual no header
        this.updateCurrentDate();
        
        // Renderizar a lista de tarefas (caso existam dados salvos)
        this.renderTasks();
        
        // Atualizar as estatísticas
        this.updateStats();
    }

    /* ==========================================================
       ==================== PERSISTÊNCIA =======================
       LocalStorage + JSON
       
       localStorage é uma API do navegador que permite salvar dados
       como STRINGS no navegador do usuário. Os dados persistem mesmo
       após fechar o navegador.
       
       Como localStorage só aceita strings, usamos JSON para converter:
       - JSON.stringify(objeto) → converte objeto JavaScript em string JSON
       - JSON.parse(string) → converte string JSON de volta em objeto JavaScript
       ========================================================== */
    
    /*
       LOAD FROM STORAGE - Carrega as tarefas do localStorage
       
       Retorna:
       - O array de tarefas salvo, se existir
       - Um array vazio [], se não houver dados salvos
       
       try/catch: se o JSON estiver corrompido, retorna array vazio
       em vez de crashar o app
    */
    loadFromStorage() {
        try {
            // localStorage.getItem('chave') retorna a string salva naquela chave
            const data = localStorage.getItem('todoTasks');
            
            // Se 'data' existir (não é null), converte de JSON para objeto JS
            // Se não existir, retorna array vazio
            return data ? JSON.parse(data) : [];
        } catch (error) {
            // Se JSON.parse falhar (dados corrompidos), loga o erro
            console.error('Erro ao carregar dados do localStorage:', error);
            return [];
        }
    }

    /*
       SAVE TO STORAGE - Salva o array de tarefas no localStorage
       
       Converte this.tasks (array de objetos) em uma string JSON
       e salva no localStorage com a chave 'todoTasks'
    */
    saveToStorage() {
        try {
            // JSON.stringify converte o array em string JSON
            // Exemplo: [{id: 1, title: 'teste'}] → '[{"id":1,"title":"teste"}]'
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Erro ao salvar dados no localStorage:', error);
        }
    }


    /* ==========================================================
       ==================== CRUD ================================
       Create, Read, Update, Delete - As 4 operações básicas
       ========================================================== */

    /* ----------------------------------------------------------
       CREATE - Criar uma nova tarefa
       
       Recebe os dados do formulário e cria um OBJETO tarefa
       com todas as propriedades necessárias
       ---------------------------------------------------------- */
    createTask(title, category, priority, dueDate, description) {
        /*
           Criamos um OBJETO (literal object) que representa a tarefa
           
           Cada tarefa tem as seguintes propriedades:
        */
        const task = {
            // ID único: timestamp atual em milissegundos + número aleatório
            // Isso garante que cada tarefa tenha um ID diferente
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            
            // Dados da tarefa:
            title: title.trim(),           // trim() remove espaços extras no início/fim
            category: category,
            priority: priority,
            dueDate: dueDate || null,       // Se não tem data, guarda null
            description: description.trim(),
            
            // Status:
            completed: false,               // Começa como não concluída
            
            // Timestamps (marcas de tempo):
            createdAt: new Date().toISOString(),  // Data/hora de criação em formato ISO
            completedAt: null                      // Será preenchido quando concluir
        };

        /*
           this.tasks.push(task) → Adiciona a nova tarefa ao FINAL do array
           
           O método push() modifica o array original adicionando um novo item
        */
        this.tasks.push(task);
        
        // Salva o array atualizado no localStorage
        this.saveToStorage();
        
        // Retorna a tarefa criada (pode ser útil para debug ou confirmação)
        return task;
    }

    /* ----------------------------------------------------------
       READ - Ler/buscar tarefas
       
       getTaskById: Busca UMA tarefa específica pelo ID
       getAllTasks: Retorna TODAS as tarefas
       getFilteredTasks: Retorna tarefas filtradas e ordenadas
       ---------------------------------------------------------- */
    
    /*
       Busca uma tarefa pelo ID usando Array.find()
       
       find() percorre o array e retorna o PRIMEIRO item onde a
       condição (callback) retorna true. Se nenhum item satisfizer
       a condição, retorna undefined.
       
       task => task.id === id é uma Arrow Function (função seta):
       - Recebe cada 'task' do array
       - Retorna true se o id da task é igual ao id buscado
    */
    getTaskById(id) {
        return this.tasks.find(task => task.id === id);
    }

    /* Retorna todas as tarefas (cópia do array com spread operator) */
    getAllTasks() {
        // [...this.tasks] cria uma CÓPIA do array
        // Isso evita que modificações externas afetem o array original
        return [...this.tasks];
    }

    /*
       Retorna tarefas com filtro de status, busca e ordenação aplicados
       
       Este é o método mais complexo do READ, pois combina:
       1. Filtro por status (todas/pendentes/concluídas)
       2. Busca por texto (no título e descrição)
       3. Ordenação (recentes, antigas, prioridade, prazo, A-Z)
    */
    getFilteredTasks() {
        // ---- PASSO 1: Filtra por STATUS ----
        let filtered = this.tasks.filter(task => {
            /*
               filter() cria um NOVO array contendo apenas os itens
               que satisfazem a condição (retornam true)
            */
            if (this.currentFilter === 'pendentes') return !task.completed;
            if (this.currentFilter === 'concluidas') return task.completed;
            return true; // 'todas' → retorna todos os itens
        });

        // ---- PASSO 2: Filtra por BUSCA ----
        if (this.currentSearch) {
            // Converte a busca para minúsculas para comparação case-insensitive
            const search = this.currentSearch.toLowerCase();
            
            filtered = filtered.filter(task => {
                // Verifica se o título OU a descrição contém o texto buscado
                // includes() retorna true se a string contém o texto
                return task.title.toLowerCase().includes(search) ||
                       task.description.toLowerCase().includes(search);
            });
        }

        // ---- PASSO 3: ORDENA os resultados ----
        filtered.sort((a, b) => {
            /*
               sort() ordena o array "in place" (modifica o original)
               
               A função de comparação recebe dois elementos (a, b) e retorna:
               - Número negativo: 'a' vem ANTES de 'b'
               - Zero: mantém a ordem
               - Número positivo: 'a' vem DEPOIS de 'b'
            */
            switch (this.currentSort) {
                case 'recentes':
                    // Mais recente primeiro: compara timestamps em ordem decrescente
                    return new Date(b.createdAt) - new Date(a.createdAt);
                    
                case 'antigas':
                    // Mais antiga primeiro: compara timestamps em ordem crescente
                    return new Date(a.createdAt) - new Date(b.createdAt);
                    
                case 'prioridade':
                    // Mapeamos as prioridades para números e ordenamos
                    const priorityOrder = { alta: 0, media: 1, baixa: 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                    
                case 'prazo':
                    // Tarefas com prazo mais próximo primeiro
                    // Tarefas sem prazo vão para o final
                    if (!a.dueDate) return 1;  // 'a' sem data vai pro final
                    if (!b.dueDate) return -1; // 'b' sem data vai pro final
                    return new Date(a.dueDate) - new Date(b.dueDate);
                    
                case 'alfabetica':
                    // Ordem alfabética usando localeCompare (respeita acentos)
                    return a.title.localeCompare(b.title, 'pt-BR');
                    
                default:
                    return 0;
            }
        });

        return filtered;
    }

    /* ----------------------------------------------------------
       UPDATE - Atualizar uma tarefa existente
       
       updateTask: Atualiza os dados de uma tarefa
       toggleComplete: Alterna o status de concluído
       ---------------------------------------------------------- */

    /*
       Atualiza uma tarefa existente com novos dados
       
       Recebe o id da tarefa e um objeto 'updates' com as
       propriedades que devem ser atualizadas
    */
    updateTask(id, updates) {
        /*
           findIndex() é similar ao find(), mas retorna o ÍNDICE (posição)
           do item no array, em vez do item em si.
           Retorna -1 se não encontrar.
        */
        const index = this.tasks.findIndex(task => task.id === id);
        
        // Se encontrou a tarefa (índice diferente de -1)
        if (index !== -1) {
            /*
               Spread Operator (...) + merge:
               
               { ...this.tasks[index], ...updates }
               
               Isso cria um NOVO objeto que:
               1. Copia todas as propriedades da tarefa original (...this.tasks[index])
               2. Sobrescreve com as propriedades do updates (...updates)
               
               Exemplo:
               original: { id: '1', title: 'Antigo', priority: 'baixa' }
               updates:  { title: 'Novo' }
               resultado: { id: '1', title: 'Novo', priority: 'baixa' }
            */
            this.tasks[index] = { ...this.tasks[index], ...updates };
            
            // Salva as alterações no localStorage
            this.saveToStorage();
            
            return this.tasks[index];
        }
        
        return null; // Tarefa não encontrada
    }

    /*
       Toggle Complete - Alterna entre concluído e pendente
       
       Se a tarefa está concluída → marca como pendente
       Se está pendente → marca como concluída
    */
    toggleComplete(id) {
        const task = this.getTaskById(id);
        
        if (task) {
            // O operador ! (NOT) inverte o valor booleano
            // true → false, false → true
            task.completed = !task.completed;
            
            // Se acabou de ser concluída, registra o momento
            // Se foi desmarcada, limpa o registro
            task.completedAt = task.completed ? new Date().toISOString() : null;
            
            this.saveToStorage();
            return task;
        }
        
        return null;
    }

    /* ----------------------------------------------------------
       DELETE - Excluir uma tarefa
       
       deleteTask: Remove uma tarefa pelo ID
       clearCompleted: Remove TODAS as tarefas concluídas
       ---------------------------------------------------------- */

    /*
       Remove uma tarefa do array pelo ID
    */
    deleteTask(id) {
        /*
           filter() cria um NOVO array contendo apenas os itens
           que NÃO têm o id especificado
           
           Ou seja, "filtra fora" a tarefa que queremos excluir
        */
        this.tasks = this.tasks.filter(task => task.id !== id);
        
        // Salva o array atualizado (sem a tarefa excluída)
        this.saveToStorage();
    }

    /*
       Remove todas as tarefas concluídas de uma vez
    */
    clearCompleted() {
        // Mantém apenas as tarefas que NÃO estão concluídas
        this.tasks = this.tasks.filter(task => !task.completed);
        this.saveToStorage();
    }


    /* ==========================================================
       ==================== EVENTOS =============================
       Conecta os eventos do DOM (cliques, submits, etc.)
       aos métodos da classe
       ========================================================== */

    bindEvents() {
        /*
           addEventListener('evento', callback)
           
           Registra uma função (callback) para ser executada quando
           o evento especificado ocorrer naquele elemento.
           
           Eventos comuns:
           - 'submit': quando um formulário é enviado
           - 'click': quando um elemento é clicado
           - 'input': quando o valor de um input muda
           - 'change': quando um select/checkbox muda
        */

        // ---- FORMULÁRIO DE ADICIONAR TAREFA ----
        this.form.addEventListener('submit', (e) => {
            /*
               e.preventDefault() impede o comportamento padrão do formulário,
               que seria recarregar a página ao enviar.
               
               Em vez disso, tratamos os dados com JavaScript.
            */
            e.preventDefault();
            this.handleAddTask();
        });

        // ---- CAMPO DE BUSCA ----
        // 'input' dispara a cada caractere digitado
        this.searchInput.addEventListener('input', (e) => {
            this.currentSearch = e.target.value;
            this.renderTasks();
        });

        // ---- BOTÕES DE FILTRO ----
        // Usamos querySelectorAll para selecionar TODOS os botões de filtro
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove 'active' de todos os botões
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                // Adiciona 'active' apenas no botão clicado
                e.target.classList.add('active');
                
                // Atualiza o filtro ativo usando o atributo data-filter do HTML
                this.currentFilter = e.target.dataset.filter;
                
                // Re-renderiza a lista com o novo filtro
                this.renderTasks();
            });
        });

        // ---- SELECT DE ORDENAÇÃO ----
        this.sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderTasks();
        });

        // ---- BOTÃO LIMPAR CONCLUÍDAS ----
        document.getElementById('btnClearCompleted').addEventListener('click', () => {
            this.clearCompleted();
            this.renderTasks();
            this.updateStats();
            this.showToast('🗑️', 'Tarefas concluídas removidas!');
        });

        // ---- MODAL DE EDIÇÃO: FORMULÁRIO ----
        this.editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditTask();
        });

        // ---- MODAL DE EDIÇÃO: BOTÃO FECHAR ----
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal(this.editModal);
        });

        // ---- MODAL DE CONFIRMAÇÃO: BOTÕES ----
        document.getElementById('btnCancelDelete').addEventListener('click', () => {
            this.closeModal(this.confirmModal);
        });

        document.getElementById('btnConfirmDelete').addEventListener('click', () => {
            this.handleConfirmDelete();
        });

        // ---- FECHAR MODAIS CLICANDO FORA (no overlay) ----
        /*
           Quando o usuário clica no overlay (fundo escuro),
           fechamos o modal. Mas só se clicou NO overlay,
           não no conteúdo do modal.
           
           e.target === modal verifica se o clique foi exatamente
           no overlay, e não em um filho dele (como o formulário).
        */
        [this.editModal, this.confirmModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // ---- FECHAR MODAIS COM TECLA ESC ----
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal(this.editModal);
                this.closeModal(this.confirmModal);
            }
        });

        // ---- DELEGAÇÃO DE EVENTOS NA LISTA DE TAREFAS ----
        /*
           EVENT DELEGATION (Delegação de Eventos):
           
           Em vez de adicionar um listener para CADA botão de cada tarefa
           (que pode ser muitos), adicionamos UM ÚNICO listener no container pai.
           
           Quando qualquer filho é clicado, o evento "sobe" (bubble) até o pai,
           e podemos verificar QUAL elemento foi clicado usando e.target.
           
           Vantagens:
           - Melhor performance (menos listeners)
           - Funciona para elementos criados dinamicamente (via JavaScript)
        */
        this.tasksList.addEventListener('click', (e) => {
            // closest() busca o ancestral mais próximo que corresponde ao seletor
            const card = e.target.closest('.task-card');
            if (!card) return; // Clicou fora de um card

            // Pega o ID da tarefa do atributo data-id do card
            const taskId = card.dataset.id;

            // ---- CHECKBOX: toggle complete ----
            if (e.target.classList.contains('task-checkbox')) {
                this.toggleComplete(taskId);
                this.renderTasks();
                this.updateStats();
                
                // Mostra feedback diferente para concluir/desconcluir
                const task = this.getTaskById(taskId);
                if (task && task.completed) {
                    this.showToast('🎉', 'Tarefa concluída!');
                } else {
                    this.showToast('↩️', 'Tarefa reaberta!');
                }
            }

            // ---- BOTÃO EDITAR ----
            if (e.target.closest('.btn-edit')) {
                this.openEditModal(taskId);
            }

            // ---- BOTÃO DELETAR ----
            if (e.target.closest('.btn-delete')) {
                this.openConfirmModal(taskId);
            }
        });

        // Também captura mudanças no checkbox via 'change'
        this.tasksList.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                const card = e.target.closest('.task-card');
                if (card) {
                    const taskId = card.dataset.id;
                    this.toggleComplete(taskId);
                    this.renderTasks();
                    this.updateStats();
                }
            }
        });
    }


    /* ==========================================================
       ==================== HANDLERS ============================
       Funções que processam as ações do usuário
       ========================================================== */

    /*
       HANDLER: Adicionar Nova Tarefa
       Coleta os valores dos inputs e chama createTask()
    */
    handleAddTask() {
        // Coleta os valores dos campos do formulário
        const title = this.titleInput.value;
        const category = this.categorySelect.value;
        const priority = this.prioritySelect.value;
        const dueDate = this.dateInput.value;
        const description = this.descriptionInput.value;

        // Validação: título é obrigatório
        if (!title.trim()) {
            this.showToast('⚠️', 'Digite um título para a tarefa!');
            return;
        }

        // Chama o método CREATE do CRUD
        this.createTask(title, category, priority, dueDate, description);

        // Limpa o formulário para uma nova entrada
        this.form.reset();

        // Re-renderiza a lista e atualiza estatísticas
        this.renderTasks();
        this.updateStats();

        // Mostra notificação de sucesso
        this.showToast('✅', 'Tarefa adicionada com sucesso!');

        // Coloca o foco de volta no campo de título para facilitar
        this.titleInput.focus();
    }

    /*
       HANDLER: Editar Tarefa
       Coleta os valores do modal de edição e chama updateTask()
    */
    handleEditTask() {
        const id = this.editTaskId.value;
        
        // Objeto com os campos atualizados
        const updates = {
            title: this.editTitle.value.trim(),
            category: this.editCategory.value,
            priority: this.editPriority.value,
            dueDate: this.editDate.value || null,
            description: this.editDescription.value.trim()
        };

        // Validação
        if (!updates.title) {
            this.showToast('⚠️', 'O título não pode estar vazio!');
            return;
        }

        // Chama o método UPDATE do CRUD
        this.updateTask(id, updates);

        // Fecha o modal, re-renderiza e mostra feedback
        this.closeModal(this.editModal);
        this.renderTasks();
        this.updateStats();
        this.showToast('✏️', 'Tarefa atualizada!');
    }

    /*
       HANDLER: Confirmar Exclusão
       Chamado quando o usuário confirma no modal de exclusão
    */
    handleConfirmDelete() {
        if (this.taskToDelete) {
            // Encontra o card no DOM para animar antes de remover
            const card = document.querySelector(`[data-id="${this.taskToDelete}"]`);
            
            if (card) {
                // Adiciona classe de animação de saída
                card.classList.add('removing');
                
                // Aguarda a animação terminar (300ms) antes de realmente excluir
                setTimeout(() => {
                    // Chama o método DELETE do CRUD
                    this.deleteTask(this.taskToDelete);
                    this.taskToDelete = null;
                    
                    this.closeModal(this.confirmModal);
                    this.renderTasks();
                    this.updateStats();
                    this.showToast('🗑️', 'Tarefa excluída!');
                }, 300);
            } else {
                // Se o card não foi encontrado no DOM, exclui direto
                this.deleteTask(this.taskToDelete);
                this.taskToDelete = null;
                this.closeModal(this.confirmModal);
                this.renderTasks();
                this.updateStats();
                this.showToast('🗑️', 'Tarefa excluída!');
            }
        }
    }


    /* ==========================================================
       ==================== MODAIS ==============================
       Controle de abertura e fechamento dos modais
       ========================================================== */

    /*
       Abre o modal de edição e preenche com os dados da tarefa
    */
    openEditModal(taskId) {
        const task = this.getTaskById(taskId);
        
        if (!task) return;

        // Preenche os campos do formulário de edição com os dados atuais
        this.editTaskId.value = task.id;
        this.editTitle.value = task.title;
        this.editCategory.value = task.category;
        this.editPriority.value = task.priority;
        this.editDate.value = task.dueDate || '';
        this.editDescription.value = task.description;

        // Mostra o modal adicionando a classe 'active'
        this.editModal.classList.add('active');
    }

    /*
       Abre o modal de confirmação de exclusão
    */
    openConfirmModal(taskId) {
        // Guarda o ID da tarefa para excluir depois da confirmação
        this.taskToDelete = taskId;
        this.confirmModal.classList.add('active');
    }

    /*
       Fecha qualquer modal removendo a classe 'active'
    */
    closeModal(modal) {
        modal.classList.remove('active');
    }


    /* ==========================================================
       ==================== RENDERIZAÇÃO ========================
       Atualiza a interface do usuário com base nos dados
       ========================================================== */

    /*
       RENDER TASKS - Renderiza (desenha) os cards de tarefas no DOM
       
       Este é o método principal de atualização da interface.
       Ele limpa a lista atual e recria todos os cards baseado
       nos dados filtrados/ordenados.
    */
    renderTasks() {
        // Busca as tarefas já filtradas e ordenadas
        const tasks = this.getFilteredTasks();

        // Se não há tarefas, mostra o estado vazio
        if (tasks.length === 0) {
            this.tasksList.innerHTML = '';
            this.tasksList.appendChild(this.createEmptyState());
            this.actionsBar.style.display = 'none';
            return;
        }

        // Limpa a lista atual
        this.tasksList.innerHTML = '';

        /*
           Para cada tarefa, cria um card HTML e adiciona à lista
           
           forEach() executa uma função para cada item do array
        */
        tasks.forEach(task => {
            const card = this.createTaskCard(task);
            this.tasksList.appendChild(card);
        });

        // Mostra/esconde o botão "Limpar Concluídas"
        const hasCompleted = this.tasks.some(t => t.completed);
        this.actionsBar.style.display = hasCompleted ? 'block' : 'none';
    }

    /*
       Cria o elemento HTML do estado vazio
    */
    createEmptyState() {
        const div = document.createElement('div');
        div.className = 'empty-state';
        
        // Mensagem diferente baseada no filtro/busca ativo
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

    /*
       CREATE TASK CARD - Cria o elemento HTML de um card de tarefa
       
       Usa document.createElement e innerHTML para construir o HTML
       de forma dinâmica baseado nos dados da tarefa.
    */
    createTaskCard(task) {
        /*
           document.createElement('div') cria um novo <div> na memória
           (ainda não está visível na página)
        */
        const card = document.createElement('div');
        
        // Define as classes CSS do card
        // - 'task-card' é a classe base
        // - 'priority-xxx' define a cor da borda esquerda
        // - 'completed' aplica os estilos de tarefa concluída
        card.className = `task-card priority-${task.priority} ${task.completed ? 'completed' : ''}`;
        
        // data-id armazena o ID da tarefa no elemento HTML
        // Usado para identificar qual tarefa foi clicada
        card.dataset.id = task.id;

        // ---- Monta os BADGES (etiquetas) ----
        
        // Mapeia cada categoria para seu emoji correspondente
        const categoryEmojis = {
            pessoal: '🏠', trabalho: '💼', estudos: '📚',
            saude: '💪', financas: '💰', outros: '📌'
        };

        // Mapeia cada prioridade para seu texto de exibição
        const priorityLabels = { baixa: '🟢 Baixa', media: '🟡 Média', alta: '🔴 Alta' };

        // Monta o HTML do badge de data (se houver prazo)
        let dateHtml = '';
        if (task.dueDate) {
            const isOverdue = this.isOverdue(task);
            const dateClass = isOverdue && !task.completed ? 'badge-overdue' : 'badge-date';
            const dateLabel = isOverdue && !task.completed ? '⏰ Atrasada' : `📅 ${this.formatDate(task.dueDate)}`;
            dateHtml = `<span class="badge ${dateClass}">${dateLabel}</span>`;
        }

        // Monta o HTML da descrição (se houver)
        const descriptionHtml = task.description
            ? `<p class="task-description">${this.escapeHtml(task.description)}</p>`
            : '';

        /*
           TEMPLATE LITERAL (Template String):
           
           Usa crases (` `) em vez de aspas, permitindo:
           1. Strings multi-linha
           2. Interpolação com ${expressão} (insere valores dinâmicos)
           
           Aqui construímos todo o HTML interno do card
        */
        card.innerHTML = `
            <div class="task-card-top">
                <!-- Checkbox customizado para marcar como concluído -->
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    aria-label="Marcar como ${task.completed ? 'pendente' : 'concluída'}"
                >
                
                <!-- Conteúdo principal: título, badges, descrição -->
                <div class="task-content">
                    <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                    
                    <div class="task-meta">
                        <!-- Badge de categoria -->
                        <span class="badge badge-category">
                            ${categoryEmojis[task.category] || '📌'} ${task.category}
                        </span>
                        
                        <!-- Badge de prioridade -->
                        <span class="badge badge-priority-${task.priority}">
                            ${priorityLabels[task.priority]}
                        </span>
                        
                        <!-- Badge de data (se existir) -->
                        ${dateHtml}
                    </div>
                    
                    <!-- Descrição (se existir) -->
                    ${descriptionHtml}
                </div>

                <!-- Botões de ação: Editar e Excluir -->
                <div class="task-actions">
                    <button class="btn-action btn-edit" aria-label="Editar tarefa" title="Editar">
                        ✏️
                    </button>
                    <button class="btn-action btn-delete" aria-label="Excluir tarefa" title="Excluir">
                        🗑️
                    </button>
                </div>
            </div>
        `;

        return card;
    }


    /* ==========================================================
       ==================== ESTATÍSTICAS ========================
       Calcula e exibe os números nos cards do header
       ========================================================== */

    updateStats() {
        // Conta total de tarefas
        const total = this.tasks.length;
        
        // Conta tarefas concluídas usando filter().length
        const completed = this.tasks.filter(t => t.completed).length;
        
        // Pendentes = total menos concluídas
        const pending = total - completed;
        
        // Urgentes = prioridade alta E não concluídas
        const urgent = this.tasks.filter(t => t.priority === 'alta' && !t.completed).length;

        // Atualiza os números no DOM
        // querySelector busca o PRIMEIRO elemento que corresponde ao seletor CSS
        this.statTotal.querySelector('.stat-number').textContent = total;
        this.statPending.querySelector('.stat-number').textContent = pending;
        this.statCompleted.querySelector('.stat-number').textContent = completed;
        this.statUrgent.querySelector('.stat-number').textContent = urgent;
    }


    /* ==========================================================
       ==================== UTILIDADES ==========================
       Funções auxiliares usadas por outros métodos
       ========================================================== */

    /*
       Atualiza a data atual exibida no header
       
       Usa Intl.DateTimeFormat para formatar a data no padrão brasileiro
    */
    updateCurrentDate() {
        const now = new Date();
        
        /*
           toLocaleDateString() formata a data de acordo com o locale (idioma/região)
           
           'pt-BR' = Português do Brasil
           
           Opções de formatação:
           - weekday: 'long' → nome completo do dia (segunda-feira, terça-feira, etc.)
           - year: 'numeric' → ano com 4 dígitos (2024)
           - month: 'long' → nome completo do mês (janeiro, fevereiro, etc.)
           - day: 'numeric' → dia sem zero à esquerda
        */
        const formatted = now.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Capitaliza a primeira letra (JavaScript retorna dia da semana em minúscula)
        document.getElementById('currentDate').textContent = 
            formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    /*
       Formata uma string de data ('2024-12-25') para o padrão brasileiro ('25/12/2024')
    */
    formatDate(dateStr) {
        if (!dateStr) return '';
        
        // Cria um objeto Date a partir da string
        // Adiciona 'T00:00:00' para evitar problemas de timezone
        const date = new Date(dateStr + 'T00:00:00');
        
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',    // Dia com 2 dígitos (01, 02, ..., 31)
            month: '2-digit',  // Mês com 2 dígitos (01, 02, ..., 12)
            year: 'numeric'    // Ano completo (2024)
        });
    }

    /*
       Verifica se uma tarefa está com prazo vencido
       
       Compara a data do prazo com a data atual
    */
    isOverdue(task) {
        if (!task.dueDate || task.completed) return false;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas a data
        
        const dueDate = new Date(task.dueDate + 'T00:00:00');
        
        // Se a data do prazo é ANTERIOR a hoje, está vencida
        return dueDate < today;
    }

    /*
       ESCAPE HTML - Segurança contra XSS (Cross-Site Scripting)
       
       Converte caracteres especiais do HTML em entidades seguras.
       Isso impede que texto digitado pelo usuário seja interpretado
       como código HTML, evitando ataques de injeção de código.
       
       Exemplo:
       '<script>alert("hack")</script>' → '&lt;script&gt;alert("hack")&lt;/script&gt;'
    */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text; // textContent trata tudo como texto puro
        return div.innerHTML;   // innerHTML retorna o texto com caracteres escapados
    }

    /*
       SHOW TOAST - Mostra uma notificação temporária
       
       Parâmetros:
       - icon: emoji/ícone a ser exibido
       - message: texto da mensagem
       - duration: tempo em ms que a notificação fica visível (padrão: 3 segundos)
    */
    showToast(icon, message, duration = 3000) {
        this.toastIcon.textContent = icon;
        this.toastMessage.textContent = message;
        
        // Adiciona a classe 'show' que faz o toast deslizar para dentro
        this.toast.classList.add('show');
        
        /*
           setTimeout(callback, ms) executa a callback após X milissegundos
           
           Aqui, após 'duration' milissegundos, removemos a classe 'show'
           para que o toast deslize de volta para fora da tela
        */
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, duration);
    }
}


/* ================================================================
   INICIALIZAÇÃO DO APP
   
   Quando todo o HTML terminar de carregar (evento DOMContentLoaded),
   criamos uma nova instância da classe TodoApp.
   
   'new TodoApp()' chama o constructor, que:
   1. Carrega dados do localStorage
   2. Configura referências ao DOM
   3. Conecta eventos
   4. Renderiza a interface
   
   O app está pronto para uso!
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // Cria a instância global do app
    // window.app permite acessar o app pelo console do navegador (útil para debug)
    window.app = new TodoApp();
    
    console.log('✅ ToDo List Inteligente carregado com sucesso!');
    console.log('💡 Dica: acesse "app" no console para inspecionar os dados');
});
