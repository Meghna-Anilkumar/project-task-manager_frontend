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
        className="bg-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 my-8 relative z-[60] max-h-[85vh] overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[50] backdrop-blur-sm overflow-y-auto p-4"
      >
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Task Summary
          </h2>
        </div>
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-purple-500 absolute top-0 left-0"></div>
            </div>
            <p className="text-purple-600 mt-4 font-semibold text-sm sm:text-base">Generating summary...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-semibold text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}
        
        {summary && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200 mb-4">
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{summary}</p>
          </div>
        )}
        
        <motion.button
          onClick={() => {
            console.log('Closing summary modal via button');
            setIsModalOpen(false);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full mt-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2.5 rounded-xl text-sm sm:text-base shadow-md hover:shadow-lg transition-shadow duration-200 font-semibold"
        >
          Close
        </motion.button>
      </Modal>
    </>
  );
};

export default AiSummaryButton;