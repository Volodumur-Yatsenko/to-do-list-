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
const modalWindow = document.getElementById('taskDetailsModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const editTaskText = document.getElementById('editTaskText');
const editTaskPriority = document.getElementById('editTaskPriority');
const editTaskDueDate = document.getElementById('editTaskDueDate');
const editTaskCategory = document.getElementById('editTaskCategory');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const filterPriority = document.getElementById('priorityFilter');
let currentTaskId = null;
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

function renderTasks(task) {
    const taskItem = document.createElement('li');
    taskItem.classList.add('task__item');
    taskItem.dataset.id = task.id;

    const priorityClass = `task__${task.priority}`;
    const dueDateText = task.dueDate ? task.dueDate : '';

    taskItem.innerHTML = `
        <input type="checkbox" class="task__cheackbox" ${task.completed ? 'checked' : ''}>
        <span class="task__text">${task.text}</span>
        <span class="task__priority ${priorityClass}">${task.priority}</span>
        <span class="task__dueDate">${dueDateText}</span>
        <div class="task__actions">
            <button class="btn__icon btn__edit"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn__icon btn__delete"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;
    tasksList.append(taskItem);
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
    let dueDate = editTaskDueDate ? editTaskDueDate.value : '';

    if(taskText === '') return;

    const today = new Date().toISOString().split('T')[0];
    if(dueDate && dueDate < today) {
        dueDate = '';
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        priority: 'medium',
        completed: false,
        dueDate: dueDate,
    }
    
    tasks.unshift(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    renderTasks(newTask);

    writeTaskInput.value = '';
    if(editTaskDueDate) editTaskDueDate.value = '';
    modalNoTask.style.display = 'none'
    updateAllCount()
}

closeModalBtn.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && modalWindow.style.display === 'block') {
        closeModal();
    }
});

function closeModal() {
    modalWindow.style.display = 'none';
    editTaskText.value = '';
    editTaskPriority.value = 'medium';
    editTaskDueDate.value = '';
    editTaskCategory.value = '';
    currentTaskId = null;
}

//Delete task event listener
tasksList.addEventListener('click', (e) =>  {
    const target = e.target;
    const taskItem = target.closest('.btn__delete');
    const editBtn = target.closest('.btn__edit');
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
    if(editBtn) {
        const taskElement = editBtn.closest('.task__item');
        const taskId = Number(taskElement.dataset.id);
        const task = tasks.find(t => t.id == taskId);
        modalWindow.style.display = 'block';
        currentTaskId = taskId;
        editTaskText.value = task.text;
        editTaskPriority.value = task.priority;
        editTaskDueDate.value = task.dueDate || '';
        editTaskCategory.value = task.category || '';
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

filterPriority.addEventListener('change', () => {
    const priorityValue = filterPriority.value;
    const taskItems = tasksList.querySelectorAll('.task__item');
    taskItems.forEach(item => {
        const priorityEl = item.querySelector('.task__priority');
        const taskPriority = priorityEl.textContent.toLowerCase();
        if(priorityValue === 'all' || taskPriority.includes(priorityValue)) {
            item.style.display = 'flex';
        } else if(priorityValue === taskPriority) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
});

function renderAllTasks() {
    tasksList.innerHTML = '';
    tasks.forEach(task => renderTasks(task));
}

function updateTaskVisibility(taskElement) {
    const filterValue = filterPriority.value;
    const selectFilterValue = filterSelect.value; 
    const checkbox = taskElement.querySelector('.task__cheackbox');
    const taskPriority = taskElement.querySelector('.task__priority').textContent.toLowerCase();
    
    // Фільтр по completed / pending
    let visible = false;
    if(selectFilterValue === 'all') visible = true;
    else if(selectFilterValue === 'completed' && checkbox.checked) visible = true;
    else if(selectFilterValue === 'pending' && !checkbox.checked) visible = true;
    
    // Додаємо фільтр по пріоритету
    if(filterValue !== 'all' && taskPriority !== filterValue) visible = false;

    taskElement.style.display = visible ? 'flex' : 'none';
}

saveTaskBtn.addEventListener('click', () => {
    console.log('Save clicked');
    if(currentTaskId === null) return;

    const task = tasks.find(t => t.id === currentTaskId);
    if(!task) return;

    const today = new Date().toISOString().split('T')[0];

    task.text = editTaskText.value.trim();
    task.priority = editTaskPriority.value;
    task.dueDate = (editTaskDueDate.value && editTaskDueDate.value >= today) ? editTaskDueDate.value : '';
    task.category = editTaskCategory.value;

    localStorage.setItem('tasks', JSON.stringify(tasks));

    const taskElement = tasksList.querySelector(`.task__item[data-id="${currentTaskId}"]`);
    if(!taskElement) return;

    // Оновлюємо текст
    taskElement.querySelector('.task__text').textContent = task.text;

    // Оновлюємо пріоритет
    const priorityEl = taskElement.querySelector('.task__priority');
    priorityEl.classList.remove('task__low', 'task__medium', 'task__high');
    priorityEl.classList.add(`task__${task.priority}`);
    priorityEl.textContent = task.priority;

    // Оновлюємо дату
    let dueDateEl = taskElement.querySelector('.task__dueDate');
    if(!dueDateEl) {
        dueDateEl = document.createElement('span');
        dueDateEl.classList.add('task__dueDate');
        taskElement.insertBefore(dueDateEl, taskElement.querySelector('.task__actions'));
    }
    dueDateEl.textContent = task.dueDate || '';
    updateTaskVisibility(taskElement);
    closeModal();
});

