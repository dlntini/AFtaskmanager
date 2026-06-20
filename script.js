// list of users in the system
const defaultUsers = 
[
    {name:"Adlina Fatini",email:"adlina@gmail.com",username:"adlinadmin",password:"adlinadmin",role:"Admin",image:"image/adlina.png"},
    {name:"Iman Hazim",email:"iman@gmail.com",username:"imanhazim",password:"imanhazim",role:"Student",image:"image/iman.png"},
    {name:"Nurul Najwa",email:"najwa@gmail.com",username:"najwa",password:"najwa",role:"Student",image:"image/najwa.png"},
    {name:"Zaireeq Amir",email:"zaireeq@gmail.com",username:"zaireeq",password:"zaireeq",role:"Student",image:"image/zaireeq.png"},
    {name:"Salwana Anna",email:"anna@gmail.com",username:"anna",password:"anna",role:"Student",image:"image/anna.png"}
];

function getUsers() 
{
    let list = localStorage.getItem('users');
    if(!list)
    {
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        return defaultUsers;
    }
    
    // Auto-sync: add any default users that are missing from localStorage
    let storedUsers = JSON.parse(list);
    let updated = false;

    defaultUsers.forEach(defUser => {
        const exists = storedUsers.some(u => u.username === defUser.username);
        if (!exists) {
            storedUsers.push(defUser);
            updated = true;
        }
    });

    storedUsers.forEach(u => {
        if (u.username !== 'imanhazim' && u.image === 'image/iman.png') {
            u.image = 'image/starter.png';
            updated = true;
        }
    });

    const seenUsernames = new Set();
    const seenNames = new Set();
    const deduplicated = storedUsers.filter(u => {
        if (seenUsernames.has(u.username) || seenNames.has(u.name)) return false;
        seenUsernames.add(u.username);
        seenNames.add(u.name);
        return true;
    });
    if (deduplicated.length !== storedUsers.length) updated = true;

    if (updated) {
        localStorage.setItem('users', JSON.stringify(deduplicated));
    }
    return deduplicated;
}

function saveUsers(usersList) 
{
    localStorage.setItem('users', JSON.stringify(usersList));
}

var users = getUsers();

const defaultTasks =
[
    {id:'01',title:'Assignment IMS560',due_date:'2026-08-02',priority:'Normal',status:'Completed'},
    {id:'02',title:'Assignment IMS566',due_date:'2026-08-15',priority:'High',status:'In Progress'},
    {id:'03',title:'Assignment CTU554',due_date:'2026-08-18',priority:'High',status:'Completed'},
    {id:'04',title:'Assignment TMC451',due_date:'2026-08-20',priority:'Normal',status:'In Progress'},
    {id:'05',title:'Assignment IMS555',due_date:'2026-08-22',priority:'Normal',status:'Not Started'},
    {id:'06',title:'Assignment IMS564',due_date:'2026-08-25',priority:'High',status:'Not Started'},
    {id:'07',title:'Assignment IMS563',due_date:'2026-08-28',priority:'Normal',status:'In Progress'},
    {id:'08',title:'Assignment LCC501',due_date:'2026-08-30',priority:'High',status:'Not Started'}
];

// get current login user from localstorage
function getCurrentUser() 
{
    return localStorage.getItem('loggedInUser') || 'adlinadmin';
}

// get tasks for the current user
function getUserTasks() 
{
    const user = getCurrentUser();
    let allTasks = JSON.parse(localStorage.getItem('tasks')) || {};

    // if user has no tasks yet, copy default tasks
    if(!allTasks[user])
    {
        allTasks[user] = JSON.parse(JSON.stringify(defaultTasks));
        localStorage.setItem('tasks', JSON.stringify(allTasks));
    }
    else
    {
        let updated = false;
        allTasks[user].forEach((t, idx) => {
            const cleanId = (idx + 1).toString().padStart(2, '0');
            if (t.id !== cleanId) {
                t.id = cleanId;
                updated = true;
            }
        });
        if (updated) {
            localStorage.setItem('tasks', JSON.stringify(allTasks));
        }
    }
    return allTasks[user];
}

