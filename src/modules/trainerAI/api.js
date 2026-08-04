import axiosInstance from '../../core/api/axiosInstance';

export const getBatches = () => axiosInstance.get('/trainer/batches/');
export const createBatch = (data) => axiosInstance.post('/trainer/batches/', data);

export const getLessonPlans = (batchId) =>
  axiosInstance.get(`/trainer/lesson-plans/${batchId ? `?batch=${batchId}` : ''}`);
export const createLessonPlan = (data) => axiosInstance.post('/trainer/lesson-plans/', data);
export const generateLessonPlan = (data) => axiosInstance.post('/trainer/ai/generate-lesson-plan/', data);
export const getStudents = () => axiosInstance.get('/core/students/');
export const getAttendance = (batchId, date) =>
  axiosInstance.get(`/trainer/attendance/?batch_id=${batchId}&date=${date}`);
export const markAttendance = (data) => axiosInstance.post('/trainer/attendance/', data);
export const getAssignments = (batchId) =>
  axiosInstance.get(`/trainer/assignments/${batchId ? `?batch_id=${batchId}` : ''}`);
export const createAssignment = (data) => axiosInstance.post('/trainer/assignments/', data);
export const generateAssignment = (data) => axiosInstance.post('/trainer/ai/generate-assignment/', data);

export const getMockQuestions = (batchId) =>
  axiosInstance.get(`/trainer/mock-questions/${batchId ? `?batch_id=${batchId}` : ''}`);
export const createMockQuestion = (data) => axiosInstance.post('/trainer/mock-questions/', data);
export const generateMockQuestions = (data) => axiosInstance.post('/trainer/ai/generate-mock-questions/', data);
export const deleteMockQuestion = (id) => axiosInstance.delete(`/trainer/mock-questions/${id}/`);
export const generateStudentProgress = (data) => axiosInstance.post('/trainer/ai/generate-student-progress/', data);
export const generateBatchPerformance = (data) => axiosInstance.post('/trainer/ai/generate-batch-performance/', data);
export const getReports = (batchId) =>
  axiosInstance.get(`/trainer/reports/${batchId ? `?batch_id=${batchId}` : ''}`);
export const generateReport = (data) => axiosInstance.post('/trainer/ai/generate-report/', data);

export const getBatchStudents = (batchId) => axiosInstance.get(`/trainer/batches/${batchId}/students/`);
export const getBatchTimeline = (batchId) => axiosInstance.get(`/trainer/batches/${batchId}/timeline/`);
export const getBatchDetail = (batchId) => axiosInstance.get(`/trainer/batches/${batchId}/`);
export const updateBatch = (batchId, data) => axiosInstance.patch(`/trainer/batches/${batchId}/`, data);

export const getSubmissionsForBatch = (batchId) => axiosInstance.get(`/trainer/submissions/?batch_id=${batchId}`);
export const getMockEligibility = (batchId) => axiosInstance.get(`/trainer/mock-eligibility/?batch_id=${batchId}`);
export const sendMockInvites = (batchId, interviewDate, windowStart, windowEnd, subject, body, cc) =>
  axiosInstance.post('/trainer/mock-invite/', {
    batch_id: batchId,
    interview_date: interviewDate,
    window_start: windowStart,
    window_end: windowEnd,
    subject,
    body,
    cc,
  });
export const getMockSessions = (batchId) => axiosInstance.get(`/trainer/mock-sessions/?batch_id=${batchId}`);
export const updateMockSession = (id, data) => axiosInstance.patch(`/trainer/mock-sessions/${id}/`, data);

export const getMonthlyAttendance = (batchId, year, month) =>
  axiosInstance.get(`/trainer/batches/${batchId}/monthly-attendance/?year=${year}&month=${month}`);

export const getTrainingLog = (batchId, start, end) =>
  axiosInstance.get(`/trainer/batches/${batchId}/training-log/?start=${start}&end=${end}`);

export const updateSubmission = (id, data) => axiosInstance.patch(`/trainer/submissions/${id}/`, data);
export const createSubmission = (data) => axiosInstance.post('/trainer/submissions/', data);

export const getZoneReport = (batchId, start, end) =>
  axiosInstance.get(`/trainer/batches/${batchId}/zone-report/?start=${start}&end=${end}`);

export const getSchedules = (batchId) => axiosInstance.get(`/trainer/schedules/?batch_id=${batchId}`);
export const createSchedule = (data) => axiosInstance.post('/trainer/schedules/', data);

export const getFullZoneReport = (batchId) => axiosInstance.get(`/trainer/batches/${batchId}/full-zone-report/`);
export const deleteReport = (id) => axiosInstance.delete(`/trainer/reports/${id}/`);

