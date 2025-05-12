
class TaskManager {
    constructor() {
        this.tasks = [];
        this.categories = [];
        this.currentView = 'list';
        this.currentDate = new Date();
        this.theme = localStorage.getItem('theme') || 'light';
        
        this.initElements();
        this.initEventListeners();
        this.loadData();
        this.setTheme(this.theme);
        this.render();
    }
    
    initElements() {
        this.elements = {
            themeToggle: document.getElementById('theme-toggle'),
            exportBtn: document.getElementById('export-btn'),
            importBtn: document.getElementById('import-btn'),
            addTaskBtn: document.getElementById('add-task-btn'),
            applyFiltersBtn: document.getElementById('apply-filters'),
            resetFiltersBtn: document.getElementById('reset-filters'),
            
            priorityFilter: document.getElementById('priority-filter'),
            categoryFilter: document.getElementById('category-filter'),
            statusFilter: document.getElementById('status-filter'),
            
            listView: document.getElementById('list-view'),
            calendarView: document.getElementById('calendar-view'),
            kanbanView: document.getElementById('kanban-view'),
            viewBtns: document.querySelectorAll('.view-btn'),
            

            taskListContainer: document.getElementById('task-list-container'),
            
            prevMonthBtn: document.getElementById('prev-month'),
            nextMonthBtn: document.getElementById('next-month'),
            currentMonthDisplay: document.getElementById('current-month'),
            calendarViewSelector: document.getElementById('calendar-view-selector'),
            calendarContainer: document.getElementById('calendar-container'),
            
            todoColumn: document.getElementById('todo-column'),
            inProgressColumn: document.getElementById('in-progress-column'),
            doneColumn: document.getElementById('done-column'),
            
            totalTasksEl: document.getElementById('total-tasks'),
            completedTasksEl: document.getElementById('completed-tasks'),
            overdueTasksEl: document.getElementById('overdue-tasks'),
            statsChart: document.getElementById('stats-chart'),
            
            taskModal: document.getElementById('task-modal'),
            categoryModal: document.getElementById('category-modal'),
            closeModalBtns: document.querySelectorAll('.close-modal'),
            cancelTaskBtn: document.getElementById('cancel-task'),
            cancelCategoryBtn: document.getElementById('cancel-category'),
            saveTaskBtn: document.getElementById('save-task'),
            saveCategoryBtn: document.getElementById('save-category'),
            addCategoryBtn: document.getElementById('add-category-btn'),
            
            taskForm: document.getElementById('task-form'),
            categoryForm: document.getElementById('category-form'),
            taskIdInput: document.getElementById('task-id'),
            taskTitleInput: document.getElementById('task-title'),
            taskDescriptionInput: document.getElementById('task-description'),
            taskDueDateInput: document.getElementById('task-due-date'),
            taskPriorityInput: document.getElementById('task-priority'),
            taskCategoryInput: document.getElementById('task-category'),
            taskTagsInput: document.getElementById('task-tags'),
            taskParentInput: document.getElementById('task-parent'),
            taskReminderInput: document.getElementById('task-reminder'),
            categoryNameInput: document.getElementById('category-name'),
            categoryParentInput: document.getElementById('category-parent'),
            categoryColorInput: document.getElementById('category-color'),
            
            modalTitle: document.getElementById('modal-title')
        };
    }
    
