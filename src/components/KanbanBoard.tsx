import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { fetchTasks, updateTaskStatus } from '../redux/actions/taskActions';
import { fetchProjects } from '../redux/actions/projectActions';
import type { RootState, AppDispatch } from '../redux/store';
import TaskCard from './TaskCard';
import AiSummaryButton from './AiSummaryButton';
import CreateTaskForm from './CreateTaskForm';
import type { Task, Project } from '../types';
import { motion } from 'framer-motion';

interface SortableColumnProps {
  column: string;
  columnId: string;
  tasks: Task[];
}

const SortableColumn = ({ column, columnId, tasks }: SortableColumnProps) => {
  const columnColors = {
    'To Do': {
      gradient: 'from-pink-50 to-pink-100',
      hoverGradient: 'from-pink-100 to-pink-200',
      textColor: 'text-pink-700',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
    },
    'In Progress': {
      gradient: 'from-violet-50 to-violet-100',
      hoverGradient: 'from-violet-100 to-violet-200',
      textColor: 'text-violet-700',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
    },
    Done: {
      gradient: 'from-purple-50 to-purple-100',
      hoverGradient: 'from-purple-100 to-purple-200',
      textColor: 'text-purple-700',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  };

  const colors = columnColors[column as keyof typeof columnColors];

  return (
    <Droppable droppableId={columnId}>
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={`p-5 rounded-2xl w-full sm:w-1/3 min-w-[280px] flex-shrink-0 shadow-xl transition-all duration-300 border-2 ${
            snapshot.isDraggingOver
              ? `bg-gradient-to-b ${colors.hoverGradient} border-${colors.textColor.split('-')[1]}-300 scale-[1.02]`
              : `bg-gradient-to-b ${colors.gradient} border-transparent`
          }`}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className={`p-2 ${colors.iconBg} rounded-xl shadow-md`}>
              {column === 'To Do' && (
                <svg className={`w-5 h-5 ${colors.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              )}
              {column === 'In Progress' && (
                <svg className={`w-5 h-5 ${colors.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              {column === 'Done' && (
                <svg className={`w-5 h-5 ${colors.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-black ${colors.textColor}`}>{column}</h2>
              <p className="text-xs text-gray-500 font-semibold">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="text-gray-400 text-sm bg-white/70 backdrop-blur-sm p-4 rounded-xl border-2 border-dashed border-gray-300 text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="font-medium">No tasks yet</p>
            </div>
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
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const tasksLoading = useSelector((state: RootState) => state.tasks.loading);
  const tasksError = useSelector((state: RootState) => state.tasks.error);
  const project = useSelector((state: RootState) =>
    state.projects.projects.find((p: Project) => p._id === projectId)
  );

  const columns = useMemo(
    () => [
      { display: 'To Do', value: 'todo' },
      { display: 'In Progress', value: 'in-progress' },
      { display: 'Done', value: 'done' },
    ],
    []
  );

  useEffect(() => {
    if (projectId) {
      console.log('Fetching tasks for project:', projectId);
      dispatch(fetchTasks(projectId));
      dispatch(fetchProjects());
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-violet-50 to-purple-100 p-4 sm:p-6 lg:p-8">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-gray-200 hover:border-violet-300 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </motion.button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-gradient-to-br from-pink-500 to-violet-600 rounded-lg shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-pink-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  {project ? project.name : 'Project Board'}
                </h1>
              </div>
              <p className="text-gray-600 text-sm font-medium ml-1">Manage your tasks with drag & drop</p>
            </div>
          </div>

          <div className="flex gap-3">
            {projectId && <CreateTaskForm projectId={projectId} />}
            {projectId && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <AiSummaryButton
                  projectId={projectId}
                  className="bg-gradient-to-r from-pink-500 via-violet-500 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm sm:text-base font-bold shadow-lg hover:shadow-2xl hover:shadow-violet-500/50 transition-all duration-200 flex items-center gap-2"
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {tasksLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-pink-500 border-r-violet-500 absolute top-0 left-0"></div>
            </div>
            <p className="text-gray-600 mt-4 font-bold">Loading tasks...</p>
          </div>
        )}

        {/* Error State */}
        {tasksError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl mb-8 shadow-lg">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-800 font-bold">{tasksError}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && !tasksLoading && !tasksError && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-violet-300 shadow-xl mb-8">
            <div className="p-5 bg-gradient-to-br from-pink-100 to-violet-100 rounded-2xl mb-6">
              <svg className="w-16 h-16 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">No tasks yet</h3>
            <p className="text-gray-500 font-medium">Create your first task to get started with this project</p>
          </div>
        )}

        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex flex-col sm:flex-row gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-violet-300 scrollbar-track-transparent">
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

        {/* Footer Info */}
        {tasks.length > 0 && (
          <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-violet-100 shadow-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full animate-pulse"></div>
                <p className="text-gray-600 font-semibold">
                  Total Tasks: <span className="text-violet-600 font-black">{tasks.length}</span>
                </p>
              </div>
              <p className="text-gray-500 text-xs font-medium">Drag cards to update status</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;