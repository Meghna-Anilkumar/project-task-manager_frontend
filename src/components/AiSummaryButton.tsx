import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-modal';
import { getSummary } from '../redux/actions/taskActions';
import type { RootState, AppDispatch } from '../redux/store';

Modal.setAppElement('#root');

interface AiSummaryButtonProps {
  projectId: string;
}

const AiSummaryButton = ({ projectId }: AiSummaryButtonProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { summary, loading, error } = useSelector((state: RootState) => state.tasks);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSummarize = () => {
    dispatch(getSummary(projectId));
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        onClick={handleSummarize}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
      >
        Summarize Tasks
      </button>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto mt-20 sm:mt-24"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">Task Summary</h2>
        {loading && <p className="text-blue-500">Generating summary...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {summary && <p className="text-gray-600">{summary}</p>}
        <button
          onClick={() => setIsModalOpen(false)}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200"
        >
          Close
        </button>
      </Modal>
    </>
  );
};

export default AiSummaryButton;