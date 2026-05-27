import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider, useAuth } from "./context/AuthContext.jsx"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import Layout from "./components/layout/Layout.jsx"
import Dashboard from "./pages/dashboard/Dashboard"
import Jobs from "./pages/jobs/Jobs"
import CreateJob from "./pages/jobs/CreateJob"
import JobDetail from "./pages/jobs/JobDetail"
import Candidates from "./pages/candidates/Candidates"
import CandidateDetail from "./pages/candidates/CandidateDetail"
import Pipeline from "./pages/applications/Pipeline"
import Interviews from "./pages/interviews/Interviews"

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth()
    
    if(loading) return (
        <div style={{ 
            display: "flex", alignItems: "center", 
            justifyContent: "center", minHeight: "100vh",
            fontSize: "16px", color: "#64748b"
        }}>
            Loading...
        </div>
    )

    return user ? children : <Navigate to="/login" replace/>
}

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/login"    element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index                      element={<Dashboard />} />
                        <Route path="jobs"                element={<Jobs />} />
                        <Route path="jobs/create"         element={<CreateJob />} />
                        <Route path="jobs/:jobId"         element={<JobDetail />} />
                        <Route path="candidates"          element={<Candidates />} />
                        <Route path="candidates/:id"      element={<CandidateDetail />} />
                        <Route path="pipeline"            element={<Pipeline />} />
                        <Route path="interviews"          element={<Interviews />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App