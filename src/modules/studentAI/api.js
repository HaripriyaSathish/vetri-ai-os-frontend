import axiosInstance from '../../core/api/axiosInstance';

export const getDashboard = () => axiosInstance.get('/student/dashboard/');
export const getAttendance = () => axiosInstance.get('/student/attendance/');

export const getAssignments = (category) =>
  axiosInstance.get(`/student/assignments/${category ? `?category=${category}` : ''}`);


export const getAssessments = () => axiosInstance.get('/student/assessments/');
export const getProgress = () => axiosInstance.get('/student/progress/');

export const getMessages = () => axiosInstance.get('/student/messages/');
export const sendMessage = (data) => axiosInstance.post('/student/messages/', data);
export const markMessagesRead = () => axiosInstance.post('/student/messages/mark-read/');

export const getNotifications = () => axiosInstance.get('/student/notifications/');
export const markNotificationRead = (id) => axiosInstance.post(`/student/notifications/${id}/read/`);
export const markAllNotificationsRead = () => axiosInstance.post('/student/notifications/read-all/');

export const getEligibility = () => axiosInstance.get('/student/eligibility/');

export const submitAssignment = (formData) =>
  axiosInstance.post('/student/assignments/submit/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getRecordings = () => axiosInstance.get('/student/recordings/');  
export const downloadZoneReport = (period) =>
  axiosInstance.get(`/student/reports/${period}/download/`, { responseType: 'blob' });