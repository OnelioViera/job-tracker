import React, { useState } from 'react';

interface ProjectManagerSelectProps {
  value: string;
  onChange: (value: string) => void;
  projectManagers: string[];
  onAddProjectManager: (manager: string) => void;
  onDeleteProjectManager: (manager: string) => void;
  isEditing?: boolean;
}

export const ProjectManagerSelect: React.FC<ProjectManagerSelectProps> = ({ 
  value, 
  onChange, 
  projectManagers, 
  onAddProjectManager, 
  onDeleteProjectManager,
  isEditing = false
}) => {
  const [newManager, setNewManager] = useState("");

  const handleAddManager = () => {
    if (newManager && !projectManagers.includes(newManager)) {
      onAddProjectManager(newManager);
      setNewManager("");
    }
  };

  const handleDeleteManager = (manager: string) => {
    onDeleteProjectManager(manager);
    if (value === manager) {
      onChange("");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium">
        Project Manager {isEditing && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-2">
        <select
          className="border rounded px-2 py-1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={isEditing}
        >
          <option value="">Select a project manager...</option>
          {projectManagers.map((manager) => (
            <option key={manager} value={manager}>
              {manager}
            </option>
          ))}
        </select>
        <input
          className="border rounded px-2 py-1"
          type="text"
          placeholder="Add manager"
          value={newManager}
          onChange={(e) => setNewManager(e.target.value)}
        />
        <button
          type="button"
          className="bg-blue-500 text-white px-2 py-1 rounded"
          onClick={handleAddManager}
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        {projectManagers.map((manager) => (
          <span key={manager} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
            {manager}
            <button
              type="button"
              className="text-red-500 hover:text-red-700"
              onClick={() => handleDeleteManager(manager)}
              title={`Delete ${manager}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProjectManagerSelect; 