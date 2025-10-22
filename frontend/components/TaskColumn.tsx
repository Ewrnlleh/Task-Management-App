import React from 'react';
import { Task, TaskStatus } from '../types';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onTaskSelect: (task: Task) => void;
}

const statusColors: { [key in TaskStatus]: string } = {
  [TaskStatus.YENI_TALEP]: 'bg-blue-600',
  [TaskStatus.DEVAM_EDIYOR]: 'bg-yellow-500',
  [TaskStatus.BEKLEMEDE]: 'bg-gray-500',
  [TaskStatus.TEST_ASAMASINDA]: 'bg-purple-600',
  [TaskStatus.TAMAMLANDI]: 'bg-green-600',
};


const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks, onDrop, onDragOver, onTaskSelect }) => {
  return (
    <div
      className="bg-gray-800 rounded-lg p-4 flex flex-col h-full"
      onDrop={(e) => onDrop(e, status)}
      onDragOver={onDragOver}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${statusColors[status]}`}></span>
            <h2 className="font-bold text-lg text-white">{status}</h2>
        </div>
        <span className="bg-gray-700 text-gray-300 text-sm font-semibold rounded-full px-2 py-1">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onTaskSelect={onTaskSelect} />
        ))}
      </div>
    </div>
  );
};

export default TaskColumn;