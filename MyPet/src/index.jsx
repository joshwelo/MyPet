import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './authProvider';
import rotateImage from './assets/mypetlogo.png';

// Spinner component
function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <img
        src={rotateImage}
        alt="Loading..."
        style={{
          width: '100px', // Adjust size as needed
          animation: 'spin 2s linear infinite'
        }}
      />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

// Lazy-loaded components for dynamic imports
const Home = React.lazy(() => import('./Home'));
const SignIn = React.lazy(() => import('./SignIn'));
const Register = React.lazy(() => import('./Register'));
const HomePage = React.lazy(() => import('./pages/HomePage'));
const BlogsPage = React.lazy(() => import('./pages/BlogsPage'));
const CalendarEventsPage = React.lazy(() => import('./pages/CalendarEventsPage'));
const DiagnosePage = React.lazy(() => import('./pages/DiagnosePage'));
const EstablishmentsPage = React.lazy(() => import('./pages/EstablishmentsPage'));
const AiBreed = React.lazy(() => import('./pages/AiBreed'));
const UserPage = React.lazy(() => import('./pages/UserPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const HandlingGuide = React.lazy(() => import('./pages/HandlingGuide'));
const PetProfile = React.lazy(() => import('./pages/PetProfile'));
const About = React.lazy(() => import('./pages/About'));

// Protected route to check if user is verified
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) return <Spinner />;

  if (!currentUser) {
    // If not logged in, redirect to SignIn
    return <Navigate to="/" replace />;
  }

  if (!currentUser.emailVerified) {
    // If logged in but email is not verified, show a message or redirect
    alert("Please check your email verify your account before accessing this page.");
    return <Navigate to="/" replace />;
  }

  return children;
}

// Router configuration
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={
        <Suspense fallback={<Spinner />}>
          <SignIn />
        </Suspense>
      } />
      <Route path="/Register" element={
        <Suspense fallback={<Spinner />}>
          <Register />
        </Suspense>
      } />
      <Route path="/Home" element={
        <ProtectedRoute>
          <Suspense fallback={<Spinner />}>
            <Home />
          </Suspense>
        </ProtectedRoute>
      }>
        <Route index element={
          <Suspense fallback={<Spinner />}>
            <HomePage />
          </Suspense>
        } />
        <Route path="HomePage" element={
          <Suspense fallback={<Spinner />}>
            <HomePage />
          </Suspense>
        } />
        <Route path="BlogsPage" element={
          <Suspense fallback={<Spinner />}>
            <BlogsPage />
          </Suspense>
        } />
        <Route path="CalendarEventsPage" element={
          <Suspense fallback={<Spinner />}>
            <CalendarEventsPage />
          </Suspense>
        } />
        <Route path="DiagnosePage" element={
          <Suspense fallback={<Spinner />}>
            <DiagnosePage />
          </Suspense>
        } />
        <Route path="About" element={
          <Suspense fallback={<Spinner />}>
            <About/>
          </Suspense>
        } />
        <Route path="EstablishmentsPage" element={
          <Suspense fallback={<Spinner />}>
            <EstablishmentsPage />
          </Suspense>
        } />
        <Route path="AiBreed" element={
          <Suspense fallback={<Spinner />}>
            <AiBreed />
          </Suspense>
        } />
        <Route path="UserPage" element={
          <Suspense fallback={<Spinner />}>
            <UserPage />
          </Suspense>
        } />
        <Route path="ProfilePage" element={
          <Suspense fallback={<Spinner />}>
            <ProfilePage />
          </Suspense>
        } />
        <Route path="HandlingGuide/:breed" element={
          <Suspense fallback={<Spinner />}>
            <HandlingGuide />
          </Suspense>
        } />
        <Route path="PetProfile/:petId" element={
          <Suspense fallback={<Spinner />}>
            <PetProfile />
          </Suspense>
        } />
      </Route>
    </>
  )
);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch((err) => {
      console.log("Service Worker registration failed:", err);
    });
}

// App rendering
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
