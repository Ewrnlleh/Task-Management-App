import React, { useState } from 'react';
import { Task, TaskStatus, Person } from '../types';
import { STATUS_ORDER } from '../constants';
import { XIcon } from './Icons';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onUpdateTask: (updatedTask: Task) => void;
  onAddFeedback: (taskId: string, feedbackText: string) => void;
  people: Person[];
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, onUpdateTask, onAddFeedback, people }) => {
  const [newFeedback, setNewFeedback] = useState('');

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    onUpdateTask({ ...task, status: newStatus });
  };
  
  const handleAssigneeChange = (personId: string) => {
    const currentAssigneeIds = task.assignees.map(p => p.id);
    const newAssigneeIds = currentAssigneeIds.includes(personId)
        ? currentAssigneeIds.filter(id => id !== personId)
        : [...currentAssigneeIds, personId];
    
    if (newAssigneeIds.length === 0) {
        // Prevent removing the last assignee
        return;
    }

    const newAssignees = people.filter(p => newAssigneeIds.includes(p.id));
    onUpdateTask({ ...task, assignees: newAssignees });
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateTask({ ...task, dueDate: e.target.value || undefined });
  };


  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFeedback.trim()) {
      onAddFeedback(task.id, newFeedback.trim());
      setNewFeedback('');
    }
  };

  if (!isOpen) return null;
  
  const sortedFeedback = [...task.feedback].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-3xl mx-auto flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-3xl font-bold text-white">{task.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <XIcon className="w-7 h-7" />
          </button>
        </div>
        
        <p className="text-gray-400 mb-6">{task.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Durum</label>
            <select
              value={task.status}
              onChange={handleStatusChange}
              className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 p-2"
            >
              {STATUS_ORDER.map((status: TaskStatus) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Bitiş Tarihi</label>
            <input
              type="date"
              value={task.dueDate || ''}
              onChange={handleDueDateChange}
              className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Sorumlular</label>
             <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                {people.map(person => (
                  <label key={person.id} className="flex items-center space-x-3 bg-gray-700 p-2 rounded-md hover:bg-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={task.assignees.some(a => a.id === person.id)}
                      onChange={() => handleAssigneeChange(person.id)}
                      className="h-4 w-4 rounded border-gray-500 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-200">{person.name}</span>
                  </label>
                ))}
              </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-xl font-semibold text-white mb-3 border-b border-gray-700 pb-2">Son Durum</h3>
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 mb-4">
            {sortedFeedback.length > 0 ? (
                sortedFeedback.map(fb => (
                    <div key={fb.id} className="bg-gray-700/50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-gray-900 ring-1 ring-gray-700 overflow-hidden inline-flex">
                    <img
                      src={fb.user_avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(fb.user_name || 'Kullanıcı')}
                      alt={fb.user_name || 'Kullanıcı'}
                      className="w-full h-full object-cover"
                    />
                  </span>
                <span className="text-sm font-semibold text-indigo-400">{fb.user_name || 'Bilinmeyen Kullanıcı'}</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">{fb.timestamp.toLocaleString('tr-TR')}</span>
              </div>
                        <p className="text-gray-200">{fb.text}</p>
                    </div>
                ))
            ) : (
                <p className="text-gray-500">Henüz bir durum güncellemesi yok.</p>
            )}
          </div>
          <form onSubmit={handleFeedbackSubmit} className="mt-auto pt-4 border-t border-gray-700">
            <textarea
              rows={2}
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              placeholder="Yeni bir durum ekle..."
              className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 p-2 mb-2"
            />
            <button type="submit" className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors font-semibold">
              Gönder
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;