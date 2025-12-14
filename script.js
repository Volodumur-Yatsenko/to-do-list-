const toggleThemeBtn = document.getElementById('toggleTheme');
const icon = toggleThemeBtn.querySelector('i');
const html = document.documentElement;
const writeTaskInput = document.getElementById('inputForm');
const addTaskBtn = document.getElementById('inputButton');
const tasksList = document.getElementById('taskList');
const modalNoTask = document.getElementById('modalNoTask');
const totalCount = document.getElementById('total');
const completedCount = document.getElementById('completed');
const pendingCount = document.getElementById('pending');
const filterSelect = document.getElementById('filterSelect');

//chenge theme on page load based on saved preference
const savedtheme = localStorage.getItem('theme');

if(savedtheme === 'dark') {
    html.setAttribute('data-theme', 'dark');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');   
    icon.style.color = '#ffffff';
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
        taskItem.dataset.id = task.id;
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

updateAllCount()
//Add task event listener
addTaskBtn.addEventListener('click', addTask);
writeTaskInput.addEventListener('keypress', function(e)  {
    if(e.key === 'Enter') addTask();
});

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
    updateAllCount()
}

//Delete task event listener
tasksList.addEventListener('click', (e) =>  {
    const target = e.target;
    const taskItem = target.closest('.btn__delete');
    if(taskItem) { 
        const taskElement = taskItem.closest('.task__item');
        const taskId = taskElement.dataset.id;
        deleteTask(taskElement, taskId);
    }
    if(target.classList.contains('task__cheackbox')) {
        const taskElement = target.closest('.task__item');
        const taskId = taskElement.dataset.id;
        const task = tasks.find(t => t.id == taskId);
        task.completed = target.checked;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateAllCount();
    }

});

//Function to delete a task
function deleteTask (taskItem, taskId) {
    tasks = tasks.filter(task => task.id != taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    tasksList.removeChild(taskItem);
    if(tasks.length === 0) {
        modalNoTask.style.display = 'block';
    }
    updateAllCount()
}

//Function to update total task count
function updateAllCount() {
    totalCount.textContent = tasks.length;
    completedCount.textContent = tasks.filter(task => task.completed).length;
    pendingCount.textContent = tasks.filter(task => !task.completed).length;
}


filterSelect.addEventListener('change', () =>  {
    const filterValue = filterSelect.value;
    const taskItems = tasksList.querySelectorAll('.task__item');

    taskItems.forEach(item => {
        const ifCompleted = item.querySelector('.task__cheackbox').checked;
        if(filterValue === 'all') {
            item.style.display = 'flex';
        } else if(filterValue === 'completed') {
            if(ifCompleted) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        }  else if(filterValue === 'pending') {
            if(!ifCompleted) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        }
    });
    const visibleTasks = Array.from(taskItems).filter(item => item.style.display === 'flex');
    if(visibleTasks.length === 0) {
        modalNoTask.style.display = 'block';
    } else {
        modalNoTask.style.display = 'none';
    }
});



