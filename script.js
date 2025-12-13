const toggleThemeBtn = document.getElementById('toggleTheme');
const icon = toggleThemeBtn.querySelector('i');
const html = document.documentElement;
const writeTaskInput = document.getElementById('inputForm');
const addTaskBtn = document.getElementById('inputButton');
const tasksList = document.getElementById('taskList');
const modalNoTask = document.getElementById('modalNoTask');

//chenge theme on page load based on saved preference
const savedtheme = localStorage.getItem('theme');

if(savedtheme === 'dark') {
    html.setAttribute('data-theme', 'dark');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');   
}

toggleThemeBtn.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');

    if(currentTheme === 'dark') {
        html.removeAttribute('data-theme');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        icon.style.color = '#000000';
        localStorage.setItem('theme', 'light');
    } else {
        html.setAttribute('data-theme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        icon.style.color = '#ffffff';
        localStorage.setItem('theme', 'dark');
    }
});

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function renderTasks(task)  {
    const taskItem = document.createElement('li');
        taskItem.classList.add('task__item');
        taskItem.innerHTML = `
            <input type="checkbox" class="task__cheackbox" ${task.completed ? 'checked' : ''}>
            <span class="task__text">${task.text}</span>
            <span class="task__priority task__medium">${task.priority.toLowerCase()}</span>
            <div class="task__actions">
                <button class="btn__icon btn__edit">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn__icon btn__delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div> 
        `;
        tasksList.prepend(taskItem);
        
        
}
if(tasks.length > 0) modalNoTask.style.display = 'none';
tasks.forEach(task => renderTasks(task));

//Add task event listener
addTaskBtn.addEventListener('click', addTask);

//Function to add a new task
function addTask() {
    const taskText = writeTaskInput.value.trim();

    if(taskText === '') return;

    const newTask = {
        id: Date.now(),
        text: taskText,
        priority: 'medium',
        completed: false
    }
    
    tasks.unshift(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    renderTasks(newTask);

    writeTaskInput.value = '';
    modalNoTask.style.display = 'none'
}

tasksList.addEventListener('click', (e) =>  {
    const target = e.target;
    const taskItem = target.closest('.btn__delete');
    if(!taskItem) return;
    const taskElement = taskItem.closest('.task__item');
    const taskId = Array.from(tasksList.children).indexOf(taskElement);
    deleteTask(taskElement, taskId);
});

function deleteTask (taskItem, taskId) {
    tasks.splice(taskId, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    tasksList.removeChild(taskItem);
    if(tasks.length === 0) {
        modalNoTask.style.display = 'block';
    }
}








