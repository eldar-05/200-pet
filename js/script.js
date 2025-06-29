document.addEventListener('DOMContentLoaded', () => {
    const dailyTaskContainer = document.getElementById('dailyTask');
    const taskListContainer = document.getElementById('taskList');
    const difficultyFilter = document.getElementById('difficultyFilter');
    const searchBar = document.getElementById('searchBar');
    const resetFiltersButton = document.getElementById('resetFilters');

    let allTasks = [];

    function getDayOfYear() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    function createTaskCardHTML(task) {
        return `
            <h3>${task.title}</h3>
            <span class="difficulty ${task.difficulty.replace(/\s/g, '')}">${task.difficulty}</span>
        `;
    }

    function displayTasks(tasksToDisplay) {
        taskListContainer.innerHTML = '';
        if (tasksToDisplay.length === 0) {
            taskListContainer.innerHTML = '<p class="no-results">Задачи не найдены по вашим критериям.</p>';
            return;
        }
        tasksToDisplay.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.classList.add('task-card');
            taskCard.innerHTML = createTaskCardHTML(task);
            taskCard.addEventListener('click', () => {
                window.location.href = `task-details.html?id=${task.id}`;
            });
            taskListContainer.appendChild(taskCard);
        });
    }

    async function loadTasks() {
        try {
            const response = await fetch('data/tasks.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allTasks = await response.json();
            
            const dayOfYear = getDayOfYear();
            const dailyTaskId = ((dayOfYear - 1) % allTasks.length) + 1;
            
            const dailyTask = allTasks.find(task => task.id === dailyTaskId);

            if (dailyTask) {
                dailyTaskContainer.innerHTML = createTaskCardHTML(dailyTask);
                dailyTaskContainer.addEventListener('click', () => {
                    window.location.href = `task-details.html?id=${dailyTask.id}`;
                });
            } else {
                dailyTaskContainer.innerHTML = '<p>Не удалось найти задачу дня.</p>';
            }

            const tasksToDisplay = allTasks.filter(task => task.id !== dailyTaskId);
            displayTasks(tasksToDisplay);

        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
            taskListContainer.innerHTML = '<p>Не удалось загрузить задачи. Попробуйте обновить страницу.</p>';
        }
    }

    function applyFilters() {
        const selectedDifficulty = difficultyFilter.value;
        const searchTerm = searchBar.value.toLowerCase();

        let filteredTasks = allTasks;

        if (selectedDifficulty !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.difficulty === selectedDifficulty);
        }

        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task =>
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm) ||
                (task.techStack && task.techStack.some(tech => tech.toLowerCase().includes(searchTerm)))
            );
        }

        const dayOfYear = getDayOfYear();
        const dailyTaskId = ((dayOfYear - 1) % allTasks.length) + 1;
        filteredTasks = filteredTasks.filter(task => task.id !== dailyTaskId);

        displayTasks(filteredTasks);
    }

    difficultyFilter.addEventListener('change', applyFilters);
    searchBar.addEventListener('input', applyFilters);
    resetFiltersButton.addEventListener('click', () => {
        difficultyFilter.value = 'all';
        searchBar.value = '';
        applyFilters();
    });

    loadTasks();
});