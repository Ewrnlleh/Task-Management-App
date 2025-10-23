import React, { useState, useRef, useEffect } from 'react';
import { Person } from '../types';
import { PlusIcon, FilterIcon } from './Icons';

interface HeaderProps {
  onAddTaskClick: () => void;
  people: Person[];
  selectedFilterIds: string[];
  onFilterChange: (personId: string) => void;
  currentUser: Person;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddTaskClick, people, selectedFilterIds, onFilterChange, currentUser, onLogout }) => {
  const [isFilterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="flex items-center justify-between p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 shadow-md sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Görev Yönetimi</h1>
      </div>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-md">
          <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full" />
          <span className="text-sm text-gray-200">{currentUser.name}</span>
        </div>
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setFilterOpen(prev => !prev)}
            className="flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-md font-semibold hover:bg-gray-600 transition-colors duration-200"
          >
            <FilterIcon className="w-5 h-5 mr-2" />
            Sorumlu Filtrele
            {selectedFilterIds.length > 0 && (
              <span className="ml-2 bg-indigo-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {selectedFilterIds.length}
              </span>
            )}
          </button>
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-30">
              <div className="p-2 max-h-60 overflow-y-auto custom-scrollbar">
                {people.map(person => (
                  <label key={person.id} className="flex items-center px-3 py-2 text-sm text-gray-200 rounded-md hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFilterIds.includes(person.id)}
                      onChange={() => onFilterChange(person.id)}
                      className="h-4 w-4 rounded border-gray-500 bg-gray-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                    />
                    <img src={person.avatarUrl} alt={person.name} className="w-6 h-6 rounded-full mx-3" />
                    <span>{person.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onAddTaskClick}
          className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-500 transition-colors duration-200"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Yeni Görev
        </button>
          <button
            onClick={onLogout}
            className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-500 transition-colors duration-200"
            title="Çıkış Yap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </button>
      </div>
    </header>
  );
};

export default Header;