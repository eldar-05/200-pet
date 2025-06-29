document.addEventListener('DOMContentLoaded', async () => {
    const taskDetailsTitle = document.getElementById('taskDetailsTitle');
    const taskDetailsContent = document.getElementById('taskDetailsContent');

    function getTaskIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return parseInt(urlParams.get('id')); 
    }

    function createDetailedTaskHTML(task) {
        if (!task) {
            return '<p>Задача не найдена.</p>';
        }

        const techStackHtml = task.techStack && task.techStack.length > 0
            ? `<div class="tech-stack"><strong>Технологии:</strong> <ul>${task.techStack.map(tech => `<li>${tech}</li>`).join('')}</ul></div>`
            : '';
        const featuresHtml = task.features && task.features.length > 0
            ? `<div class="features"><strong>Основные функции:</strong> <ul>${task.features.map(feature => `<li>${feature}</li>`).join('')}</ul></div>`
            : '';

        return `
            <h3>${task.title}</h3>
            <span class="difficulty ${task.difficulty.replace(/\s/g, '')}">${task.difficulty}</span>
            <p>${task.description}</p>
            ${techStackHtml}
            ${featuresHtml}
            <p class="learning-path"><strong>Путь обучения:</strong> ${task.learningPath}</p>
            <p class="open-source-focus"><strong>Open Source:</strong> ${task.openSourceFocus}</p>
        `;
    }

    const taskId = getTaskIdFromUrl();

    if (isNaN(taskId)) {
        taskDetailsTitle.textContent = 'Ошибка';
        taskDetailsContent.innerHTML = '<p>Неверный ID задачи.</p>';
        return;
    }

    try {
        const response = await fetch('data/tasks.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allTasks = await response.json();
        
        const task = allTasks.find(t => t.id === taskId);

        if (task) {
            taskDetailsTitle.textContent = task.title;
            taskDetailsContent.innerHTML = createDetailedTaskHTML(task);
        } else {
            taskDetailsTitle.textContent = 'Задача не найдена';
            taskDetailsContent.innerHTML = '<p>Задача с таким ID не существует.</p>';
        }

    } catch (error) {
        console.error('Ошибка загрузки деталей задачи:', error);
        taskDetailsTitle.textContent = 'Ошибка загрузки';
        taskDetailsContent.innerHTML = '<p>Не удалось загрузить подробности задачи. Попробуйте обновить страницу.</p>';
    }
});