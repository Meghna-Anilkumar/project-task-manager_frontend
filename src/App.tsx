import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { store } from './redux/store';
import ProjectList from './components/ProjectList';
import KanbanBoard from './components/KanbanBoard';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<ProjectList />} />
            <Route path="/project/:projectId" element={<KanbanBoard />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;