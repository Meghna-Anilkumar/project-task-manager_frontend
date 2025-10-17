import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Draggable } from '@hello-pangea/dnd';
import { updateTaskStatus, deleteTask } from '../redux/actions/taskActions';
import type { AppDispatch } from '../redux/store';
import type { Task } from '../types';
import CustomModal from './CustomModal';
import AiQaForm from './AiQaForm';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

interface TaskCardProps {
  task: Task;
  index: number;
}

interface FormErrors {
  title?: string;
  description?: string;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Error in TaskCard:', error);
  }

  render() {
    if (this.state.hasError) {
      return <p className="text-red-500 text-sm">Something went wrong with this task.</p>;
    }
    return this.props.children;
  }
}

const TaskCard = ({ task, index }: TaskCardProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const activeInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setErrors({});
    setApiError(null);
  }, [task]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    console.log('Validation result:', newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleUpdate called with:', { taskId: task._id, title, description, status, projectId: task.projectId });
    if (!validateForm()) return;

    try {
      const result = await dispatch(
        updateTaskStatus({
          taskId: task._id,
          status,
          projectId: task.projectId,
          title,
          description,
        })
      ).unwrap();
      console.log('Update task result:', result);
      toast.success('Task updated successfully', { toastId: `update-${task._id}` });
      setErrors({});
      setApiError(null);
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Update error:', error);
      setApiError(error.message || 'Failed to update task');
      toast.error(error.message || 'Failed to update task', { toastId: `update-error-${task._id}` });
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await Swal.fire({
      title: 'Delete Task?',
      text: `Are you sure you want to delete "${task.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        confirmButton: 'px-4 py-2 rounded-lg',
        cancelButton: 'px-4 py-2 rounded-lg',
      },
    });

    if (result.isConfirmed) {
      try {
        console.log('Deleting task:', task._id);
        await dispatch(deleteTask(task._id)).unwrap();
        console.log('Task deleted successfully:', task._id);
        toast.success('Task deleted successfully', { toastId: `delete-${task._id}` });
      } catch (err: unknown) {
        const error = err as { message?: string };
        console.error('Delete error:', error);
        toast.error(error.message || 'Failed to delete task', { toastId: `delete-error-${task._id}` });
      }
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Edit button clicked for task:', task._id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setErrors({});
    setApiError(null);
    setIsEditModalOpen(true);
  };

  const handleAiClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Ask AI button clicked for task:', task._id);
    setIsAiModalOpen(true);
  };

  const handleModalClose = () => {
    console.log('Closing edit modal');
    setIsEditModalOpen(false);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setErrors({});
    setApiError(null);
    activeInputRef.current = null;
  };

  const handleAiModalClose = () => {
    console.log('Closing AI modal');
    setIsAiModalOpen(false);
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    activeInputRef.current = e.target;
    console.log('Input focused:', e.target.id);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    field: 'title' | 'description'
  ) => {
    const { value } = e.target;
    console.log(`${field} input changed:`, value);
    setValue(value);
    setErrors((prev) => ({
      ...prev,
      [field]: value.trim() ? undefined : `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
    }));
    setTimeout(() => {
      if (activeInputRef.current) {
        activeInputRef.current.focus();
        console.log('Focus restored to:', activeInputRef.current.id);
      }
    }, 0);
  };

  const isFormValid = title.trim() && description.trim();

  return (
    <ErrorBoundary>
      <Draggable draggableId={task._id} index={index} isDragDisabled={isEditModalOpen || isAiModalOpen}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="mb-4"
          >
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: snapshot.isDragging ? 0.7 : 1, scale: snapshot.isDragging ? 0.98 : 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white p-4 rounded-xl shadow-lg border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
                </svg>
                <span className="text-xs text-gray-500">Drag to reorder</span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{task.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base mt-2 line-clamp-2">{task.description}</p>
                <p className="text-gray-400 text-xs mt-2">
                  Created:{' '}
                  {new Date(task.createdDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <div className="flex gap-2 mt-4 flex-wrap">
                  <motion.button
                    type="button"
                    onClick={handleEditClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-lg text-xs sm:text-sm shadow-md hover:shadow-lg transition-shadow duration-200"
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleDelete}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-red-400 to-red-500 text-white px-3 py-1 rounded-lg text-xs sm:text-sm shadow-md hover:shadow-lg transition-shadow duration-200"
                  >
                    Delete
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleAiClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1 rounded-lg text-xs sm:text-sm shadow-md hover:shadow-lg transition-shadow duration-200 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Ask AI
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </Draggable>

      {/* Edit Modal */}
      <CustomModal isOpen={isEditModalOpen} onClose={handleModalClose} title="Edit Task">
        {apiError && <p className="text-red-500 mb-4 text-sm">{apiError}</p>}
        <form onSubmit={handleUpdate} className="flex flex-col gap-5">
          <div>
            <label className="block text-gray-900 text-sm font-semibold mb-2" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => handleInputChange(e, setTitle, 'title')}
              onFocus={handleInputFocus}
              className={`border ${errors.title ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80 backdrop-blur-sm transition-colors duration-200`}
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
              id="description"
              value={description}
              onChange={(e) => handleInputChange(e, setDescription, 'description')}
              onFocus={handleInputFocus}
              className={`border ${errors.description ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80 backdrop-blur-sm transition-colors duration-200`}
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
              onChange={(e) => {
                console.log('Status select changed:', e.target.value);
                setStatus(e.target.value);
              }}
              onFocus={() => console.log('Status select focused')}
              className="border border-gray-300 p-2 rounded-lg w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80 backdrop-blur-sm transition-colors duration-200"
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
              className={`bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-lg text-sm sm:text-base shadow-md transition-shadow duration-200 ${
                !isFormValid ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
              }`}
            >
              Update
            </motion.button>
            <motion.button
              type="button"
              onClick={() => {
                console.log('Cancel button clicked');
                handleModalClose();
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

      {/* AI Q&A Modal */}
      <CustomModal isOpen={isAiModalOpen} onClose={handleAiModalClose} title={`Ask AI About: ${task.title}`}>
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">{task.description}</p>
        </div>
        <AiQaForm taskId={task._id} />
      </CustomModal>
    </ErrorBoundary>
  );
};

export default TaskCard;