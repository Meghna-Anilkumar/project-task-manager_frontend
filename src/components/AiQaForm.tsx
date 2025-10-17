import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { askQuestion } from '../redux/actions/taskActions';
import type { RootState, AppDispatch } from '../redux/store';
import { motion } from 'framer-motion';

interface AiQaFormProps {
  taskId: string;
}

const AiQaForm = ({ taskId }: AiQaFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { qaResponse, loading, error } = useSelector((state: RootState) => state.tasks);
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      console.log('Asking AI question:', { taskId, question });
      dispatch(askQuestion({ taskId, question }));
      setQuestion('');
    }
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => {
            console.log('Question input changed:', e.target.value);
            setQuestion(e.target.value);
          }}
          placeholder="Ask a question about this task..."
          className="border border-gray-300 p-2 rounded-lg text-sm sm:text-base w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80 backdrop-blur-sm transition-colors duration-200"
        />
        <motion.button
          type="submit"
          disabled={!question.trim()}
          whileHover={{ scale: question.trim() ? 1.05 : 1 }}
          whileTap={{ scale: question.trim() ? 0.95 : 1 }}
          className={`bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base shadow-md transition-shadow duration-200 ${
            !question.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
          }`}
        >
          Ask AI
        </motion.button>
      </form>
      {loading && <p className="text-blue-500 mt-2 text-sm">Processing...</p>}
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      {qaResponse && <p className="text-gray-600 mt-2 text-sm sm:text-base">{qaResponse}</p>}
    </div>
  );
};

export default AiQaForm;