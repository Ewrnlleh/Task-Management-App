// Task Management Application JavaScript

let assignees = [];
let tasks = [];
let currentTaskId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadAssignees();
    loadTasks();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Add task button
    document.getElementById('addTaskBtn').addEventListener('click', () => {
        openTaskModal();
    });
    
    // Manage assignees button
    document.getElementById('manageAssigneesBtn').addEventListener('click', () => {
        openAssigneeModal();
    });
    
    // Task form submit
    document.getElementById('taskForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveTask();
    });
    
    // Assignee form submit
    document.getElementById('assigneeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addAssignee();
    });
    
    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', () => {
        closeModal('taskModal');
    });
    
    // Assignee filter
    document.getElementById('assigneeFilter').addEventListener('change', (e) => {
        loadTasks(e.target.value);
    });
    
    // Close modals when clicking X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Load assignees
async function loadAssignees() {
    try {
        const response = await fetch('api.php?action=getAssignees');
        const data = await response.json();
        
        if (data.success) {
            assignees = data.assignees;
            populateAssigneeFilter();
            populateAssigneeCheckboxes();
            if (document.getElementById('assigneeModal').style.display === 'block') {
                displayAssigneeList();
            }
        }
    } catch (error) {
        console.error('Kişiler yüklenirken hata:', error);
        alert('Kişiler yüklenirken bir hata oluştu.');
    }
}

// Populate assignee filter
function populateAssigneeFilter() {
    const filter = document.getElementById('assigneeFilter');
    const currentValue = filter.value;
    
    filter.innerHTML = '<option value="">Tüm Görevler</option>';
    
    assignees.forEach(assignee => {
        const option = document.createElement('option');
        option.value = assignee.id;
        option.textContent = assignee.name;
        filter.appendChild(option);
    });
    
    filter.value = currentValue;
}

// Populate assignee checkboxes
function populateAssigneeCheckboxes() {
    const container = document.getElementById('assigneeCheckboxes');
    container.innerHTML = '';
    
    assignees.forEach(assignee => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = assignee.id;
        checkbox.name = 'assignees[]';
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(' ' + assignee.name));
        container.appendChild(label);
    });
}

// Load tasks
async function loadTasks(assigneeFilter = '') {
    try {
        let url = 'api.php?action=getTasks';
        if (assigneeFilter) {
            url += '&assignee=' + assigneeFilter;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            tasks = data.tasks;
            displayTasks();
        }
    } catch (error) {
        console.error('Görevler yüklenirken hata:', error);
        alert('Görevler yüklenirken bir hata oluştu.');
    }
}

// Display tasks
function displayTasks() {
    // Clear all task containers
    const containers = {
        'Yeni Talep': document.getElementById('tasks-yeni'),
        'Devam Ediyor': document.getElementById('tasks-devam'),
        'Beklemede': document.getElementById('tasks-beklemede'),
        'Test Aşamasında': document.getElementById('tasks-test'),
        'Tamamlandı': document.getElementById('tasks-tamamlandi')
    };
    
    Object.values(containers).forEach(container => {
        container.innerHTML = '';
    });
    
    // Add tasks to their respective containers
    tasks.forEach(task => {
        const container = containers[task.status];
        if (container) {
            const taskCard = createTaskCard(task);
            container.appendChild(taskCard);
        }
    });
}

// Create task card
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card status-' + getStatusClass(task.status);
    card.onclick = () => openTaskDetail(task.id);
    
    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;
    card.appendChild(title);
    
    if (task.assignees) {
        const assigneesDiv = document.createElement('div');
        assigneesDiv.className = 'task-assignees';
        assigneesDiv.textContent = task.assignees;
        card.appendChild(assigneesDiv);
    }
    
    if (task.due_date) {
        const dueDateDiv = document.createElement('div');
        dueDateDiv.className = 'task-due-date';
        
        const dueDate = new Date(task.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dueDate < today && task.status !== 'Tamamlandı') {
            dueDateDiv.classList.add('overdue');
        }
        
        dueDateDiv.textContent = formatDate(task.due_date);
        card.appendChild(dueDateDiv);
    }
    
    if (task.latest_feedback) {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'task-feedback';
        feedbackDiv.textContent = task.latest_feedback;
        card.appendChild(feedbackDiv);
    }
    
    return card;
}

