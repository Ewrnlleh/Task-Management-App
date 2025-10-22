import React, { useState } from 'react';
import { Person } from '../types';
import { XIcon } from './Icons';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (taskData: { title: string; description: string; assigneeIds: string[]; dueDate?: string }) => void;
  people: Person[];
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask, people }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');

  const handleAssigneeChange = (personId: string) => {
    setAssigneeIds(prev =>
        prev.includes(personId)
            ? prev.filter(id => id !== personId)
            : [...prev, personId]
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || assigneeIds.length === 0) {
      alert('Lütfen tüm alanları doldurun ve en az bir sorumlu kişi seçin.');
      return;
    }
    onAddTask({ title, description, assigneeIds, dueDate: dueDate || undefined });
    setTitle('');
    setDescription('');
    setAssigneeIds([]);
    setDueDate('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4 transform transition-all duration-300 scale-95 hover:scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Yeni Görev Ekle</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Başlık</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Açıklama</label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 p-2"
                required
              />
            </div>
             <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300 mb-1">Bitiş Tarihi (İsteğe bağlı)</label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sorumlu Kişiler</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                {people.map(person => (
                  <label key={person.id} className="flex items-center space-x-3 bg-gray-700 p-2 rounded-md hover:bg-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assigneeIds.includes(person.id)}
                      onChange={() => handleAssigneeChange(person.id)}
                      className="h-4 w-4 rounded border-gray-500 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-200">{person.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors">İptal</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors">Görevi Ekle</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;