import { useEffect, useState } from "react"
import api from "../../api/axios.js"

import { Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function Team() {
    const [users, setUsers] = useState([])
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "hiring_manager" })
    const [error, setError] = useState("")

    const load = async () => {
        const { data } = await api.get("/auth/users")
        setUsers(data.users)
    }
    useEffect(() => { load() }, [])

    const submit = async (e) => {
        e.preventDefault()
        setError("")
        try {
            await api.post("/auth/users", form)
            setForm({ name: "", email: "", password: "", role: "hiring_manager" })
            load()
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
        }
    }

    const { user } = useAuth()
    if (user && user.role !== "admin") return <Navigate to="/" replace />
    return (
        <div>
            <h2>Team</h2>
            <form onSubmit={submit}>
                <input placeholder="Full name" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input type="email" placeholder="Email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <input type="password" placeholder="Temporary password" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="hiring_manager">Hiring Manager</option>
                    <option value="recruiter">Recruiter</option>
                </select>
                <button type="submit">Add member</button>
                {error && <p>{error}</p>}
            </form>

            <ul>
                {users.map((u) => (
                    <li key={u._id}>{u.name} · {u.email} · {u.role}</li>
                ))}
            </ul>
        </div>
    )
}