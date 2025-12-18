import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: { name: string; description?: string; deadline?: string }) => void;
  initialData?: {
    name: string;
    description?: string;
    deadline?: string;
  };
  mode?: 'create' | 'edit';
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = 'create',
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    deadline: initialData?.deadline || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        deadline: formData.deadline || undefined,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: initialData?.name || '',
      description: initialData?.description || '',
      deadline: initialData?.deadline || '',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t(`project.${mode}`)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('project.name')}
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
            placeholder={t('project.name')}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('project.description')}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field resize-none"
            rows={3}
            placeholder={t('project.description')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('project.deadline')}
          </label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="input-field"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" onClick={handleClose} className="flex-1">
            {t('modal.cancel')}
          </Button>
          <Button type="submit" className="flex-1">
            {t('modal.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};