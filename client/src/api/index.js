import api from "./axios"

// ─── Auth ─────────────────────────────────────────────
export const authAPI = {
    login:    (data)        => api.post("/auth/login", data),
    register: (data)        => api.post("/auth/register", data),
    me:       ()            => api.get("/auth/me"),
    logout:   ()            => api.post("/auth/logout"),
}

// ─── Jobs ─────────────────────────────────────────────
export const jobsAPI = {
    getAll:       (params)  => api.get("/jobs", { params }),
    getById:      (id)      => api.get(`/jobs/${id}`),
    create:       (data)    => api.post("/jobs", data),
    update:       (id, data)=> api.put(`/jobs/${id}`, data),
    delete:       (id)      => api.delete(`/jobs/${id}`),
    toggleStatus: (id, status) => api.patch(`/jobs/${id}/status`, { status }),
}

// ─── Candidates ───────────────────────────────────────
export const candidatesAPI = {
    getAll:   (params)      => api.get("/candidates", { params }),
    getById:  (id)          => api.get(`/candidates/${id}`),
    upload:   (formData)    => api.post("/candidates/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
}

// ─── Applications ─────────────────────────────────────
export const applicationsAPI = {
    create:         (data)  => api.post("/applications", data),
    getByJob:       (jobId) => api.get(`/applications/job/${jobId}`),
    updateStatus:   (id, data) => api.patch(`/applications/${id}/status`, data),
    getShortlist:   (jobId) => api.get(`/applications/job/${jobId}/shortlist`),
}

// ─── Interviews ───────────────────────────────────────
export const interviewsAPI = {
    getAll:   ()            => api.get("/interviews"),
    schedule: (data)        => api.post("/interviews", data),
    update:   (id, data)    => api.patch(`/interviews/${id}`, data),
}

export const aiAPI = {
    generateQuestions:   (applicationId) => api.get(`/applications/${applicationId}/questions`),
    generateJobDesc:     (data)          => api.post(`/jobs/${data.jobId}/generate-description`, data),
}

compare: (data) => api.post("/applications/compare", data)

upload: (formData, jobId) => api.post(`/candidates/upload?jobId=${jobId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
})

getApplications: (candidateId) => api.get(`/applications/candidate/${candidateId}`)