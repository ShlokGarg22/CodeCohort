import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import TerminalSection from "./components/TerminalSection";
import ActiveProblems from "./components/ActiveProblems";
import SignIn from "./components/auth/SignIn";
import SignUp from "./components/auth/SignUp";
import GitHubCallback from "./components/auth/GitHubCallback";
import VersionHistory from "./components/VersionHistory";
import DemoVersionHistory from "./components/DemoVersionHistory";
import Dashboard from "./components/Dashboard";
import CreateProblem from "./components/CreateProblem";
import EditProblem from "./components/EditProblem";
import ProjectBoard from "./components/ProjectBoard";
import ProfilePage from "./components/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import RepositoryDebug from "./debug/RepositoryDebug";
import GitHubRepoTester from "./components/GitHubRepoTester";
import CodeBlockTest from "./components/CodeBlockTest";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { Toaster } from "sonner";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <TerminalSection />
        <ActiveProblems />
      </main>
    </div>
  );
};

const AuthRedirect = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/signin" 
                element={
                  <AuthRedirect>
                    <SignIn />
                  </AuthRedirect>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <AuthRedirect>
                    <SignUp />
                  </AuthRedirect>
                } 
              />
              <Route 
                path="/auth/callback" 
                element={<GitHubCallback />} 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-problem" 
                element={
                  <ProtectedRoute>
                    <CreateProblem />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit-problem/:projectId" 
                element={
                  <ProtectedRoute>
                    <EditProblem />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/test-codeblock" 
                element={<CodeBlockTest />} 
              />
              <Route 
                path="/project/:projectId" 
                element={
                  <ProtectedRoute>
                    <ProjectBoard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/project/:projectId/version-history" 
                element={
                  <ProtectedRoute>
                    <VersionHistory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/demo/version-history" 
                element={<DemoVersionHistory />} 
              />
              <Route 
                path="/test/github" 
                element={<GitHubRepoTester />} 
              />
              <Route 
                path="/debug/repository/:projectId" 
                element={
                  <ProtectedRoute>
                    <RepositoryDebug />
                  </ProtectedRoute>
                } 
              />
              {/* Catch all route - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </SocketProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
