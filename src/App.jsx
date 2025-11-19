import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { LoadScript } from '@react-google-maps/api';
import { msalConfig } from './authConfig';

// Import pages/components
import AppDash from './pages/ApprovalsDashboard.jsx';
import ApplicantOnboarding from './pages/ApplicantOnboarding.jsx';
import ApplicantProfile from './pages/RecruiterViewApplicant.jsx';
import ApprovedRequisitions from './pages/ApprovedRequisitions.jsx';
import AuthPage from './pages/AuthorisationPage.jsx';
import CreateOffer from './pages/CreateOffer.jsx';
import Dashboard from './pages/RecruiterDashboard.jsx';
import Database from './pages/ApplicantListing.jsx';
import Details from './pages/JobApplication.jsx';
import Footer from './components/navigation/Footer.jsx';
import JobDetails from './pages/JobDetails.jsx';
import JobListings from './pages/JobListings.jsx';
import JobsUser from './pages/JobsUser.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/SignIn.jsx';
import MyJobApplications from './pages/MyJobApplications.jsx';
import ReportDashboard from './pages/ReportDashboard.jsx';
import Navbar from './components/navigation/NavBar.jsx';
import Notifications from './pages/NotificationsPage.jsx';
import OfferLetter from './pages/OfferLetter.jsx';
import OfferTemplate from './pages/OfferLetterTemplate.jsx';
import Onboarding from './pages/Onboarding.jsx';
import PreScreening from './pages/PreScreening.jsx';
import ProfilePage from './pages/ApplicantProfile.jsx';
import RemReviewPage from './pages/RemReviewPage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import Requisition from './pages/JobRequisition.jsx';
import ResetPasswordPage from './pages/ResetPassword.jsx';
import Review from './pages/ReviewCreatedJob.jsx';
import ReviewAproval from './pages/ReviewApproval.jsx';
import Schedule from './pages/ScheduleInterview.jsx';
import SideBar from './components/navigation/SideBar.jsx';
import SignUpPage from './pages/SignUp.jsx';
import RecruiterNotifications from './pages/RecruiterNotifications.jsx';
import ManageEmployees from './pages/ManageEmployees.jsx';
import OfferReview from './pages/OfferReview.jsx';
import MieProcessingForm from './pages/MIEForm.jsx';

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = '&key=AIzaSyA0F0Wq5mWGpcB6Gbqj2Zl__nmUciUwK4I'; // Replace with actual key

// Layout with global role redirect
const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const noRedirectPaths = ['/', '/signin', '/signup', '/auth'];

  // Redirect to /dashboard if role is null
  useEffect(() => {
    const role = sessionStorage.getItem('role');
    if (!role && !noRedirectPaths.includes(location.pathname)) {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  const isNoLayout = noRedirectPaths.includes(location.pathname);

  if (isNoLayout) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <SideBar />
        <div className="flex-1 p-4">{children}</div>
      </div>
      <Footer />
    </div>
  );
};

const msalInstance = new PublicClientApplication(msalConfig);

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/signin" element={<LoginPage />} />
    <Route path="/signup" element={<SignUpPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/auth" element={<AuthPage />} />

    {/* All other routes */}
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/Database" element={<Database />} />
    <Route path="/approved-requisitions" element={<ApprovedRequisitions />} />
    <Route path="/review-approval/:id" element={<ReviewAproval />} />
    <Route path="/details/:id" element={<Details />} />
    <Route path="/jobListing" element={<JobListings />} />
    <Route path="/Applicantprofile/:id/:jobId" element={<ApplicantProfile />} />
    <Route path="/applications" element={<MyJobApplications />} />
    <Route path="/jobDetail/:id" element={<JobDetails />} />
    <Route path="/schedule/:idApplicant/:id" element={<Schedule />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/prescreening/:id" element={<PreScreening />} />
    <Route path="/jobs" element={<JobsUser />} />
    <Route path="/review/:id" element={<Review />} />
    <Route path="/create-offer/:idApplicant/:id" element={<CreateOffer />} />
    <Route path="/rem-review/:id" element={<RemReviewPage />} />
    <Route path="/offer-letter/:id" element={<OfferLetter />} />
    <Route path="/OfferTemplate/:id" element={<OfferTemplate />} />
    <Route path="/Notifications" element={<Notifications />} />
    <Route path="/onboarding/:id" element={<Onboarding />} />
    <Route path="/requisition" element={<Requisition />} />
    <Route path="/approvaldash" element={<AppDash />} />
    <Route path="/report-dashboard" element={<ReportDashboard />} />
    <Route path="/report" element={<ReportPage />} />
    <Route path="/rec-notifications" element={<RecruiterNotifications />} />
    <Route path="/manage" element={<ManageEmployees />} />
    <Route path="/offer-approve/:id" element={<OfferReview />} />
    <Route path="/applicant-onboard/:applicationId" element={<ApplicantOnboarding />} />
    <Route path="/mie" element={<MieProcessingForm />} />
  </Routes>
);

const App = () => {
  return (
    <MsalProvider instance={msalInstance}>
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
        <BrowserRouter>
          <Layout>
            <AppRoutes />
          </Layout>
        </BrowserRouter>
      </LoadScript>
    </MsalProvider>
  );
};

export default App;
