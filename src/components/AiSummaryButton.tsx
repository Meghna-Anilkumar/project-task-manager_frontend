import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-modal';
import { getSummary } from '../redux/actions/taskActions';
import type { RootState, AppDispatch } from '../redux/store';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

Modal.setAppElement('#root');

interface AiSummaryButtonProps {
  projectId: string;
  className?: string;
}

const AiSummaryButton = ({ projectId, className }: AiSummaryButtonProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { summary, loading, error } = useSelector((state: RootState) => state.tasks);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSummarize = async () => {
    console.log('Generating summary for project:', projectId);
    try {
      await dispatch(getSummary(projectId)).unwrap();
      setIsModalOpen(true);
      toast.success('Summary generated successfully', { toastId: `summary-${projectId}` });
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Summary error:', error);
      toast.error(error.message || 'Failed to generate summary', { toastId: `summary-error-${projectId}` });
    }
  };

  return (
    <>
      <motion.button
        onClick={handleSummarize}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={className || 'bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base shadow-md hover:shadow-lg transition-shadow duration-200'}
      >
        Summarize Tasks
      </motion.button>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          console.log('Closing summary modal');
          setIsModalOpen(false);
        }}
        className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto mt-20 sm:mt-24"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">Task Summary</h2>
        {loading && <p className="text-blue-500 text-sm sm:text-base">Generating summary...</p>}
        {error && <p className="text-red-500 text-sm sm:text-base">{error}</p>}
        {summary && <p className="text-gray-600 text-sm sm:text-base">{summary}</p>}
        <motion.button
          onClick={() => {
            console.log('Closing summary modal via button');
            setIsModalOpen(false);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          Close
        </motion.button>
      </Modal>
    </>
  );
};

export default AiSummaryButton;