    initEventListeners() {
        this.elements.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        this.elements.viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchView(btn.dataset.view);
            });
        });
        
        this.elements.addTaskBtn.addEventListener('click', () => {
            this.openTaskModal();
        });
        
        this.elements.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });
        
        this.elements.cancelTaskBtn.addEventListener('click', () => {
            this.closeTaskModal();
        });
        
        this.elements.addCategoryBtn.addEventListener('click', () => {
            this.openCategoryModal();
        });
        
        this.elements.categoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });
        
        this.elements.cancelCategoryBtn.addEventListener('click', () => {
            this.closeCategoryModal();
        });
        
        this.elements.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.elements.taskModal.classList.contains('show')) {
                    this.closeTaskModal();
                } else if (this.elements.categoryModal.classList.contains('show')) {
                    this.closeCategoryModal();
                }
            });
        });
        
        this.elements.applyFiltersBtn.addEventListener('click', () => {
            this.render();
        });
        
        this.elements.resetFiltersBtn.addEventListener('click', () => {
            this.resetFilters();
        });
        
        this.elements.exportBtn.addEventListener('click', () => {
            this.exportData();
        });
        
        this.elements.importBtn.addEventListener('click', () => {
            this.importData();
        });
        
        this.elements.prevMonthBtn.addEventListener('click', () => {
            this.navigateCalendar(-1);
        });
        
        this.elements.nextMonthBtn.addEventListener('click', () => {
            this.navigateCalendar(1);
        });
        
        this.elements.calendarViewSelector.addEventListener('change', () => {
            this.renderCalendar();
        });
        
        this.setupDragAndDrop();
    }
    
    loadData() {
        const tasksData = localStorage.getItem('tasks');
        const categoriesData = localStorage.getItem('categories');
        
        if (tasksData) {
            this.tasks = JSON.parse(tasksData);
            this.tasks.forEach(task => {
                if (task.dueDate) task.dueDate = new Date(task.dueDate);
                if (task.completedAt) task.completedAt = new Date(task.completedAt);
                if (task.reminderTime) task.reminderTime = new Date(task.reminderTime);
            });
        }
        
        if (categoriesData) {
            this.categories = JSON.parse(categoriesData);
        } else {
            this.categories = [
                { id: '1', name: 'Praca', parentId: '', color: '#3a86ff' },
                { id: '2', name: 'Dom', parentId: '', color: '#2ecc71' },
                { id: '3', name: 'Projekty', parentId: '', color: '#8338ec' },
                { id: '4', name: 'Programowanie', parentId: '3', color: '#4361ee' },
                { id: '5', name: 'Design', parentId: '3', color: '#7209b7' }
            ];
            this.saveCategories();
        }
    }
    
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
    
    saveCategories() {
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }
    
    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    toggleTheme() {
        this.setTheme(this.theme === 'light' ? 'dark' : 'light');
    }
    
    switchView(view) {
        this.currentView = view;
        
        this.elements.viewBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        this.elements.listView.classList.toggle('hidden', view !== 'list');
        this.elements.calendarView.classList.toggle('hidden', view !== 'calendar');
        this.elements.kanbanView.classList.toggle('hidden', view !== 'kanban');
        
        if (view === 'calendar') {
            this.renderCalendar();
        } else if (view === 'kanban') {
            this.renderKanban();
        } else {
            this.renderTaskList();
        }
    }
    
    getFilteredTasks() {
        const priorityFilter = this.elements.priorityFilter.value;
        const categoryFilter = this.elements.categoryFilter.value;
        const statusFilter = this.elements.statusFilter.value;
        
        return this.tasks.filter(task => {
            if (priorityFilter !== 'all' && task.priority.toString() !== priorityFilter) {
                return false;
            }
            
            if (categoryFilter !== 'all') {
                if (categoryFilter === 'none' && task.categoryId) {
                    return false;
                }
                if (categoryFilter !== 'none' && task.categoryId !== categoryFilter) {
                    return false;
                }
            }
            
            if (statusFilter !== 'all') {
                if (statusFilter === 'todo' && task.status !== 'todo') {
                    return false;
                }
                if (statusFilter === 'in-progress' && task.status !== 'in-progress') {
                    return false;
                }
                if (statusFilter === 'done' && task.status !== 'done') {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    resetFilters() {
        this.elements.priorityFilter.value = 'all';
        this.elements.categoryFilter.value = 'all';
        this.elements.statusFilter.value = 'all';
        this.render();
    }
    
    render() {
        this.renderCategoriesDropdowns();
        this.renderStats();
        
        switch (this.currentView) {
            case 'list':
                this.renderTaskList();
                break;
            case 'calendar':
                this.renderCalendar();
                break;
            case 'kanban':
                this.renderKanban();
                break;
        }
    }
    
    renderTaskList() {
        const filteredTasks = this.getFilteredTasks();
        this.elements.taskListContainer.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            this.elements.taskListContainer.innerHTML = '<p class="no-tasks">Brak zadań spełniających kryteria.</p>';
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.elements.taskListContainer.appendChild(taskElement);
        });
    }
    
    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item priority-${task.priority} ${task.status} ${
            task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'overdue' : ''
        }`;
        taskElement.dataset.id = task.id;
        
        const category = this.categories.find(c => c.id === task.categoryId);
        const parentTask = task.parentId ? this.tasks.find(t => t.id === task.parentId) : null;
        
        let tagsHTML = '';
        if (task.tags && task.tags.length > 0) {
            tagsHTML = `<div class="task-tags">${
                task.tags.map(tag => `<span class="task-tag">${tag}</span>`).join('')
            }</div>`;
        }
        
        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-actions">
                    <button class="btn btn-small edit-task" data-id="${task.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-small delete-task" data-id="${task.id}"><i class="fas fa-trash"></i></button>
                    <button class="btn btn-small toggle-status" data-id="${task.id}">
                        <i class="fas fa-${
                            task.status === 'done' ? 'undo' : 'check'
                        }"></i>
                    </button>
                </div>
            </div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            <div class="task-details">
                ${task.dueDate ? `
                    <div class="task-detail">
                        <i class="fas fa-calendar-day"></i>
                        ${this.formatDate(task.dueDate)}
                    </div>
                ` : ''}
                ${category ? `
                    <div class="task-detail">
                        <i class="fas fa-folder" style="color: ${category.color}"></i>
                        ${this.getCategoryPath(category.id)}
                    </div>
                ` : ''}
                ${parentTask ? `
                    <div class="task-detail">
                        <i class="fas fa-level-up-alt"></i>
                        ${parentTask.title}
                    </div>
                ` : ''}
                <div class="task-detail">
                    <i class="fas fa-bolt"></i>
                    ${this.getPriorityName(task.priority)}
                </div>
            </div>
            ${tagsHTML}
        `;
        
        taskElement.querySelector('.edit-task').addEventListener('click', (e) => {
            this.openTaskModal(e.target.dataset.id);
        });
        
        taskElement.querySelector('.delete-task').addEventListener('click', (e) => {
            this.deleteTask(e.target.dataset.id);
        });
        
        taskElement.querySelector('.toggle-status').addEventListener('click', (e) => {
            this.toggleTaskStatus(e.target.dataset.id);
        });
        
        return taskElement;
    }
    
    renderCalendar() {
        const view = this.elements.calendarViewSelector.value;
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        this.elements.currentMonthDisplay.textContent = 
            `${this.getMonthName(month)} ${year}`;
        
        if (view === 'month') {
            this.renderMonthView(year, month);
        } else if (view === 'week') {
            this.renderWeekView(year, month, this.currentDate.getDate());
        } else {
            this.renderDayView(year, month, this.currentDate.getDate());
        }
    }
    
    renderMonthView(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; 
        
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        const nextMonthDays = 42 - (daysInMonth + startingDay); 
        
        let calendarHTML = '<table class="calendar-month"><tr>';
        

        const weekdays = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];
        weekdays.forEach(day => {
            calendarHTML += `<th>${day}</th>`;
        });
        
        calendarHTML += '</tr><tr>';
        
        for (let i = 0; i < startingDay; i++) {
            const day = prevMonthLastDay - startingDay + i + 1;
            calendarHTML += `<td class="other-month"><div class="calendar-day">${day}</div></td>`;
        }
        
        let dayCount = 1;
        for (let i = startingDay; i < 42; i++) {
            if (i > 0 && i % 7 === 0) {
                calendarHTML += '</tr><tr>';
            }
            
            if (dayCount <= daysInMonth) {
                const currentDate = new Date(year, month, dayCount);
                const isToday = this.isSameDay(currentDate, new Date());
                
                calendarHTML += `<td ${
                    isToday ? 'class="today"' : ''
                }><div class="calendar-day">${dayCount}</div>`;
                
                const tasksForDay = this.getTasksForDay(year, month, dayCount);
                if (tasksForDay.length > 0) {
                    calendarHTML += '<ul class="calendar-events">';
                    tasksForDay.forEach(task => {
                        calendarHTML += `<li class="calendar-event" data-id="${task.id}">${task.title}</li>`;
                    });
                    calendarHTML += '</ul>';
                }
                
                calendarHTML += '</td>';
                dayCount++;
            } else {
                const day = dayCount - daysInMonth;
                calendarHTML += `<td class="other-month"><div class="calendar-day">${day}</div></td>`;
                dayCount++;
            }
        }
        
        calendarHTML += '</tr></table>';
        this.elements.calendarContainer.innerHTML = calendarHTML;
        

        document.querySelectorAll('.calendar-event').forEach(event => {
            event.addEventListener('click', (e) => {
                this.openTaskModal(e.target.dataset.id);
            });
        });
    }
    
    renderWeekView(year, month, day) {

    }
    
    renderDayView(year, month, day) {

    }
    
    renderKanban() {
        this.elements.todoColumn.innerHTML = '';
        this.elements.inProgressColumn.innerHTML = '';
        this.elements.doneColumn.innerHTML = '';
        
        const filteredTasks = this.getFilteredTasks();
        
        filteredTasks.forEach(task => {
            const taskElement = this.createKanbanTaskElement(task);
            
            switch (task.status) {
                case 'todo':
                    this.elements.todoColumn.appendChild(taskElement);
                    break;
                case 'in-progress':
                    this.elements.inProgressColumn.appendChild(taskElement);
                    break;
                case 'done':
                    this.elements.doneColumn.appendChild(taskElement);
                    break;
            }
        });
    }
    
    createKanbanTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'kanban-task';
        taskElement.dataset.id = task.id;
        taskElement.draggable = true;
        
        taskElement.innerHTML = `
            <div class="task-title">${task.title}</div>
            ${task.dueDate ? `
                <div class="task-detail">
                    <i class="fas fa-calendar-day"></i>
                    ${this.formatDate(task.dueDate)}
                </div>
            ` : ''}
        `;
        
        taskElement.addEventListener('dblclick', () => {
            this.openTaskModal(task.id);
        });
        
        return taskElement;
    }
    
    setupDragAndDrop() {
        const kanbanColumns = document.querySelectorAll('.kanban-column');
        
        kanbanColumns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                const draggingTask = document.querySelector('.dragging');
                if (draggingTask) {
                    const afterElement = this.getDragAfterElement(column, e.clientY);
                    if (afterElement) {
                        column.insertBefore(draggingTask, afterElement);
                    } else {
                        column.appendChild(draggingTask);
                    }
                }
            });
            
            column.addEventListener('dragend', () => {
                const draggingTask = document.querySelector('.dragging');
                if (draggingTask) {
                    draggingTask.classList.remove('dragging');
                    
                    const taskId = draggingTask.dataset.id;
                    const newStatus = column.dataset.status;
                    const task = this.tasks.find(t => t.id === taskId);
                    
                    if (task && task.status !== newStatus) {
                        task.status = newStatus;
                        if (newStatus === 'done') {
                            task.completedAt = new Date();
                        }
                        this.saveTasks();
                        this.renderStats();
                    }
                }
            });
        });
        
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('kanban-task')) {
                e.target.classList.add('dragging');
            }
        });
    }
    
    getDragAfterElement(column, y) {
        const draggableElements = [...column.querySelectorAll('.kanban-task:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    renderStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.status === 'done').length;
        const overdueTasks = this.tasks.filter(task => 
            task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
        ).length;
        
        this.elements.totalTasksEl.textContent = totalTasks;
        this.elements.completedTasksEl.textContent = completedTasks;
        this.elements.overdueTasksEl.textContent = overdueTasks;
        
        this.renderChart();
    }
    
    renderChart() {
        const last6Months = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            last6Months.push({
                month: date.getMonth(),
                year: date.getFullYear(),
                label: `${this.getMonthName(date.getMonth())} ${date.getFullYear()}`
            });
        }
        
        const completedData = last6Months.map(month => {
            return this.tasks.filter(task => {
                if (!task.completedAt) return false;
                const completedDate = new Date(task.completedAt);
                return completedDate.getMonth() === month.month && 
                       completedDate.getFullYear() === month.year;
            }).length;
        });
        
        const createdData = last6Months.map(month => {
            return this.tasks.filter(task => {
                const createdDate = new Date(task.createdAt);
                return createdDate.getMonth() === month.month && 
                       createdDate.getFullYear() === month.year;
            }).length;
        });
        
        const labels = last6Months.map(month => month.label);
        
        const ctx = this.elements.statsChart.getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Nowe zadania',
                        data: createdData,
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Zakończone zadania',
                        data: completedData,
                        backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Aktywność w ostatnich miesiącach'
                    }
                }
            }
        });
    }
    
    renderCategoriesDropdowns() {
        this.elements.categoryFilter.innerHTML = `
            <option value="all">Wszystkie</option>
            <option value="none">Bez kategorii</option>
            ${this.generateCategoryOptions()}
        `;
        
        this.elements.taskCategoryInput.innerHTML = `
            <option value="">Brak kategorii</option>
            ${this.generateCategoryOptions()}
        `;
        
        this.elements.categoryParentInput.innerHTML = `
            <option value="">Brak (kategoria główna)</option>
            ${this.generateCategoryOptions(true)}
        `;
    }
    
    generateCategoryOptions(forParent = false) {
        let options = '';
        
        const addCategories = (parentId = '', indent = 0) => {
            const categories = this.categories.filter(c => c.parentId === parentId);
            
            categories.forEach(category => {
                const indentStr = '&nbsp;&nbsp;'.repeat(indent);
                const disabled = forParent && category.id === this.editingCategoryId ? 'disabled' : '';
                
                options += `<option value="${category.id}" ${disabled}>${indentStr}${category.name}</option>`;
                addCategories(category.id, indent + 1);
            });
        };
        
        addCategories();
        return options;
    }
    
    openTaskModal(taskId = null) {
        this.elements.taskIdInput.value = taskId || '';
        this.elements.modalTitle.textContent = taskId ? 'Edytuj zadanie' : 'Dodaj nowe zadanie';
        
        if (taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                this.elements.taskTitleInput.value = task.title;
                this.elements.taskDescriptionInput.value = task.description || '';
                this.elements.taskDueDateInput.value = task.dueDate ? 
                    this.formatDateForInput(task.dueDate) : '';
                this.elements.taskPriorityInput.value = task.priority;
                this.elements.taskCategoryInput.value = task.categoryId || '';
                this.elements.taskTagsInput.value = task.tags ? task.tags.join(', ') : '';
                this.elements.taskParentInput.value = task.parentId || '';
                this.elements.taskReminderInput.value = task.reminderMinutes || '';
            }
        } else {
            this.elements.taskForm.reset();
        }
        
        this.renderParentTasksDropdown(taskId);
        
        this.elements.taskModal.classList.add('show');
    }
    
    renderParentTasksDropdown(excludeTaskId = null) {
        this.elements.taskParentInput.innerHTML = '<option value="">Brak (zadanie główne)</option>';
        
        this.tasks.forEach(task => {
            if (task.id !== excludeTaskId && !task.parentId) {
                this.elements.taskParentInput.innerHTML += 
                    `<option value="${task.id}">${task.title}</option>`;
            }
        });
    }
    
    closeTaskModal() {
        this.elements.taskModal.classList.remove('show');
        this.elements.taskForm.reset();
    }
    
    saveTask() {
        const taskId = this.elements.taskIdInput.value;
        const title = this.elements.taskTitleInput.value.trim();
        const description = this.elements.taskDescriptionInput.value.trim();
        const dueDate = this.elements.taskDueDateInput.value;
        const priority = parseInt(this.elements.taskPriorityInput.value);
        const categoryId = this.elements.taskCategoryInput.value || null;
        const tags = this.elements.taskTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const parentId = this.elements.taskParentInput.value || null;
        const reminderMinutes = this.elements.taskReminderInput.value ? 
            parseInt(this.elements.taskReminderInput.value) : null;
        
        if (!title) {
            alert('Tytuł zadania jest wymagany!');
            return;
        }
        
        let reminderTime = null;
        if (reminderMinutes && dueDate) {
            const dueDateTime = new Date(dueDate).getTime();
            reminderTime = new Date(dueDateTime - reminderMinutes * 60000);
        }
        
        if (taskId) {
            const taskIndex = this.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                this.tasks[taskIndex] = {
                    ...this.tasks[taskIndex],
                    title,
                    description,
                    dueDate: dueDate ? new Date(dueDate) : null,
                    priority,
                    categoryId,
                    tags,
                    parentId,
                    reminderMinutes,
                    reminderTime
                };
            }
        } else {
            const newTask = {
                id: Date.now().toString(),
                title,
                description,
                dueDate: dueDate ? new Date(dueDate) : null,
                priority,
                categoryId,
                tags,
                parentId,
                status: 'todo',
                createdAt: new Date(),
                completedAt: null,
                reminderMinutes,
                reminderTime
            };
            
            this.tasks.push(newTask);
        }
        
        this.saveTasks();
        this.closeTaskModal();
        this.render();
    }
    
    deleteTask(taskId) {
        if (confirm('Czy na pewno chcesz usunąć to zadanie?')) {
            const hasSubtasks = this.tasks.some(t => t.parentId === taskId);
            
            if (hasSubtasks) {
                if (!confirm('To zadanie ma podzadania. Usunąć je również?')) {
                    return;
                }
                this.tasks = this.tasks.filter(t => t.parentId !== taskId);
            }
            
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.render();
        }
    }
    
    toggleTaskStatus(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            if (task.status === 'done') {
                task.status = 'todo';
                task.completedAt = null;
            } else {
                task.status = 'done';
                task.completedAt = new Date();
            }
            this.saveTasks();
            this.render();
            this.renderStats();
        }
    }
    
    openCategoryModal(categoryId = null) {
        this.editingCategoryId = categoryId || '';
        this.elements.categoryNameInput.value = '';
        this.elements.categoryParentInput.value = '';
        this.elements.categoryColorInput.value = '#3a86ff';
        
        if (categoryId) {
            const category = this.categories.find(c => c.id === categoryId);
            if (category) {
                this.elements.categoryNameInput.value = category.name;
                this.elements.categoryParentInput.value = category.parentId || '';
                this.elements.categoryColorInput.value = category.color;
            }
        }
        
        this.elements.categoryModal.classList.add('show');
    }
    
    closeCategoryModal() {
        this.elements.categoryModal.classList.remove('show');
        this.elements.categoryForm.reset();
        this.editingCategoryId = '';
    }
    
    saveCategory() {
        const name = this.elements.categoryNameInput.value.trim();
        const parentId = this.elements.categoryParentInput.value || null;
        const color = this.elements.categoryColorInput.value;
        
        if (!name) {
            alert('Nazwa kategorii jest wymagana!');
            return;
        }
        
        if (this.editingCategoryId) {
            const categoryIndex = this.categories.findIndex(c => c.id === this.editingCategoryId);
            if (categoryIndex !== -1) {
                this.categories[categoryIndex] = {
                    ...this.categories[categoryIndex],
                    name,
                    parentId,
                    color
                };
            }
        } else {
            const newCategory = {
                id: Date.now().toString(),
                name,
                parentId,
                color
            };
            
            this.categories.push(newCategory);
        }
        
        this.saveCategories();
        this.closeCategoryModal();
        this.renderCategoriesDropdowns();
    }
    
    exportData() {
        const data = {
            tasks: this.tasks,
            categories: this.categories
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportName = `task-manager-export-${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportName);
        linkElement.click();
    }
    
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = event => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    if (data.tasks && data.categories) {
                        if (confirm('Czy na pewno chcesz zaimportować te dane? Obecne dane zostaną nadpisane.')) {
                            this.tasks = data.tasks;
                            this.categories = data.categories;
                            
                            this.tasks.forEach(task => {
                                if (task.dueDate) task.dueDate = new Date(task.dueDate);
                                if (task.completedAt) task.completedAt = new Date(task.completedAt);
                                if (task.reminderTime) task.reminderTime = new Date(task.reminderTime);
                            });
                            
                            this.saveTasks();
                            this.saveCategories();
                            this.render();
                            alert('Dane zostały pomyślnie zaimportowane!');
                        }
                    } else {
                        alert('Plik nie zawiera poprawnych danych Task Managera.');
                    }
                } catch (error) {
                    alert('Błąd podczas przetwarzania pliku: ' + error.message);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    getTasksForDay(year, month, day) {
        const date = new Date(year, month, day);
        return this.tasks.filter(task => {
            if (!task.dueDate) return false;
            return this.isSameDay(task.dueDate, date);
        });
    }
    
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    formatDate(date) {
        return date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    formatDateForInput(date) {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    }
    
    getMonthName(month) {
        const months = [
            'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
            'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
        ];
        return months[month];
    }
    
    getPriorityName(priority) {
        const priorities = {
            1: 'Krytyczny',
            2: 'Wysoki',
            3: 'Średni',
            4: 'Niski'
        };
        return priorities[priority] || 'Nieznany';
    }
    
    getCategoryPath(categoryId) {
        let path = [];
        let currentId = categoryId;
        
        while (currentId) {
            const category = this.categories.find(c => c.id === currentId);
            if (category) {
                path.unshift(category.name);
                currentId = category.parentId;
            } else {
                break;
            }
        }
        
        return path.join(' → ');
    }
    
    navigateCalendar(months) {
        this.currentDate = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth() + months,
            1
        );
        this.renderCalendar();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new TaskManager();
});