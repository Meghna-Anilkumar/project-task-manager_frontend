import { useState, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { createTask } from '../redux/actions/taskActions';
import type { AppDispatch } from '../redux/store';
import CustomModal from './CustomModal';
import { motion } from 'framer-motion';

interface CreateTaskFormProps {
  projectId: string;
}

interface FormErrors {
  title?: string;
  description?: string;
}

const CreateTaskForm = ({ projectId }: CreateTaskFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    console.log('Validation result:', newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, description]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      console.log('handleSubmit called with:', { title, description, status, projectId });
      if (!validateForm()) return;

      try {
        const result = await dispatch(createTask({ title, description, status, projectId })).unwrap();
        console.log('Create task result:', result);
        setTitle('');
        setDescription('');
        setStatus('todo');
        setErrors({});
        setApiError(null);
        setIsModalOpen(false);
      } catch (err: unknown) {
        const error = err as { message?: string };
        console.error('Create task error:', error);
        setApiError(error.message || 'Failed to create task');
      }
    },
    [dispatch, projectId, title, description, status, validateForm]
  );

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Title input changed:', e.target.value);
    setTitle(e.target.value);
  }, []);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('Description input changed:', e.target.value);
    setDescription(e.target.value);
  }, []);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Status select changed:', e.target.value);
    setStatus(e.target.value);
  }, []);

  const handleBlur = useCallback(() => {
    validateForm();
  }, [validateForm]);

  const handleClose = useCallback(() => {
    console.log('Closing create task modal');
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setStatus('todo');
    setErrors({});
    setApiError(null);
  }, []);

  const isFormValid = title.trim() && description.trim();

  return (
    <>
      <motion.button
        onClick={() => {
          console.log('Opening create task modal');
          setIsModalOpen(true);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm sm:text-base shadow-md hover:shadow-lg transition-shadow duration-200 font-semibold"
      >
        Add Task
      </motion.button>
      <CustomModal
        isOpen={isModalOpen}
        onClose={handleClose}
        title="Create New Task"
      >
        {apiError && <p className="text-red-500 mb-4 text-sm">{apiError}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2" htmlFor="title">
              Title
            </label>
            <input
              ref={titleInputRef}
              id="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleBlur}
              onFocus={() => console.log('Title input focused')}
              className={`border ${errors.title ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur-sm transition-colors duration-200`}
              placeholder="Enter task title"
              autoFocus
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              ref={descriptionInputRef}
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              onBlur={handleBlur}
              onFocus={() => console.log('Description input focused')}
              className={`border ${errors.description ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur-sm transition-colors duration-200`}
              rows={4}
              placeholder="Enter task description"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={handleStatusChange}
              onFocus={() => console.log('Status select focused')}
              className="border border-gray-300 p-2 rounded-lg w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur-sm transition-colors duration-200"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="flex gap-3">
            <motion.button
              type="submit"
              disabled={!isFormValid}
              whileHover={{ scale: isFormValid ? 1.05 : 1 }}
              whileTap={{ scale: isFormValid ? 0.95 : 1 }}
              className={`bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm sm:text-base shadow-md transition-shadow duration-200 font-semibold ${
                !isFormValid ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
              }`}
            >
              Create
            </motion.button>
            <motion.button
              type="button"
              onClick={handleClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base shadow-md hover:shadow-lg transition-shadow duration-200 font-semibold"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </CustomModal>
    </>
  );
};

export default CreateTaskForm;