// save tasks for current user to localStorage
function saveUserTasks(tasks) 
{
    const user = getCurrentUser();
    let allTasks = JSON.parse(localStorage.getItem('tasks')) || {};
    // Re-index all tasks to keep IDs sequential and clean
    tasks.forEach((t, idx) => {
        t.id = (idx + 1).toString().padStart(2, '0');
    });
    allTasks[user] = tasks;
    localStorage.setItem('tasks', JSON.stringify(allTasks));
}

// get current users tasks
let currentUserTasks = getUserTasks();

// show logged-in user's name in header
function renderUserName() 
{
    const user = users.find(u => u.username === getCurrentUser());
    const el = document.getElementById('userName');
    if(el && user) el.textContent = user.name;
}

// toast notification
const toastEl = document.getElementById('taskToast');
const bsToast = toastEl ? new bootstrap.Toast(toastEl) : null;


// show a small popup message
function showToast(message, type='success') 
{
    if(!toastEl) return;
    toastEl.className = `toast align-items-center text-bg-${type} border-0`;
    document.getElementById('toastMessage').textContent = message;
    bsToast.show();
}

// render tasks on the page that can filter by type
function renderTasks(filter='all') 
{
    const mainCard = document.getElementById('main-task-card');
    const mainTbody = document.querySelector('#tasks-table tbody');
    if(!mainCard || !mainTbody) return;

    const header = document.getElementById('task-header');
    const incompleteSection = document.getElementById('incomplete-tables');
    const inProgressTbody = document.querySelector('#inProgressTable tbody');
    const notStartedTbody = document.querySelector('#notStartedTable tbody');
    const today = new Date().toISOString().split('T')[0];
    const createBox = document.querySelector('.create-task-box');

     // show or hide create task form
    if(createBox) createBox.style.display = (filter==='all') ? 'block' : 'none';

    // show incomplete tasks separately
    if(filter==='incomplete')
    {
        mainCard.style.display='none';
        incompleteSection.style.display='block';
        inProgressTbody.innerHTML='';
        notStartedTbody.innerHTML='';

        currentUserTasks.forEach(t=>
        {
            const tr=document.createElement('tr');
            tr.innerHTML = `<td>${t.id}</td><td>${t.title}</td><td>${t.priority}</td><td>${t.status}</td><td>${t.due_date||'-'}</td>
            <td><button class="btn btn-sm btn-outline-primary" onclick="editTask('${t.id}')">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteTask('${t.id}')">Delete</button></td>`;
            if(t.status==='In Progress') inProgressTbody.appendChild(tr);
            else if(t.status==='Not Started') notStartedTbody.appendChild(tr);
        });
        return;
    } else 
    {
        mainCard.style.display='block';
        incompleteSection.style.display='none';
    }

    // filter tasks for main table
    let data=[...currentUserTasks];
    if(filter==='duetoday') data = data.filter(t=>t.due_date===today);
    else if(filter==='completed') data = data.filter(t=>t.status==='Completed');

    mainTbody.innerHTML='';
    data.forEach(t=>
    {
        const tr=document.createElement('tr');
        tr.innerHTML=`<td>${t.id}</td><td>${t.title}</td><td>${t.priority}</td><td>${t.status}</td><td>${t.due_date||'-'}</td>
        <td><button class="btn btn-sm btn-outline-primary" onclick="editTask('${t.id}')">Edit</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteTask('${t.id}')">Delete</button></td>`;
        mainTbody.appendChild(tr);
    });

    // update table header
    if(header)
    {
        if(filter==='all') header.textContent='All Tasks';
        else if(filter==='duetoday') header.textContent='Due Today Tasks';
        else if(filter==='completed') header.textContent='Completed Tasks';
    }
}

// tasks form state and handler
let editTaskId = null;
const taskForm = document.getElementById('task-form');
if(taskForm)
{
    taskForm.addEventListener('submit', function(e)
    {
        e.preventDefault(); // prevent page reload
        const title = document.getElementById('task-title').value.trim();
        const due = document.getElementById('task-due').value;
        const priority = document.getElementById('task-priority').value;
        const status = document.getElementById('task-status').value;

        if(title==='') return alert('Title required'); // validation

        if(editTaskId !== null)
        {
            // update existing task
            const t = currentUserTasks.find(task => task.id === editTaskId);
            if(t)
            {
                t.title = title;
                t.due_date = due;
                t.priority = priority;
                t.status = status;
                saveUserTasks(currentUserTasks);
                renderTasks();
                showToast('Task successfully updated!', 'info');
            }
            editTaskId = null;
            taskForm.querySelector('button').textContent = 'Add Task';
        }
        else
        {
            // add new task
            const id=(currentUserTasks.length+1).toString().padStart(2,'0');
            currentUserTasks.push({id,title,due_date:due,priority,status});
            saveUserTasks(currentUserTasks);
            renderTasks();
            showToast('Task successfully created!');
        }
        this.reset();
    });

    taskForm.addEventListener('reset', function()
    {
        editTaskId = null;
        const btn = taskForm.querySelector('button');
        if(btn) btn.textContent = 'Add Task';
    });
}

