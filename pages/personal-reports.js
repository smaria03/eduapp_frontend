import { useEffect, useState } from 'react'
import { getToken } from '../lib/userAuth'
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'

const API = 'http://localhost:3000/api'
const COLORS = ['#f87171', '#34d399']

const StudentReportPage = () => {
    const [report, setReport] = useState(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await fetch(`${API}/student_reports`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                })
                if (!res.ok) throw new Error('Failed to fetch report.')
                const data = await res.json()
                setReport(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchReport()
    }, [])

    const getPieData = (subjects = []) => {
        let below = 0
        let above = 0
        subjects.forEach((s) => {
            const avg = parseFloat(s.average)
            if (!isNaN(avg)) {
                avg < 5 ? below++ : above++
            }
        })

        return [
            { name: 'Average < 5', value: below },
            { name: 'Average ≥ 5', value: above }
        ]
    }

    if (loading) return <p className="p-6">Loading...</p>
    if (error) return <p className="p-6 text-red-600">{error}</p>
    if (!report) return null

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">My Personal Report</h1>

            <p><strong>Name:</strong> {report.student_name}</p>
            <p><strong>Class:</strong> {report.class_name}</p>
            <p><strong>Overall Average:</strong> {report.overall_average}</p>
            <p><strong>Class Position:</strong> #{report.class_position}</p>
            <p className="mb-4"><strong>Total Absences:</strong> {report.total_absences}</p>

            <div className="h-60 mb-8">
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={getPieData(report.subjects)}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={90}
                            label
                        >
                            {getPieData(report.subjects).map((_, i) => (
                                <Cell key={i} fill={COLORS[i]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <h2 className="text-xl font-semibold mb-4">Subjects</h2>

            {report.subjects.map((subject, idx) => (
                <div key={idx} className="mb-6 border rounded-lg shadow p-4 bg-gray-50">
                    <h3 className="text-lg font-bold mb-2">{subject.subject}</h3>
                    <p>Average: <strong>{subject.average ?? '-'}</strong></p>
                    <p>Absences: {subject.absences}</p>
                    <p>Homeworks submitted: {subject.homeworks.submitted}/{subject.homeworks.total}</p>

                    {subject.quizzes.length > 0 && (
                        <div className="mt-2">
                            <p className="font-semibold">Quizzes:</p>
                            <ul className="list-disc ml-5 space-y-1">
                                {subject.quizzes.map((q, i) => (
                                    <li key={i}>{q.quiz_title} – Score: {q.score}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default StudentReportPage
