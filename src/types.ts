export interface Project {
  _id: string;
  name: string;
  description: string;
  createdDate: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  projectId: string;
  createdDate: string; 
}