// edit and delete tasks
function deleteTask(id)
{
    if(confirm('Delete this task?'))
    {
        const index=currentUserTasks.findIndex(t=>t.id===id);
        if(index>-1) currentUserTasks.splice(index,1);
        saveUserTasks(currentUserTasks);
        renderTasks();
        showToast('Task successfully deleted!', 'danger');
    }
}

function editTask(id)
{
    const t=currentUserTasks.find(t=>t.id===id);
    if(!t) return;

    editTaskId = id;
    
    // fill form with existing values
    document.getElementById('task-title').value=t.title;
    document.getElementById('task-due').value=t.due_date;
    document.getElementById('task-priority').value=t.priority;
    document.getElementById('task-status').value=t.status;

    taskForm.querySelector('button').textContent='Update Task';
}

// helper function
function filterTasks(type){ renderTasks(type); }  // called from sidebar
function toggleDropdown(e){ e.preventDefault(); e.currentTarget.parentElement.classList.toggle('show'); }
function logout(){ localStorage.removeItem('loggedInUser'); window.location.href='index.html'; }

function toggleMobileSidebar() 
{
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    sidebar.classList.toggle('show-sidebar');
    
    // Manage backdrop overlay
    let backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar.classList.contains('show-sidebar')) 
    {
        if (!backdrop) 
        {
            backdrop = document.createElement('div');
            backdrop.id = 'sidebarBackdrop';
            backdrop.style.position = 'fixed';
            backdrop.style.top = '70px';
            backdrop.style.left = '0';
            backdrop.style.width = '100vw';
            backdrop.style.height = 'calc(100vh - 70px - 50px)';
            backdrop.style.backgroundColor = 'rgba(0,0,0,0.5)';
            backdrop.style.zIndex = '1000';
            backdrop.style.cursor = 'pointer';
            backdrop.style.transition = 'opacity 0.3s ease';
            backdrop.addEventListener('click', toggleMobileSidebar);
            document.body.appendChild(backdrop);
        }
        backdrop.style.display = 'block';
    } 
    else 
    {
        if (backdrop) 
        {
            backdrop.style.display = 'none';
        }
    }
}

// render user page
function renderUsers(){
    const tbody = document.getElementById('users-table');
    if(!tbody) return;
    tbody.innerHTML = '';

    const currentUsername = getCurrentUser();
    const currentUserObj = users.find(u => u.username === currentUsername);
    const isAdmin = currentUserObj && currentUserObj.role === 'Admin';

    users.forEach(u=>
    {
    const tr = document.createElement('tr');
    const displayPassword = isAdmin ? u.password : '••••••••';
    tr.innerHTML = `
    <td><img src="${u.image}" class="user-img"></td>
    <td>${u.name}</td>
    <td>${u.email}</td>
    <td>${u.username}</td>
    <td>${displayPassword}</td>
    <td>${u.role}</td>
`;
    tbody.appendChild(tr);

    });
}

function applyUserStyles() 
{
    const username = getCurrentUser();
    const usersList = typeof getUsers === 'function' ? getUsers() : users;
    const userObj = usersList.find(u => u.username === username);
    if(userObj)
    {
        if(userObj.headerColor)
        {
            const header = document.querySelector('.main-header');
            if(header) header.style.backgroundColor = userObj.headerColor;
        }
        if(userObj.footerColor)
        {
            const footer = document.querySelector('.main-footer');
            if(footer) footer.style.backgroundColor = userObj.footerColor;
        }
        if(userObj.backgroundImage)
        {
            document.body.style.backgroundImage = `url('${userObj.backgroundImage}')`;
        }
    }
}

// setup page load
document.addEventListener('DOMContentLoaded', ()=>{
    applyUserStyles();
    renderUserName();
    renderTasks();
    renderUsers();
});
