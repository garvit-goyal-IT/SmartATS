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

import CompareCandidates from "./pages/candidates/CompareCandidates.jsx"


// premium
import PremiumGate from "./components/UI/PremiumGate.jsx"
import PremiumDashboard from "./pages/premium/PremiumDashboard.jsx"
import PremiumLanding from "./pages/premium/premiumLanding.jsx"
import PremiumLogin from "./pages/premium/PremiumLogin.jsx"
import ResumeAnalysis from "./pages/premium/resumeAnalysis.jsx"
import AiMatch from "./pages/premium/AiMatch.jsx"
import PremiumLayout from "./components/layout/PremiumLayout.jsx"

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

const PremiumRoute = () => {
    const { user, loading } = useAuth()
    if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#606060", background: "#0a0a0a" }}>Loading...</div>
    return user ? <Outlet /> : <Navigate to="/premium/login" replace />;
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
                        <Route path="compare" element={<CompareCandidates />} />
                        <Route path="bulk upload" element={<PremiumGate feature="Bulk Resume Upload" />} />
                    </Route>
                    <Route path="/premium" element={<PremiumLanding/>}/>
                    <Route path="/premium/login" element={<PremiumLogin />} />
                    <Route element={<PremiumRoute />}>
                        <Route path="/premium/app" element={<PremiumLayout />}>
                             <Route index path="" element={<PremiumDashboard />} />
                             <Route path="resume-analysis" element={<ResumeAnalysis />} />
                             <Route path="ai-matching" element={<AiMatch />} />
                         </Route>    
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App