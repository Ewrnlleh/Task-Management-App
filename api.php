<?php
// API endpoint for task management

header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

$db = new Database();
$conn = $db->connect();

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'getTasks':
            $assigneeFilter = $_GET['assignee'] ?? '';
            
            $query = "SELECT DISTINCT t.*, GROUP_CONCAT(DISTINCT a.id) as assignee_ids, 
                      GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') as assignees,
                      (SELECT f.message FROM feedback f WHERE f.task_id = t.id 
                       ORDER BY f.created_at DESC LIMIT 1) as latest_feedback
                      FROM tasks t
                      LEFT JOIN task_assignees ta ON t.id = ta.task_id
                      LEFT JOIN assignees a ON ta.assignee_id = a.id";
            
            if ($assigneeFilter) {
                $query .= " WHERE ta.assignee_id = :assignee_id";
            }
            
            $query .= " GROUP BY t.id ORDER BY t.due_date ASC, t.id DESC";
            
            $stmt = $conn->prepare($query);
            if ($assigneeFilter) {
                $stmt->bindParam(':assignee_id', $assigneeFilter, PDO::PARAM_INT);
            }
            $stmt->execute();
            $tasks = $stmt->fetchAll();
            
            echo json_encode(['success' => true, 'tasks' => $tasks]);
            break;
            
        case 'getTask':
            $id = $_GET['id'] ?? 0;
            
            $stmt = $conn->prepare("SELECT t.*, GROUP_CONCAT(DISTINCT ta.assignee_id) as assignee_ids,
                                    GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') as assignees
                                    FROM tasks t
                                    LEFT JOIN task_assignees ta ON t.id = ta.task_id
                                    LEFT JOIN assignees a ON ta.assignee_id = a.id
                                    WHERE t.id = :id
                                    GROUP BY t.id");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $task = $stmt->fetch();
            
            // Get feedback
            $stmt = $conn->prepare("SELECT * FROM feedback WHERE task_id = :task_id ORDER BY created_at DESC");
            $stmt->bindParam(':task_id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $feedback = $stmt->fetchAll();
            
            echo json_encode(['success' => true, 'task' => $task, 'feedback' => $feedback]);
            break;
            
        case 'createTask':
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $conn->prepare("INSERT INTO tasks (title, description, status, due_date) 
                                   VALUES (:title, :description, :status, :due_date)");
            $stmt->execute([
                ':title' => $data['title'],
                ':description' => $data['description'],
                ':status' => $data['status'],
                ':due_date' => $data['due_date']
            ]);
            
            $taskId = $conn->lastInsertId();
            
            // Add assignees
            if (!empty($data['assignees'])) {
                $stmt = $conn->prepare("INSERT INTO task_assignees (task_id, assignee_id) VALUES (:task_id, :assignee_id)");
                foreach ($data['assignees'] as $assigneeId) {
                    $stmt->execute([':task_id' => $taskId, ':assignee_id' => $assigneeId]);
                }
            }
            
            // Add initial feedback if provided
            if (!empty($data['feedback'])) {
                $stmt = $conn->prepare("INSERT INTO feedback (task_id, message) VALUES (:task_id, :message)");
                $stmt->execute([':task_id' => $taskId, ':message' => $data['feedback']]);
            }
            
            echo json_encode(['success' => true, 'id' => $taskId]);
            break;
            
        case 'updateTask':
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $conn->prepare("UPDATE tasks SET title = :title, description = :description, 
                                   status = :status, due_date = :due_date WHERE id = :id");
            $stmt->execute([
                ':id' => $data['id'],
                ':title' => $data['title'],
                ':description' => $data['description'],
                ':status' => $data['status'],
                ':due_date' => $data['due_date']
            ]);
            
            // Update assignees
            $stmt = $conn->prepare("DELETE FROM task_assignees WHERE task_id = :task_id");
            $stmt->execute([':task_id' => $data['id']]);
            
            if (!empty($data['assignees'])) {
                $stmt = $conn->prepare("INSERT INTO task_assignees (task_id, assignee_id) VALUES (:task_id, :assignee_id)");
                foreach ($data['assignees'] as $assigneeId) {
                    $stmt->execute([':task_id' => $data['id'], ':assignee_id' => $assigneeId]);
                }
            }
            
            echo json_encode(['success' => true]);
            break;
            
        case 'deleteTask':
            $id = $_GET['id'] ?? 0;
            
            $stmt = $conn->prepare("DELETE FROM tasks WHERE id = :id");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            
            echo json_encode(['success' => true]);
            break;
            
        case 'addFeedback':
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $conn->prepare("INSERT INTO feedback (task_id, message) VALUES (:task_id, :message)");
            $stmt->execute([
                ':task_id' => $data['task_id'],
                ':message' => $data['message']
            ]);
            
            echo json_encode(['success' => true, 'id' => $conn->lastInsertId()]);
            break;
            
        case 'getAssignees':
            $stmt = $conn->query("SELECT * FROM assignees ORDER BY name");
            $assignees = $stmt->fetchAll();
            
            echo json_encode(['success' => true, 'assignees' => $assignees]);
            break;
            
        case 'createAssignee':
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $conn->prepare("INSERT INTO assignees (name, email) VALUES (:name, :email)");
            $stmt->execute([
                ':name' => $data['name'],
                ':email' => $data['email']
            ]);
            
            echo json_encode(['success' => true, 'id' => $conn->lastInsertId()]);
            break;
            
        default:
            echo json_encode(['success' => false, 'error' => 'Geçersiz işlem']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
