import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { askQuestion } from '../redux/actions/taskActions';
import { resetQaResponse } from '../redux/reducers/tasksSlice';
import type { RootState, AppDispatch } from '../redux/store';

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
      dispatch(resetQaResponse()); 
      dispatch(askQuestion({ taskId, question }));
      setQuestion('');
    }
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about this task..."
          className="border border-gray-300 p-2 rounded text-sm sm:text-base w-full"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-200"
        >
          Ask AI
        </button>
      </form>
      {loading && <p className="text-blue-500 mt-2">Processing...</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {qaResponse && <p className="text-gray-600 mt-2">{qaResponse}</p>}
    </div>
  );
};

export default AiQaForm;