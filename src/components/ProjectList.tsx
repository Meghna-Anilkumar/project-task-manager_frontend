import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProjects, createProject, updateProject, deleteProject } from '../redux/actions/projectActions';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import CustomModal from './CustomModal'; 
import type { RootState, AppDispatch } from '../redux/store';
import type { Project } from '../types';


const CustomToast = ({ message, type }: { message: string; type: 'success' | 'error' }) => {
  const icons = {
    success: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const styles = {
    success: 'bg-gradient-to-r from-pink-500 to-violet-500 text-white',
    error: 'bg-gradient-to-r from-rose-500 to-red-500 text-white',
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl ${styles[type]} backdrop-blur-sm border border-white/20`}>
      <div className="flex-shrink-0 animate-bounce">
        {icons[type]}
      </div>
      <p className="font-medium text-sm">{message}</p>
    </div>
  );
};

const ProjectList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { projects, loading, error } = useSelector((state: RootState) => state.projects);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [actionMenuProject, setActionMenuProject] = useState<Project | null>(null); 

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleProjectClick = (projectId: string) => {
    if (!actionMenuProject) {
      navigate(`/project/${projectId}`);
    }
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setEditForm({ name: project.name, description: project.description });
    setShowCreateForm(false);
    setActionMenuProject(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      await dispatch(updateProject({ id: editingProject._id, ...editForm })).then((result) => {
        if (updateProject.fulfilled.match(result)) {
          toast.success(<CustomToast message="Project updated successfully!" type="success" />, { 
            autoClose: 3000,
            hideProgressBar: true,
            closeButton: false,
            style: { background: 'transparent', boxShadow: 'none' }
          });
          setEditingProject(null);
          setEditForm({ name: '', description: '' });
        } else if (updateProject.rejected.match(result)) {
          toast.error(<CustomToast message="Failed to update project" type="error" />, { 
            autoClose: 3000,
            hideProgressBar: true,
            closeButton: false,
            style: { background: 'transparent', boxShadow: 'none' }
          });
        }
      });
    }
  };

  const handleDeleteClick = (projectId: string, projectName: string) => {
    Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to delete ${projectName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteProject(projectId)).then((result) => {
          if (deleteProject.fulfilled.match(result)) {
            toast.success(<CustomToast message="Project deleted successfully!" type="success" />, { 
              autoClose: 3000,
              hideProgressBar: true,
              closeButton: false,
              style: { background: 'transparent', boxShadow: 'none' }
            });
          } else if (deleteProject.rejected.match(result)) {
            toast.error(<CustomToast message="Failed to delete project" type="error" />, { 
              autoClose: 3000,
              hideProgressBar: true,
              closeButton: false,
              style: { background: 'transparent', boxShadow: 'none' }
            });
          }
        });
      }
    });
    setActionMenuProject(null); // Close action menu
  };

  const handleCreateSubmit = async (e: React.FormEvent, formData: { name: string; description: string }) => {
    e.preventDefault();
    await dispatch(createProject(formData)).then((result) => {
      if (createProject.fulfilled.match(result)) {
        toast.success(<CustomToast message="Project created successfully!" type="success" />, { 
          autoClose: 3000,
          hideProgressBar: true,
          closeButton: false,
          style: { background: 'transparent', boxShadow: 'none' }
        });
        setShowCreateForm(false);
        setEditForm({ name: '', description: '' });
      } else if (createProject.rejected.match(result)) {
        toast.error(<CustomToast message="Failed to create project" type="error" />, { 
          autoClose: 3000,
          hideProgressBar: true,
          closeButton: false,
          style: { background: 'transparent', boxShadow: 'none' }
        });
      }
    });
  };

  const handleActionMenuToggle = (project: Project) => {
    setActionMenuProject(actionMenuProject?._id === project._id ? null : project);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime())
      ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : 'Unknown Date';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-violet-50 to-purple-100 p-4 sm:p-6 lg:p-8">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header with App Name */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-pink-500 to-violet-600 rounded-xl shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-pink-600 via-violet-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                  ProjectFlow
                </h1>
              </div>
            </div>
            <p className="text-gray-600 text-base ml-1 font-medium">Manage your projects with elegance</p>
          </div>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setEditingProject(null);
              setEditForm({ name: '', description: '' });
              setActionMenuProject(null); // Close any open action menu
            }}
            className="group relative bg-gradient-to-r from-pink-500 via-violet-500 to-purple-600 text-white px-8 py-3.5 rounded-2xl hover:shadow-2xl hover:shadow-violet-500/50 hover:scale-105 transition-all duration-300 font-bold flex items-center gap-2.5 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-violet-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <svg className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="relative z-10">{showCreateForm ? 'Cancel' : 'New Project'}</span>
          </button>
        </div>

        {/* Edit Form */}
        {editingProject && (
          <div className="max-w-lg mx-auto bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl shadow-violet-500/20 border-2 border-violet-100 mb-8 animate-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-pink-100 to-violet-100 rounded-xl">
                <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent">Edit Project</h2>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all duration-200 outline-none"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all duration-200 outline-none resize-none"
                  rows={3}
                  placeholder="Describe your project"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-pink-500 to-violet-600 text-white px-4 py-3 rounded-xl hover:shadow-lg hover:shadow-violet-500/50 hover:scale-105 transition-all duration-300 font-bold"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    setEditForm({ name: '', description: '' });
                  }}
                  className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && !editingProject && (
          <div className="max-w-lg mx-auto bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl shadow-pink-500/20 border-2 border-pink-100 mb-8 animate-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-pink-100 to-violet-100 rounded-xl">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent">Create New Project</h2>
            </div>
            <form
              onSubmit={(e) => handleCreateSubmit(e, { name: editForm.name, description: editForm.description })}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all duration-200 outline-none"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all duration-200 outline-none resize-none"
                  rows={3}
                  placeholder="Describe your project"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-violet-600 text-white px-4 py-3 rounded-xl hover:shadow-lg hover:shadow-pink-500/50 hover:scale-105 transition-all duration-300 font-bold"
              >
                Create Project
              </button>
            </form>
          </div>
        )}

        {/* Action Menu Modal */}
        {actionMenuProject && (
          <CustomModal
            isOpen={!!actionMenuProject}
            onClose={() => setActionMenuProject(null)}
            title="Project Actions"
          >
            <div className="space-y-4">
              <button
                onClick={() => handleEditClick(actionMenuProject)}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-3 rounded-xl hover:shadow-lg hover:shadow-violet-500/50 transition-all duration-300 font-bold flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Project
              </button>
              <button
                onClick={() => handleDeleteClick(actionMenuProject._id, actionMenuProject.name)}
                className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-3 rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 font-bold flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Project
              </button>
            </div>
          </CustomModal>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-pink-200"></div>
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-pink-500 border-r-violet-500 absolute top-0 left-0"></div>
            </div>
            <p className="text-gray-600 mt-6 font-bold text-lg">Loading projects...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl mb-8 shadow-lg">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-bold">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {Array.isArray(projects) && projects.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-violet-300 shadow-xl">
            <div className="p-5 bg-gradient-to-br from-pink-100 to-violet-100 rounded-2xl mb-6">
              <svg className="w-16 h-16 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-8 font-medium">Create your first project to get started</p>
            <button
              onClick={() => {
                setShowCreateForm(true);
                setEditForm({ name: '', description: '' });
              }}
              className="bg-gradient-to-r from-pink-500 to-violet-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl hover:shadow-violet-500/50 hover:scale-105 transition-all duration-300 font-bold"
            >
              Create Your First Project
            </button>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(projects) &&
            projects.map((project: Project) => (
              <div
                key={project._id}
                className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-violet-500/30 transition-all duration-300 relative border-2 border-transparent hover:border-violet-200 hover:-translate-y-2"
              >
                <div
                  onClick={() => handleProjectClick(project._id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-pink-100 via-violet-100 to-purple-100 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    {/* Action Menu Button for Mobile */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionMenuToggle(project);
                      }}
                      className="sm:hidden p-2.5 bg-white rounded-xl shadow-lg text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200"
                      title="Project actions"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                  <h2 className="text-xl font-black text-gray-800 group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-violet-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 mb-3">
                    {project.name}
                  </h2>
                  <p className="text-gray-600 leading-relaxed line-clamp-2 mb-4">{project.description}</p>
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(project.createdDate)}
                  </div>
                </div>
                {/* Desktop Action Buttons */}
                <div className="hidden sm:flex absolute top-4 right-4 gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent navigating to project details
                      handleEditClick(project);
                    }}
                    className="p-2.5 bg-white rounded-xl shadow-lg text-violet-600 hover:text-violet-700 hover:bg-violet-50 hover:scale-110 transition-all duration-200"
                    title="Edit project"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); 
                      handleDeleteClick(project._id, project.name);
                    }}
                    className="p-2.5 bg-white rounded-xl shadow-lg text-red-600 hover:text-red-700 hover:bg-red-50 hover:scale-110 transition-all duration-200"
                    title="Delete project"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectList;