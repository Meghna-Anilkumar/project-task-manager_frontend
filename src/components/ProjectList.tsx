import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProjects } from '../redux/actions/projectActions';
import CreateProjectForm from './CreateProjectForm';
import type { RootState, AppDispatch } from '../redux/store';
import type { Project } from '../types';

const ProjectList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { projects, loading, error } = useSelector((state: RootState) => state.projects);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime())
      ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : 'Unknown Date';
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Projects</h1>
        <CreateProjectForm />
      </div>
      {loading && <p className="text-blue-500">Loading projects...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {Array.isArray(projects) && projects.length === 0 && (
        <p className="text-gray-500">No projects found.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(projects) &&
          projects.map((project: Project) => (
            <div
              key={project._id}
              onClick={() => handleProjectClick(project._id)}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-shadow duration-200"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700">{project.name}</h2>
              <p className="text-gray-500 text-sm sm:text-base mt-2">{project.description}</p>
              <p className="text-gray-400 text-xs mt-2">
                Created: {formatDate(project.createdDate)}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ProjectList;