// Get status class
function getStatusClass(status) {
    const statusMap = {
        'Yeni Talep': 'yeni',
        'Devam Ediyor': 'devam',
        'Beklemede': 'beklemede',
        'Test Aşamasında': 'test',
        'Tamamlandı': 'tamamlandi'
    };
    return statusMap[status] || 'yeni';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

// Format datetime
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Open task modal
function openTaskModal(task = null) {
    currentTaskId = task ? task.id : null;
    
    if (task) {
        document.getElementById('modalTitle').textContent = 'Görevi Düzenle';
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskStatus').value = task.status;
        document.getElementById('taskDueDate').value = task.due_date;
        document.getElementById('taskFeedback').value = '';
        
        // Check assignees
        if (task.assignee_ids) {
            const assigneeIds = task.assignee_ids.split(',');
            document.querySelectorAll('#assigneeCheckboxes input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = assigneeIds.includes(checkbox.value);
            });
        }
    } else {
        document.getElementById('modalTitle').textContent = 'Yeni Görev';
        document.getElementById('taskForm').reset();
        document.getElementById('taskId').value = '';
        
        // Set default due date to 7 days from now
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);
        document.getElementById('taskDueDate').value = futureDate.toISOString().split('T')[0];
    }
    
    document.getElementById('taskModal').style.display = 'block';
}

// Save task
async function saveTask() {
    const taskId = document.getElementById('taskId').value;
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const status = document.getElementById('taskStatus').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const feedback = document.getElementById('taskFeedback').value;
    
    const selectedAssignees = Array.from(
        document.querySelectorAll('#assigneeCheckboxes input[type="checkbox"]:checked')
    ).map(cb => parseInt(cb.value));
    
    const taskData = {
        title,
        description,
        status,
        due_date: dueDate,
        assignees: selectedAssignees,
        feedback
    };
    
    try {
        let url = 'api.php?action=';
        if (taskId) {
            url += 'updateTask';
            taskData.id = parseInt(taskId);
        } else {
            url += 'createTask';
        }
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeModal('taskModal');
            loadTasks(document.getElementById('assigneeFilter').value);
            alert(taskId ? 'Görev güncellendi.' : 'Görev oluşturuldu.');
        } else {
            alert('Hata: ' + data.error);
        }
    } catch (error) {
        console.error('Görev kaydedilirken hata:', error);
        alert('Görev kaydedilirken bir hata oluştu.');
    }
}

