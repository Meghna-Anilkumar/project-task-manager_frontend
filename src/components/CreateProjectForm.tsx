import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createProject } from '../redux/actions/projectActions';
import type { AppDispatch } from '../redux/store';
import CustomModal from './CustomModal';
import { motion } from 'framer-motion';

interface FormErrors {
  name?: string;
  description?: string;
}

const CreateProjectForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    console.log('Validation result:', newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called with:', { name, description });
    if (!validateForm()) return;

    try {
      const result = await dispatch(createProject({ name, description })).unwrap();
      console.log('Create project result:', result);
      setName('');
      setDescription('');
      setErrors({});
      setApiError(null);
      setIsModalOpen(false);
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Create project error:', error);
      setApiError(error.message || 'Failed to create project');
    }
  };

  const isFormValid = name.trim() && description.trim();

  return (
    <>
      <motion.button
        onClick={() => {
          console.log('Opening create project modal');
          setIsModalOpen(true);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mb-6 bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-sm sm:text-base"
      >
        Add Project
      </motion.button>
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => {
          console.log('Closing create project modal');
          setIsModalOpen(false);
          setName('');
          setDescription('');
          setErrors({});
          setApiError(null);
        }}
        title="Create New Project"
      >
        {apiError && <p className="text-red-500 mb-4 text-sm">{apiError}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                console.log('Name input changed:', e.target.value);
                setName(e.target.value);
                setErrors((prev) => ({
                  ...prev,
                  name: e.target.value.trim() ? undefined : 'Name is required',
                }));
              }}
              onFocus={() => console.log('Name input focused')}
              className={`border ${errors.name ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80 backdrop-blur-sm transition-colors duration-200`}
              placeholder="Enter project name"
              autoFocus
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => {
                console.log('Description input changed:', e.target.value);
                setDescription(e.target.value);
                setErrors((prev) => ({
                  ...prev,
                  description: e.target.value.trim() ? undefined : 'Description is required',
                }));
              }}
              onFocus={() => console.log('Description input focused')}
              className={`border ${errors.description ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80 backdrop-blur-sm transition-colors duration-200`}
              rows={4}
              placeholder="Enter project description"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          <div className="flex gap-3">
            <motion.button
              type="submit"
              disabled={!isFormValid}
              whileHover={{ scale: isFormValid ? 1.05 : 1 }}
              whileTap={{ scale: isFormValid ? 0.95 : 1 }}
              className={`bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-lg text-sm sm:text-base shadow-md transition-shadow duration-200 ${
                !isFormValid ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
              }`}
            >
              Create
            </motion.button>
            <motion.button
              type="button"
              onClick={() => {
                console.log('Cancel button clicked');
                setIsModalOpen(false);
                setName('');
                setDescription('');
                setErrors({});
                setApiError(null);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </CustomModal>
    </>
  );
};

export default CreateProjectForm;