import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
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
import Pipeline from "./pages/Pipeline/Pipeline.jsx"
import Interviews from "./pages/interviews/Interviews"
import PremiumHome from "./pages/premium/premiumHome.jsx"
import ResumeAnalysis from "./pages/premium/resumeAnalysis.jsx"
import AiMatch from "./pages/premium/AiMatch.jsx"

const ProtectedRoute = () => {
    const { user, loading } = useAuth()

    if (loading) return (
        <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "center", minHeight: "100vh",
            color: "#64748b", fontSize: "15px"
        }}>
            Loading...
        </div>
    )
    return user ? <Outlet /> : <Navigate to="/login" replace />;
}

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="jobs" element={<Jobs />} />
                            <Route path="jobs/create" element={<CreateJob />} />
                            <Route path="jobs/:jobId" element={<JobDetail />} />
                            <Route path="candidates" element={<Candidates />} />
                            <Route path="candidates/:id" element={<CandidateDetail />} />
                            <Route path="pipeline" element={<Pipeline />} />
                            <Route path="interviews" element={<Interviews />} />
                        </Route>
                    </Route>
                    <Route path="/premium" element={<PremiumHome />}>
                        <Route index element={<PremiumHome />} />
                    </Route>
                    <Route path="resumeAnalysis" element={<ResumeAnalysis />} />
                    <Route path="aiMatch" element={<AiMatch />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App