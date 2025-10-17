import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable} from '@hello-pangea/dnd';
import type {DropResult } from '@hello-pangea/dnd';
import { fetchTasks, updateTaskStatus } from '../redux/actions/taskActions';
import type { RootState, AppDispatch } from '../redux/store';
import TaskCard from './TaskCard';
import AiSummaryButton from './AiSummaryButton';
import CreateTaskForm from './CreateTaskForm';
import type { Task } from '../types';
import { motion } from 'framer-motion';

interface SortableColumnProps {
  column: string;
  columnId: string;
  tasks: Task[];
}

const SortableColumn = ({ column, columnId, tasks }: SortableColumnProps) => {
  return (
    <Droppable droppableId={columnId}>
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={`p-4 rounded-xl w-full sm:w-1/3 min-w-[250px] flex-shrink-0 shadow-lg transition-colors duration-200 ${
            snapshot.isDraggingOver ? 'bg-gradient-to-b from-indigo-100 to-blue-200' : 'bg-gradient-to-b from-gray-100 to-gray-200'
          }`}
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">{column}</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-600 text-sm">No tasks in this column.</p>
          ) : (
            tasks.map((task: Task, index: number) => (
              <TaskCard key={task._id} task={task} index={index} />
            ))
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

const KanbanBoard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, error } = useSelector((state: RootState) => state.tasks);

  const columns = [
    { display: 'To Do', value: 'todo' },
    { display: 'In Progress', value: 'in-progress' },
    { display: 'Done', value: 'done' },
  ];

  useEffect(() => {
    if (projectId) {
      console.log('Fetching tasks for project:', projectId);
      dispatch(fetchTasks(projectId));
    }
  }, [dispatch, projectId]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || !projectId) {
      console.log('No destination or projectId, aborting drag');
      return;
    }

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;
    const sourceIndex = source.index;
    const destIndex = destination.index;

    if (sourceColumn === destColumn && sourceIndex === destIndex) {
      console.log('No change in position, aborting drag');
      return;
    }

    const activeTask = tasks.find((task) => task._id === result.draggableId);
    if (!activeTask) {
      console.log('Task not found for draggableId:', result.draggableId);
      return;
    }

    if (sourceColumn !== destColumn) {
      const newStatus = columns.find((col) => col.display === destColumn)?.value;
      if (newStatus && activeTask.status !== newStatus) {
        console.log('Updating task status:', { taskId: activeTask._id, newStatus });
        dispatch(updateTaskStatus({ taskId: activeTask._id, status: newStatus, projectId }));
      }
    } else {
      console.log('Reordering task within column:', { taskId: activeTask._id, sourceIndex, destIndex });
      // Note: Add backend support for task ordering if needed
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Kanban Board</h1>
        <div className="flex gap-3">
          {projectId && <CreateTaskForm projectId={projectId} />}
          {projectId && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <AiSummaryButton
                projectId={projectId}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base shadow-md hover:shadow-lg transition-shadow duration-200"
              />
            </motion.div>
          )}
        </div>
      </div>
      {loading && <p className="text-indigo-500 text-sm sm:text-base">Loading tasks...</p>}
      {error && <p className="text-red-500 text-sm sm:text-base">{error}</p>}
      {tasks.length === 0 && !loading && !error && (
        <p className="text-gray-600 text-sm sm:text-base">No tasks found for this project.</p>
      )}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col sm:flex-row gap-4 overflow-x-auto">
          {columns.map(({ display, value }) => (
            <SortableColumn
              key={display}
              column={display}
              columnId={display}
              tasks={tasks.filter((task) => task.status === value)}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;