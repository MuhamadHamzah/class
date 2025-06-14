class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadTasks();
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
        
        // Enter key on input
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Input validation
        document.getElementById('taskInput').addEventListener('input', (e) => {
            const addBtn = document.getElementById('addTaskBtn');
            addBtn.disabled = !e.target.value.trim();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    addTask() {
        const input = document.getElementById('taskInput');
        const text = input.value.trim();
        
        if (!text) return;

        const task = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: new Date()
        };

        this.tasks.unshift(task);
        input.value = '';
        document.getElementById('addTaskBtn').disabled = true;
        
        this.saveTasks();
        this.render();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    deleteTask(id) {
        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        if (taskElement) {
            taskElement.classList.add('removing');
            setTimeout(() => {
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.saveTasks();
                this.render();
            }, 200);
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    updateStats() {
        const totalCount = this.tasks.length;
        const completedCount = this.tasks.filter(task => task.completed).length;
        const activeCount = totalCount - completedCount;
        const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

        // Update stat cards
        document.getElementById('activeCount').textContent = activeCount;
        document.getElementById('completedCount').textContent = completedCount;
        document.getElementById('progressPercent').textContent = Math.round(progressPercentage) + '%';

        // Update filter counts
        document.getElementById('allCount').textContent = totalCount;
        document.getElementById('activeFilterCount').textContent = activeCount;
        document.getElementById('completedFilterCount').textContent = completedCount;

        // Update progress bar
        const progressSection = document.getElementById('progressSection');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        if (totalCount > 0) {
            progressSection.style.display = 'block';
            progressFill.style.width = progressPercentage + '%';
            progressText.textContent = `${completedCount} of ${totalCount} tasks`;
        } else {
            progressSection.style.display = 'none';
        }
    }

    updateEmptyState() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            tasksList.style.display = 'none';
            emptyState.style.display = 'block';

            const emptyTitle = document.getElementById('emptyTitle');
            const emptyMessage = document.getElementById('emptyMessage');

            switch (this.currentFilter) {
                case 'completed':
                    emptyTitle.textContent = 'No completed tasks yet';
                    emptyMessage.textContent = 'Complete some tasks to see them here!';
                    break;
                case 'active':
                    emptyTitle.textContent = 'No active tasks';
                    emptyMessage.textContent = 'All tasks are completed! Great job!';
                    break;
                default:
                    emptyTitle.textContent = 'No tasks yet';
                    emptyMessage.textContent = 'Add your first task to get started';
            }
        } else {
            tasksList.style.display = 'flex';
            emptyState.style.display = 'none';
        }
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const filteredTasks = this.getFilteredTasks();

        tasksList.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'completed' : ''}" onclick="taskManager.toggleTask('${task.id}')">
                    ${task.completed ? `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20,6 9,17 4,12"/>
                        </svg>
                    ` : ''}
                </div>
                <div class="task-content">
                    <div class="task-text ${task.completed ? 'completed' : ''}">${this.escapeHtml(task.text)}</div>
                    <div class="task-date">
                        Added ${task.createdAt.toLocaleDateString()} at ${task.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
                <button class="task-delete" onclick="taskManager.deleteTask('${task.id}')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    render() {
        this.updateStats();
        this.renderTasks();
        this.updateEmptyState();
    }

    saveTasks() {
        localStorage.setItem('classTasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('classTasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks).map(task => ({
                ...task,
                createdAt: new Date(task.createdAt)
            }));
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the task manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});