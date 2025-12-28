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
const cancelBtn = document.getElementById('cancelEditBtn');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoryTags = document.getElementById('categoryTags');
const categoryFilter = document.getElementById('categoryFilter');
const editCategoryInput = document.getElementById('editTaskCategory');
const searchInput = document.getElementById('searchInput');
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
    taskItem.setAttribute('draggable', true);

    const priorityClass = `task__${task.priority}`;
    const dueDateText = task.dueDate ? task.dueDate : '';

    taskItem.innerHTML = `
        <input type="checkbox" class="task__cheackbox" ${task.completed ? 'checked' : ''}>
        <span class="task__text">${task.text}</span>
        <div class="task__meta">
             <span class="task__priority ${priorityClass}">${task.priority}</span>
                <span class="task__dueDate">${dueDateText}</span>
                <div class="task__actions">
            <button class="btn__icon btn__edit"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn__icon btn__delete"><i class="fa-solid fa-trash"></i></button>
        </div>
        </div>
    `;
    const dueDateEl = taskItem.querySelector('.task__dueDate');
    dueDateEl.style.display = task.dueDate ? 'flex' : 'none';
    addDragEvents(taskItem);
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
        categories: [],
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
    tempCategories = [];
    categoryTags.innerHTML = '';
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

        // Додаємо клас анімації лише на момент кліку
        if(target.checked) {
            taskElement.classList.add('animate-complete');
            taskElement.addEventListener('animationend', () => {
                taskElement.classList.remove('animate-complete');
            }, { once: true });
        }
        setTimeout(() => {
            applyFilters();
        }, 2000); 
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
        tempCategories = [...(task.categories || [])];
        renderCategoryTags();
    }

});


//Function to delete a task
function deleteTask(taskItem, taskId) {
    taskItem.classList.add('removing');

    taskItem.addEventListener('animationend', () => {
        taskItem.remove();

        tasks = tasks.filter(task => task.id != taskId);
        localStorage.setItem('tasks', JSON.stringify(tasks));

        updateAllCount();
        checkVisibleTasks();
    }, { once: true }); 
}

//Function to update total task count
function updateAllCount() {
    totalCount.textContent = tasks.length;
    completedCount.textContent = tasks.filter(task => task.completed).length;
    pendingCount.textContent = tasks.filter(task => !task.completed).length;
}

function checkVisibleTasks() {
    const taskItems = tasksList.querySelectorAll('.task__item');
    const visibleTasks = Array.from(taskItems).filter(item => item.style.display !== 'none');
    if(visibleTasks.length === 0) {
        modalNoTask.style.display = 'block';
    } else {
        modalNoTask.style.display = 'none';
    }
}

filterSelect.addEventListener('change', applyFilters);

filterPriority.addEventListener('change', applyFilters);

searchInput.addEventListener('input', applyFilters);

let resultSearchInput = '';

function updateTaskVisibility(taskElement) {
    const filterValue = filterPriority.value;
    const selectFilterValue = filterSelect.value; 
    const checkbox = taskElement.querySelector('.task__cheackbox');
    const taskPriority = taskElement.querySelector('.task__priority').textContent.toLowerCase();
    
    let visible = false;
    if(selectFilterValue === 'all') visible = true;
    else if(selectFilterValue === 'completed' && checkbox.checked) visible = true;
    else if(selectFilterValue === 'pending' && !checkbox.checked) visible = true;
    
    if(filterValue !== 'all' && taskPriority !== filterValue) visible = false;

    taskElement.style.display = visible ? 'flex' : 'none';
}

saveTaskBtn.addEventListener('click', () => {
    if(currentTaskId === null) return;

    const task = tasks.find(t => t.id === currentTaskId);
    if(!task) return;

    const today = new Date().toISOString().split('T')[0];

    task.text = editTaskText.value.trim();
    task.priority = editTaskPriority.value;
    task.dueDate = (editTaskDueDate.value && editTaskDueDate.value >= today) ? editTaskDueDate.value : '';
    task.category = editTaskCategory.value;
    task.categories = [...tempCategories];

    localStorage.setItem('tasks', JSON.stringify(tasks));

    const taskElement = tasksList.querySelector(`.task__item[data-id="${currentTaskId}"]`);
    if(!taskElement) return;

    taskElement.querySelector('.task__text').textContent = task.text;

    const priorityEl = taskElement.querySelector('.task__priority');
    priorityEl.classList.remove('task__low', 'task__medium', 'task__high');
    priorityEl.classList.add(`task__${task.priority}`);
    priorityEl.textContent = task.priority;

    let dueDateEl = taskElement.querySelector('.task__dueDate');
    if(!dueDateEl) {
        dueDateEl = document.createElement('span');
        dueDateEl.classList.add('task__dueDate');
        taskElement.insertBefore(dueDateEl, taskElement.querySelector('.task__actions'));
    }
    dueDateEl.textContent = task.dueDate || '';
    dueDateEl.style.display = task.dueDate ? 'flex' : 'none';
    updateTaskVisibility(taskElement);
    updateCategoryFilter();
    closeModal();
});

