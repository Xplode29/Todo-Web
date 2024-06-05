const modalBtns = [...document.querySelectorAll('.button-modal')];
const categoriesDiv = document.getElementById('categories-div');

let tasks = []
let categories = []

class Category {
    constructor(name, index) {
        this.name = name;
        this.index = index;

        this.element = this.create();
    }

    create() {
        let catDiv = document.createElement('div');
        catDiv.className = 'cat-div';
        catDiv.id = this.name;

        return catDiv;
    }
}

function createCategory(name, index) {
    let category = new Category(name, index);
    categories.push(category);
    categoriesDiv.appendChild(category.element);
}
createCategory('todo-div', 0);
createCategory('doing-div', 1);
createCategory('done-div', 2);

class Task {
    constructor(name, content, category) {
        this.name = name;
        this.content = content;
        this.category = category;

        this.element = this.create();

        this.category.element.appendChild(this.element);
        
        dragElement(this);
    }

    create() {
        let taskDiv = document.createElement('div');
        taskDiv.className = 'task-div';
        
        let taskName = document.createElement('span');
        taskName.className = 'task-name';
        taskName.textContent = this.name;
        taskDiv.appendChild(taskName);
        
        let taskContent = document.createElement('span');
        taskContent.className = 'task-content';
        taskContent.textContent = this.content;
        taskDiv.appendChild(taskContent);
    
        let taskCancel = document.createElement('button');
        taskCancel.className = 'task-cancel';
        taskCancel.textContent = 'X';
        taskCancel.onclick = function () {
            tasks.splice(tasks.indexOf(this.name));
            taskDiv.parentNode.removeChild(taskDiv);
            saveTasks();
        };
        taskDiv.appendChild(taskCancel);

        return taskDiv;
    }

    moveTo(newCategory) {
        if(this.category != newCategory) {
            this.category.element.removeChild(this.element);
            newCategory.element.appendChild(this.element);
            
            this.category = newCategory;
        }
    }
}

function dragElement(task) {
    var offsetWidth = 0;
    var offsetHeight = 0;

    var clone = task.element.cloneNode(true);
    clone.setAttribute("class","select-task-div");

    task.element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        
        var target = e.target || e.srcElement;

        if(target.className == 'task-cancel') {
            return;
        }

        //Actualise
        var taskCoords = task.element.getBoundingClientRect();

        offsetWidth = e.clientX - taskCoords.left;
        offsetHeight = e.clientY - taskCoords.top;

        //task.element.style.display = 'none';
        clone.style.left = (e.clientX - offsetWidth) + "px";
        clone.style.top = (e.clientY - offsetHeight) + "px";

        document.body.appendChild(clone);
        
        task.element.style.display = 'none';

        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        clone.style.left = (e.clientX - offsetWidth) + "px";
        clone.style.top = (e.clientY - offsetHeight) + "px";
    }

    function closeDragElement(e) {
        e = e || window.event;
        e.preventDefault();

        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
        
        categories.forEach(category => {
            var coords = category.element.getBoundingClientRect();

            if (e.clientX >= coords.left && e.clientX <= coords.right && e.clientY >= coords.top && e.clientY <= coords.bottom) {
                task.moveTo(category);
            }
        });
        task.element.style.display = 'block';
        document.body.removeChild(clone);

        saveTasks();
    }
}

function addTaskFromInputs() {
    var nameInput = document.getElementById('name-input');
    var contentInput = document.getElementById('content-input');

    if(nameInput.value.length > 0) {
        let taskClass = new Task(nameInput.value, contentInput.value, categories[0]);
        tasks.push(taskClass);

        nameInput.value = ''; //Clean the input
        contentInput.value = ''; //Clean the input

        saveTasks();
    }
}

function saveTasks()
{
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks()
{
    let encodedTasks = tasks;

    try {
        encodedTasks = JSON.parse(localStorage.getItem('tasks'));
    } catch (error) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    if (encodedTasks != null) {
        encodedTasks.forEach(encodedTask => {
            let taskClass = new Task(encodedTask.name, encodedTask.content, categories[encodedTask.category.index]);
            tasks.push(taskClass);
        });
    }
}
loadTasks();

//Nav bar
function loadNav() {
    let sidebar = document.getElementById('sidebar');
    categories.forEach(category => {
        let catNav = document.createElement('a');
        catNav.textContent = category.name;
        catNav.href = '#' + category.name;
        catNav.onmouseup = function () {
            closeNav();
        };
        sidebar.appendChild(catNav);
    });
}
loadNav();

function openNav() {
    document.getElementById("sidebar").style.width = "100%";
}

function closeNav() {
    document.getElementById("sidebar").style.width = "0";
}

//Modals
modalBtns.forEach(function (btn) {
    btn.onclick = function () {
        let modal = document.getElementById(btn.getAttribute("data-modal"));
        modal.showModal();
    };
});