// Open task detail
async function openTaskDetail(taskId) {
    try {
        const response = await fetch(`api.php?action=getTask&id=${taskId}`);
        const data = await response.json();
        
        if (data.success) {
            displayTaskDetail(data.task, data.feedback);
            document.getElementById('taskDetailModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Görev detayı yüklenirken hata:', error);
        alert('Görev detayı yüklenirken bir hata oluştu.');
    }
}

// Display task detail
function displayTaskDetail(task, feedback) {
    const detailContainer = document.getElementById('taskDetail');
    
    let html = `
        <div class="task-detail-header">
            <h2 class="task-detail-title">${task.title}</h2>
        </div>
        
        <div class="task-detail-info">
            <div class="info-item">
                <div class="info-label">Durum</div>
                <div class="info-value">${task.status}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Bitiş Tarihi</div>
                <div class="info-value">${formatDate(task.due_date)}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Atanan Kişiler</div>
                <div class="info-value">${task.assignees || 'Atanmamış'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Oluşturulma</div>
                <div class="info-value">${formatDateTime(task.created_at)}</div>
            </div>
        </div>
        
        <div class="task-detail-description">
            <h3>Açıklama</h3>
            <p>${task.description || 'Açıklama yok'}</p>
        </div>
        
        <div class="feedback-section">
            <h3>Geri Bildirimler</h3>
    `;
    
    if (feedback && feedback.length > 0) {
        feedback.forEach((fb, index) => {
            const latestClass = index === 0 ? 'latest' : '';
            const latestLabel = index === 0 ? ' (Son Durum)' : '';
            html += `
                <div class="feedback-item ${latestClass}">
                    <div class="feedback-message">${fb.message}${latestLabel}</div>
                    <div class="feedback-time">${formatDateTime(fb.created_at)}</div>
                </div>
            `;
        });
    } else {
        html += '<p style="color: #888;">Henüz geri bildirim yok.</p>';
    }
    
    html += `
            <div class="add-feedback-form">
                <textarea id="newFeedback" placeholder="Yeni durum notu ekle..." rows="3"></textarea>
                <button class="btn btn-primary" onclick="addFeedback(${task.id})">Durum Notu Ekle</button>
            </div>
        </div>
        
        <div class="detail-actions">
            <button class="btn btn-primary" onclick="editTask(${task.id})">Düzenle</button>
            <button class="btn btn-danger" onclick="deleteTask(${task.id})">Sil</button>
            <button class="btn btn-secondary" onclick="closeModal('taskDetailModal')">Kapat</button>
        </div>
    `;
    
    detailContainer.innerHTML = html;
}

// Edit task
async function editTask(taskId) {
    try {
        const response = await fetch(`api.php?action=getTask&id=${taskId}`);
        const data = await response.json();
        
        if (data.success) {
            closeModal('taskDetailModal');
            openTaskModal(data.task);
        }
    } catch (error) {
        console.error('Görev yüklenirken hata:', error);
        alert('Görev yüklenirken bir hata oluştu.');
    }
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    try {
        const response = await fetch(`api.php?action=deleteTask&id=${taskId}`);
        const data = await response.json();
        
        if (data.success) {
            closeModal('taskDetailModal');
            loadTasks(document.getElementById('assigneeFilter').value);
            alert('Görev silindi.');
        } else {
            alert('Hata: ' + data.error);
        }
    } catch (error) {
        console.error('Görev silinirken hata:', error);
        alert('Görev silinirken bir hata oluştu.');
    }
}

// Add feedback
async function addFeedback(taskId) {
    const message = document.getElementById('newFeedback').value.trim();
    
    if (!message) {
        alert('Lütfen bir durum notu girin.');
        return;
    }
    
    try {
        const response = await fetch('api.php?action=addFeedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                task_id: taskId,
                message: message
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            openTaskDetail(taskId);
            loadTasks(document.getElementById('assigneeFilter').value);
        } else {
            alert('Hata: ' + data.error);
        }
    } catch (error) {
        console.error('Geri bildirim eklenirken hata:', error);
        alert('Geri bildirim eklenirken bir hata oluştu.');
    }
}

// Open assignee modal
function openAssigneeModal() {
    displayAssigneeList();
    document.getElementById('assigneeModal').style.display = 'block';
}

// Display assignee list
function displayAssigneeList() {
    const listContainer = document.getElementById('assigneeList');
    listContainer.innerHTML = '';
    
    if (assignees.length === 0) {
        listContainer.innerHTML = '<p style="color: #888;">Henüz kişi eklenmemiş.</p>';
        return;
    }
    
    assignees.forEach(assignee => {
        const item = document.createElement('div');
        item.className = 'assignee-item';
        
        const info = document.createElement('div');
        info.className = 'assignee-info';
        
        const name = document.createElement('div');
        name.className = 'assignee-name';
        name.textContent = assignee.name;
        info.appendChild(name);
        
        if (assignee.email) {
            const email = document.createElement('div');
            email.className = 'assignee-email';
            email.textContent = assignee.email;
            info.appendChild(email);
        }
        
        item.appendChild(info);
        listContainer.appendChild(item);
    });
}

// Add assignee
async function addAssignee() {
    const name = document.getElementById('assigneeName').value.trim();
    const email = document.getElementById('assigneeEmail').value.trim();
    
    if (!name) {
        alert('Lütfen bir isim girin.');
        return;
    }
    
    try {
        const response = await fetch('api.php?action=createAssignee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('assigneeForm').reset();
            await loadAssignees();
            alert('Kişi eklendi.');
        } else {
            alert('Hata: ' + data.error);
        }
    } catch (error) {
        console.error('Kişi eklenirken hata:', error);
        alert('Kişi eklenirken bir hata oluştu.');
    }
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}