cancelBtn.addEventListener('click', () => {
    closeModal();
});

let tempCategories = [];

addCategoryBtn.addEventListener('click', () => {
   const value = editTaskCategory.value.trim();
    if (!value) return;
    if (tempCategories.includes(value)) return;

    tempCategories.push(value); 
    editTaskCategory.value = '';
    renderCategoryTags();
});

function renderCategoryTags() {
    categoryTags.innerHTML = '';

    tempCategories.forEach(cat => {
        const tag = document.createElement('span');
        tag.classList.add('category__tag');
        tag.textContent = cat;

        const removeBtn = document.createElement('button');
        removeBtn.classList.add('btn-icon', 'remove__category');
        removeBtn.textContent = '×';
        removeBtn.onclick = () => {
            tempCategories = tempCategories.filter(c => c !== cat);
            renderCategoryTags();
        };

        tag.appendChild(removeBtn);
        categoryTags.appendChild(tag);
    });
}

function updateCategoryFilter() {
    const allCategories = new Set();

    tasks.forEach(task => {
        task.categories?.forEach(cat => allCategories.add(cat));
    });

    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

    allCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
}

updateCategoryFilter();

categoryFilter.addEventListener('change', applyFilters);

function applyFilters() {
    const statusFilter = filterSelect.value;         
    const priorityFilterValue = filterPriority.value; 
    const categoryFilterValue = categoryFilter.value; 
    const searchText = searchInput.value.toLowerCase().trim(); 

    document.querySelectorAll('.task__item').forEach(item => {
        const taskId = Number(item.dataset.id);
        const task = tasks.find(t => t.id === taskId);

        let visible = true;

        if(statusFilter === 'completed' && !task.completed) visible = false;
        if(statusFilter === 'pending' && task.completed) visible = false;

        if(priorityFilterValue !== 'all' && task.priority !== priorityFilterValue) visible = false;

        if(categoryFilterValue !== 'all' && !task.categories.includes(categoryFilterValue)) visible = false;

        if(searchText && !task.text.toLowerCase().includes(searchText)) visible = false;

        item.style.display = visible ? 'flex' : 'none';
    });

    checkVisibleTasks(); 
}

function addDragEvents(taskItem) {
    taskItem.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', taskItem.dataset.id);
        taskItem.classList.add('dragging');
    });

    taskItem.addEventListener('dragend', () => {
        taskItem.classList.remove('dragging');
    });
}

tasksList.addEventListener('dragover', (e) => {
    e.preventDefault();

    const dragging = document.querySelector('.dragging');
    if (!dragging) return;

    const containerRect = tasksList.getBoundingClientRect();
    const scrollThreshold = 30; 
    const scrollSpeed = 5;      

    if (e.clientY < containerRect.top + scrollThreshold) {
        tasksList.scrollTop -= scrollSpeed;
    } else if (e.clientY > containerRect.bottom - scrollThreshold) {
        tasksList.scrollTop += scrollSpeed;
    }

    const afterElement = getDragAfterElement(tasksList, e.clientY);
    if (afterElement == null) {
        tasksList.appendChild(dragging);
    } else {
        tasksList.insertBefore(dragging, afterElement);
    }

});

tasksList.addEventListener('drop', () => {
    const newTasksOrder = [];
    tasksList.querySelectorAll('.task__item').forEach(item => {
        const id = Number(item.dataset.id);
        const task = tasks.find(t => t.id === id);
        if(task) newTasksOrder.push(task);
    });
    tasks = newTasksOrder;
    localStorage.setItem('tasks', JSON.stringify(tasks));
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task__item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if(offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