export const uploadMockScores = (batchId, file) => {
  const formData = new FormData();
  formData.append('batch_id', batchId);
  formData.append('file', file);
  return axiosInstance.post('/trainer/mock-sessions/upload-scores/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const bulkEnrollStudents = (batchId, file) => {
  const formData = new FormData();
  formData.append('batch_id', batchId);
  formData.append('file', file);
  return axiosInstance.post('/trainer/bulk-enroll-students/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getUnreadCount = () => axiosInstance.get('/trainer/unread-message-count/');
export const getMessages = (studentId) => axiosInstance.get(`/trainer/messages/?student_id=${studentId}`);
export const sendMessage = (data) => axiosInstance.post('/trainer/messages/', data);
export const markMessagesRead = (studentId) => axiosInstance.post('/trainer/mark-messages-read/', { student_id: studentId });



export const scheduleIndividualInterview = (sessionId, scheduledDatetime, meetingLink) =>
  axiosInstance.post('/trainer/mock-schedule-individual/', {
    session_id: sessionId,
    scheduled_datetime: scheduledDatetime,
    meeting_link: meetingLink,
  });

export const enrollStudent = (data) => axiosInstance.post('/trainer/enroll-student/', data);  
export const getStudentDirectory = () => axiosInstance.get('/core/students/directory/');
export const getStudentProfile = (batchId, studentId) =>
  axiosInstance.get(`/trainer/batches/${batchId}/students/${studentId}/profile/`);

export const getCoursesPublic = () => axiosInstance.get('/admissions/courses/public/');
export const getCourses = () => axiosInstance.get('/admissions/courses/');
export const createCourse = (data) => axiosInstance.post('/admissions/courses/', data);
export const updateCourse = (id, data) => axiosInstance.patch(`/admissions/courses/${id}/`, data);

export const getEnquiries = (params) => axiosInstance.get('/admissions/enquiries/', { params });
export const submitEnquiry = (data) => axiosInstance.post('/admissions/enquiries/submit/', data);
export const updateEnquiryStatus = (id, data) => axiosInstance.patch(`/admissions/enquiries/${id}/status/`, data);

export const getPaymentByEnquiry = (enquiryId) => axiosInstance.get(`/admissions/payments/enquiry/${enquiryId}/`);
export const createPayment = (data) => axiosInstance.post('/admissions/payments/create/', data);
export const markInstallmentPaid = (id) => axiosInstance.patch(`/admissions/installments/${id}/mark-paid/`);

export const suggestUsername = (enquiryId) => axiosInstance.get(`/admissions/enquiries/${enquiryId}/suggest-username/`);
export const createAccount = (data) => axiosInstance.post('/admissions/accounts/create/', data);

export const getUngroupedStudents = () => axiosInstance.get('/admissions/students/ungrouped/');
export const groupIntoBatch = (data) => axiosInstance.post('/admissions/batches/group/', data);
export const getTrainers = () => axiosInstance.get('/core/trainers/');
export const createTrainerAccount = (data) => axiosInstance.post('/core/trainers/create/', data);
export const getTrainerDirectory = () => axiosInstance.get('/core/trainers/directory/');
export const getTrainerDetail = (trainerId) => axiosInstance.get(`/core/trainers/${trainerId}/`);
export const getWelcomeKit = (enquiryId) => axiosInstance.get(`/admissions/welcome-kit/enquiry/${enquiryId}/`);
export const updateWelcomeKit = (id, data) => axiosInstance.patch(`/admissions/welcome-kit/${id}/update/`, data);
export const uploadUserDocument = (userId, docType, file) => {
  const formData = new FormData();
  formData.append('doc_type', docType);
  formData.append('file', file);
  return axiosInstance.post(`/core/users/${userId}/upload-document/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateOfficialEmail = (userId, email) => axiosInstance.patch(`/core/users/${userId}/update-official-email/`, { official_email: email });

export const sendWelcomeEmail = (data) => axiosInstance.post('/trainer/send-welcome-email/', data);
export const notifyTrainer = (data) => axiosInstance.post('/trainer/notify-trainer/', data);

export const getAbsentStudents = (batchId, date) =>
  axiosInstance.get(`/trainer/absent-students/?batch_id=${batchId}&date=${date}`);
export const notifyAbsentStudents = (data) => axiosInstance.post('/trainer/notify-absent-students/', data);

export const getRecordings = (batchId) => axiosInstance.get(`/trainer/recordings/?batch_id=${batchId}`);
export const createRecording = (data) => axiosInstance.post('/trainer/recordings/', data);
export const shareRecording = (recordingId, data) => axiosInstance.post(`/trainer/recordings/${recordingId}/share/`, data);
export const getRecordingStats = (recordingId) => axiosInstance.get(`/trainer/recordings/${recordingId}/stats/`);

export const getBatchEnrollmentStatus = (batchId) => axiosInstance.get(`/trainer/batches/${batchId}/enrollment-status/`);
export const markDiscontinued = (data) => axiosInstance.post('/trainer/mark-discontinued/', data);
export const reactivateStudent = (data) => axiosInstance.post('/trainer/reactivate-student/', data);

export const getPaymentsList = () => axiosInstance.get('/admissions/payments/');
export const downloadInvoice = (enquiryId) =>
  axiosInstance.get(`/admissions/payments/${enquiryId}/invoice/`, { responseType: 'blob' });

export const getEnquiriesWithoutPayment = () => axiosInstance.get('/admissions/payments/pending-setup/');
export const getNewEnquiryCount = () => axiosInstance.get('/admissions/enquiries/new-count/');

export const markEnquiriesSeen = () => axiosInstance.post('/admissions/enquiries/mark-seen/');
export const deletePayment = (paymentId) => axiosInstance.delete(`/admissions/payments/${paymentId}/delete/`);
export const emailZoneReport = (batchId, period) =>
  axiosInstance.post('/trainer/email-zone-report/', { batch_id: batchId, period });

export const deleteBatch = (id) => axiosInstance.delete(`/trainer/batches/${id}/`);