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

// Protected route to check if user is verified
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!currentUser) {
    // If not logged in, redirect to SignIn
    return <Navigate to="/" replace />;
  }

  if (!currentUser.emailVerified) {
    // If logged in but email is not verified, show a message or redirect
    alert("Please verify your email before accessing this page.");
    return <Navigate to="/" replace />;
  }

  return children;
}

// Router configuration
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={
        <Suspense fallback={<div>Loading...</div>}>
          <SignIn />
        </Suspense>
      } />
      <Route path="/Register" element={
        <Suspense fallback={<div>Loading...</div>}>
          <Register />
        </Suspense>
      } />
      <Route path="/Home" element={
        <ProtectedRoute>
          <Suspense fallback={<div>Loading...</div>}>
            <Home />
          </Suspense>
        </ProtectedRoute>
      }>
        <Route index element={
          <Suspense fallback={<div>Loading...</div>}>
            <HomePage />
          </Suspense>
        } />
        <Route path="HomePage" element={
          <Suspense fallback={<div>Loading...</div>}>
            <HomePage />
          </Suspense>
        } />
        <Route path="BlogsPage" element={
          <Suspense fallback={<div>Loading...</div>}>
            <BlogsPage />
          </Suspense>
        } />
        <Route path="CalendarEventsPage" element={
          <Suspense fallback={<div>Loading...</div>}>
            <CalendarEventsPage />
          </Suspense>
        } />
        <Route path="DiagnosePage" element={
          <Suspense fallback={<div>Loading...</div>}>
            <DiagnosePage />
          </Suspense>
        } />
        <Route path="EstablishmentsPage" element={
          <Suspense fallback={<div>Loading...</div>}>
            <EstablishmentsPage />
          </Suspense>
        } />
        <Route path="AiBreed" element={
          <Suspense fallback={<div>Loading...</div>}>
            <AiBreed />
          </Suspense>
        } />
        <Route path="UserPage" element={
          <Suspense fallback={<div>Loading...</div>}>
            <UserPage />
          </Suspense>
        } />
        <Route path="ProfilePage" element={
          <Suspense fallback={<div>Loading...</div>}>
            <ProfilePage />
          </Suspense>
        } />
        <Route path="HandlingGuide/:breed" element={
          <Suspense fallback={<div>Loading...</div>}>
            <HandlingGuide />
          </Suspense>
        } />
        <Route path="PetProfile/:petId" element={
          <Suspense fallback={<div>Loading...</div>}>
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
