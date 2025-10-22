import React from 'react';
import { Task, TaskStatus } from '../types';
import TaskColumn from './TaskColumn';

interface TaskBoardProps {
  tasks: Task[];
  statuses: TaskStatus[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onTaskSelect: (task: Task) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, statuses, onStatusChange, onTaskSelect }) => {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onStatusChange(taskId, status);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 h-full">
      {statuses.map(status => (
        <TaskColumn
          key={status}
          status={status}
          tasks={tasks.filter(task => task.status === status)}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onTaskSelect={onTaskSelect}
        />
      ))}
    </div>
  );
};

export default TaskBoard;