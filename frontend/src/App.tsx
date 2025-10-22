import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Person } from './types';
import { STATUS_ORDER } from './constants';
import Header from './components/Header';
import TaskBoard from './components/TaskBoard';
import AddTaskModal from './components/AddTaskModal';
import TaskModal from './components/TaskModal';

const API_BASE_URL = 'http://localhost:3001/api';

const processTasksData = (tasksData: any[]): Task[] => {
    return tasksData.map((task: any) => ({
        ...task,
        feedback: task.feedback.map((fb: any) => ({
            ...fb,
            timestamp: new Date(fb.timestamp),
        })),
    }));
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterAssigneeIds, setFilterAssigneeIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksResponse, peopleResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/tasks`),
          fetch(`${API_BASE_URL}/people`)
        ]);

        if (!tasksResponse.ok || !peopleResponse.ok) {
          throw new Error('Failed to fetch initial data from the server.');
        }

        const tasksData = await tasksResponse.json();
        const peopleData = await peopleResponse.json();

        setTasks(processTasksData(tasksData));
        setPeople(peopleData);
      } catch (err: any) {
        console.error(err);
        setError('Backend sunucusuna bağlanılamadı. Lütfen sunucunun çalıştığından emin olun.');
      }
    };
    fetchData();
  }, []);

  const handleAddTask = async (taskData: { title: string; description: string; assigneeIds: string[]; dueDate?: string }) => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        if (!response.ok) throw new Error('Failed to add task.');
        const updatedTasks = await response.json();
        setTasks(processTasksData(updatedTasks));
        setAddTaskModalOpen(false);
    } catch (err) {
        console.error(err);
        setError('Görev eklenirken bir hata oluştu.');
    }
  };
  
  const handleUpdateTask = async (updatedTask: Task) => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${updatedTask.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask)
        });
        if (!response.ok) throw new Error('Failed to update task.');
        const updatedTasks = await response.json();
        setTasks(processTasksData(updatedTasks));
        
        // Update the selected task as well to reflect changes immediately in the modal
        const newlyUpdatedTask = processTasksData(updatedTasks).find((t: Task) => t.id === updatedTask.id);
        setSelectedTask(newlyUpdatedTask || null);

    } catch(err) {
        console.error(err);
        setError('Görev güncellenirken bir hata oluştu.');
    }
  };
  
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (taskToUpdate) {
        handleUpdateTask({ ...taskToUpdate, status: newStatus });
    }
  };
  
  const handleAddFeedback = async (taskId: string, feedbackText: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: feedbackText })
        });
        if (!response.ok) throw new Error('Failed to add feedback.');
        const updatedTasks = await response.json();
        setTasks(processTasksData(updatedTasks));

        const newlyUpdatedTask = processTasksData(updatedTasks).find((t: Task) => t.id === taskId);
        setSelectedTask(newlyUpdatedTask || null);
    } catch (err) {
        console.error(err);
        setError('Durum eklenirken bir hata oluştu.');
    }
  };
  
  const handleFilterChange = (personId: string) => {
    setFilterAssigneeIds(prev =>
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const filteredTasks = tasks.filter(task => {
    if (filterAssigneeIds.length === 0) return true;
    return task.assignees.some(assignee => filterAssigneeIds.includes(assignee.id));
  });

  if (error) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            <div className="text-center bg-red-900/50 p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-red-400">Bağlantı Hatası</h2>
                <p>{error}</p>
                <p className="mt-2 text-sm text-gray-400">`backend` klasöründe `npm install` ve `node server.js` komutlarını çalıştırdınız mı?</p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      <Header
        onAddTaskClick={() => setAddTaskModalOpen(true)}
        people={people}
        selectedFilterIds={filterAssigneeIds}
        onFilterChange={handleFilterChange}
      />
      <main className="flex-1 overflow-x-auto p-4 md:p-6">
        <TaskBoard 
          tasks={filteredTasks}
          statuses={STATUS_ORDER}
          onStatusChange={handleStatusChange}
          onTaskSelect={setSelectedTask}
        />
      </main>
      
      {isAddTaskModalOpen && (
        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={() => setAddTaskModalOpen(false)}
          onAddTask={handleAddTask}
          people={people}
        />
      )}

      {selectedTask && (
        <TaskModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          onUpdateTask={handleUpdateTask}
          onAddFeedback={handleAddFeedback}
          people={people}
        />
      )}
    </div>
  );
};

export default App;