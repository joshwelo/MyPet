import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Navigate,
} from 'react-router-dom';
import Home from './Home';
import SignIn from './SignIn';
import Register from './Register';
import HomePage from './pages/HomePage';
import BlogsPage from './pages/BlogsPage';
import CalendarEventsPage from './pages/CalendarEventsPage';
import DiagnosePage from './pages/DiagnosePage';
import EstablishmentsPage from './pages/EstablishmentsPage';
import AiBreed from './pages/AiBreed';
import UserPage from './pages/UserPage';
import ProfilePage from './pages/ProfilePage';
import HandlingGuide from './pages/HandlingGuide';
import PetProfile from './pages/PetProfile';
import { AuthProvider, useAuth } from './authProvider';

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

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<SignIn />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/Home" element={<ProtectedRoute><Home /></ProtectedRoute>}>
        <Route index element={<HomePage />} />
        <Route path="HomePage" element={<HomePage />} />
        <Route path="BlogsPage" element={<BlogsPage />} />
        <Route path="CalendarEventsPage" element={<CalendarEventsPage />} />
        <Route path="DiagnosePage" element={<DiagnosePage />} />
        <Route path="EstablishmentsPage" element={<EstablishmentsPage />} />
        <Route path="AiBreed" element={<AiBreed />} />
        <Route path="UserPage" element={<UserPage />} />
        <Route path="ProfilePage" element={<ProfilePage />} />
        <Route path="HandlingGuide/:breed" element={<HandlingGuide />} />
        <Route path="PetProfile/:petId" element={<PetProfile />} /> {/* New Route for PetProfile */}
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
