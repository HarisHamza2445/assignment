import client from './client';

export const getTasks = (params) => client.get('/tasks', { params }).then((res) => res.data);

export const getTask = (id) => client.get(`/tasks/${id}`).then((res) => res.data.data);

export const createTask = (payload) => client.post('/tasks', payload).then((res) => res.data);

export const updateTask = (id, payload) => client.put(`/tasks/${id}`, payload).then((res) => res.data);

export const updateTaskStatus = (id, status) =>
  client.put(`/tasks/${id}/status`, { status }).then((res) => res.data);

export const deleteTask = (id) => client.delete(`/tasks/${id}`).then((res) => res.data);

export const exportTasks = (params) =>
  client.get('/tasks/export', { params, responseType: 'blob' }).then((res) => res.data);
