import client from './client';

export const getEmployees = (params) => client.get('/employees', { params }).then((res) => res.data);

export const getEmployeeOptions = () => client.get('/employees/options').then((res) => res.data.data);

export const getEmployee = (id) => client.get(`/employees/${id}`).then((res) => res.data.data);

export const createEmployee = (payload) => client.post('/employees', payload).then((res) => res.data);

export const updateEmployee = (id, payload) => client.put(`/employees/${id}`, payload).then((res) => res.data);

export const deleteEmployee = (id) => client.delete(`/employees/${id}`).then((res) => res.data);
