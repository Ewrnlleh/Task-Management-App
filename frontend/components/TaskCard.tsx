import React from 'react';
import { Task } from '../types';
import { CalendarIcon } from './Icons';

interface TaskCardProps {
  task: Task;
  onTaskSelect: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskSelect }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Compare dates without time
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isTaskOverdue = dueDate && dueDate < today;

  const maxVisibleAssignees = 2;
  const visibleAssignees = task.assignees.slice(0, maxVisibleAssignees);
  const hiddenAssigneesCount = task.assignees.length - maxVisibleAssignees;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onTaskSelect(task)}
      className={`bg-gray-700 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-600 transition-colors duration-200 border-l-4 ${isTaskOverdue ? 'border-red-500' : 'border-indigo-500'}`}
    >
      <h3 className="font-semibold text-white mb-2">{task.title}</h3>
      <div className="flex items-center justify-between mt-3 text-xs">
        {task.dueDate ? (
          <div className={`flex items-center font-medium ${isTaskOverdue ? 'text-red-400' : 'text-gray-400'}`}>
            <CalendarIcon className="w-4 h-4 mr-1" />
            <span>{new Date(task.dueDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}</span>
            {isTaskOverdue && <span className="ml-1 font-bold">(Gecikti)</span>}
          </div>
        ) : <div />}
        <div className="flex items-center">
            <div className="flex -space-x-3">
              {visibleAssignees.map(assignee => (
                <img
                  key={assignee.id}
                  src={assignee.avatarUrl}
                  alt={assignee.name}
                  className="w-8 h-8 rounded-full border-2 border-gray-800"
                  title={assignee.name}
                />
              ))}
            </div>
            {hiddenAssigneesCount > 0 && (
                <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-gray-800 flex items-center justify-center text-xs font-bold text-gray-300 ml-[-12px] z-10">
                   +{hiddenAssigneesCount}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;