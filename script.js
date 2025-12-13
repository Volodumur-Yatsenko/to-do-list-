const toggleThemeBtn = document.getElementById('toggleTheme');
const icon = toggleThemeBtn.querySelector('i');
const html = document.documentElement;
const writeTaskInput = document.getElementById('inputForm');
const addTaskBtn = document.getElementById('inputButton');
const tasksList = document.getElementById('taskList');
const modalNoTask = document.getElementById('modalNoTask');

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

addTaskBtn.addEventListener('click', addTask);

function addTask() {
    const taskText = writeTaskInput.value.trim();

    if(taskText === '') return;
    
    const taskItem = document.createElement('li');
    taskItem.classList.add('task__item');
    taskItem.innerHTML = `
        <input type="checkbox" class="task__cheackbox">
        <span class="task__text">${taskText}</span>
        <span class="task__priority task__medium">MEDIUM</span>
        <div class="task__actions">
            <button class="btn__icon btn__edit">
                <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn__icon btn__delete">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
    tasksList.appendChild(taskItem);
    writeTaskInput.value = '';
    modalNoTask.style.display = 'none';
}