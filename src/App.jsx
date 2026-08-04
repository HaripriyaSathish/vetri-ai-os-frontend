import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './core/auth/AuthContext';
import LandingPage from './core/public/LandingPage';
import ProtectedRoute from './core/auth/ProtectedRoute';
import Login from './core/auth/Login';
import Register from './core/auth/Register';
import ForgotPassword from './core/auth/ForgotPassword';
import ResetPassword from './core/auth/ResetPassword';
import TrainerDashboard from './modules/trainerAI/pages/TrainerDashboard';
import Batches from './modules/trainerAI/pages/Batches';
import LessonPlans from './modules/trainerAI/pages/LessonPlans';
import Attendance from './modules/trainerAI/pages/Attendance';
import Assignments from './modules/trainerAI/pages/Assignments';
import MockInterviews from './modules/trainerAI/pages/MockInterviews';
import StudentProgress from './modules/trainerAI/pages/StudentProgress';
import BatchPerformance from './modules/trainerAI/pages/BatchPerformance';
import Reports from './modules/trainerAI/pages/Reports';
import LoggedOut from './core/auth/LoggedOut';
import Profile from './core/auth/Profile';
import BatchDetail from './modules/trainerAI/pages/BatchDetail';
import Messages from './modules/trainerAI/pages/Messages';
import StudentLayout from './modules/studentAI/components/StudentLayout';
import StudentDashboard from './modules/studentAI/pages/Dashboard';
import StudentAttendance from './modules/studentAI/pages/Attendance';
import StudentDailyTasks from './modules/studentAI/pages/DailyTasks';
import StudentAssignments from './modules/studentAI/pages/Assignments';
import StudentAssessments from './modules/studentAI/pages/Assessments';
import StudentProgressPage from './modules/studentAI/pages/Progress';
import StudentAskTrainer from './modules/studentAI/pages/AskTrainer';
import StudentDirectory from './modules/trainerAI/pages/StudentDirectory';
import StudentProfile from './modules/trainerAI/pages/StudentProfile';
import Enquiries from './modules/trainerAI/pages/Enquiries';
import EnquiryForm from './core/public/EnquiryForm';
import BatchGrouping from './modules/trainerAI/pages/BatchGrouping';
import CreateTrainer from './modules/trainerAI/pages/CreateTrainer';
import TrainerDirectory from './modules/trainerAI/pages/TrainerDirectory';
import TrainerDetail from './modules/trainerAI/pages/TrainerDetail';
import AbsenteesRecordings from './modules/trainerAI/pages/AbsenteesRecordings';
import DropoutTracking from './modules/trainerAI/pages/DropoutTracking';
import StudentRecordings from './modules/studentAI/pages/Recordings';
import Payments from './modules/trainerAI/pages/Payments';
import StudentReports from './modules/studentAI/pages/Reports';

const TRAINER_VIEW_ROLES = ['trainer', 'admin', 'management'];

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/logged-out" element={<LoggedOut />} />
          <Route path="/enquiry" element={<EnquiryForm />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer"
            element={
              <ProtectedRoute allowedRoles={TRAINER_VIEW_ROLES}>
                <TrainerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/batches"
            element={
              <ProtectedRoute allowedRoles={TRAINER_VIEW_ROLES}>
                <Batches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/batches/:id"
            element={
              <ProtectedRoute allowedRoles={TRAINER_VIEW_ROLES}>
                <BatchDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/lesson-plans"
            element={
              <ProtectedRoute allowedRoles={TRAINER_VIEW_ROLES}>
                <LessonPlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/attendance"
            element={
              <ProtectedRoute allowedRoles={TRAINER_VIEW_ROLES}>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/assignments"
            element={
              <ProtectedRoute allowedRoles={TRAINER_VIEW_ROLES}>
                <Assignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/mock-interviews"
            element={
              <ProtectedRoute allowedRoles={TRAINER_VIEW_ROLES}>
                <MockInterviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/student-progress"
            element={
              <ProtectedRoute allowedRoles={TRAINER_VIEW_ROLES}>
                <StudentProgress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/batch-performance"
            element={
              <ProtectedRoute allowedRoles={TRAINER_VIEW_ROLES}>
                <BatchPerformance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/reports"
            element={
              <ProtectedRoute allowedRoles={TRAINER_VIEW_ROLES}>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/messages"
            element={
              <ProtectedRoute allowedRoles={TRAINER_VIEW_ROLES}>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/absentees-recordings"
            element={
              <ProtectedRoute allowedRoles={TRAINER_VIEW_ROLES}>
                <AbsenteesRecordings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/dropout-tracking"
            element={
              <ProtectedRoute allowedRoles={TRAINER_VIEW_ROLES}>
                <DropoutTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/payments"
            element={
              <ProtectedRoute allowedRoles={['admin', 'management']}>
                <Payments />
              </ProtectedRoute>
            }
          />

          {/* Student routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout title="Dashboard">
                <StudentDashboard />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/attendance" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout title="Attendance">
                <StudentAttendance />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/daily-tasks" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout title="Daily Tasks">
                <StudentDailyTasks />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/assignments" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout title="Assignments">
                <StudentAssignments />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/assessments" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout title="Mock Interviews & Assessments">
                <StudentAssessments />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route
            path="/student/progress"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout title="My Progress"><StudentProgressPage /></StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/student/ask-trainer" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout title="Ask Trainer">
                <StudentAskTrainer />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/reports" element={
  <ProtectedRoute allowedRoles={['student']}>
    <StudentLayout title="Reports">
      <StudentReports />
    </StudentLayout>
  </ProtectedRoute>
} />
          <Route
            path="/trainer/students"
            element={
              <ProtectedRoute allowedRoles={['admin', 'management']}>
                <StudentDirectory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/batches/:batchId/students/:studentId"
            element={
              <ProtectedRoute allowedRoles={TRAINER_VIEW_ROLES}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
  path="/trainer/enquiries"
  element={
    <ProtectedRoute allowedRoles={['admin', 'management']}>
      <Enquiries />
    </ProtectedRoute>
  }
/>
<Route
  path="/trainer/batch-grouping"
  element={
    <ProtectedRoute allowedRoles={['admin', 'management']}>
      <BatchGrouping />
    </ProtectedRoute>
  }
/>
<Route
  path="/trainer/create-trainer"
  element={
    <ProtectedRoute allowedRoles={['admin', 'management']}>
      <CreateTrainer />
    </ProtectedRoute>
  }
/>
<Route
  path="/trainer/all-trainers"
  element={
    <ProtectedRoute allowedRoles={['admin', 'management']}>
      <TrainerDirectory />
    </ProtectedRoute>
  }
/>
<Route
  path="/trainer/all-trainers/:trainerId"
  element={
    <ProtectedRoute allowedRoles={['admin', 'management']}>
      <TrainerDetail />
    </ProtectedRoute>
  }
/>
<Route path="/student/recordings" element={
  <ProtectedRoute allowedRoles={['student']}>
    <StudentLayout title="Class Recordings">
      <StudentRecordings />
    </StudentLayout>
  </ProtectedRoute>
} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;