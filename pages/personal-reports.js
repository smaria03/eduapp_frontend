import { useEffect, useState } from 'react'
import {getToken, getUserRole} from '../lib/userAuth'
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'
import { generateStudentPDF } from '../lib/pdfExportStudent'
import { generateStudentExcel } from '../lib/excelExportStudent'
import {useRouter} from "next/router";

const API = 'http://localhost:3000/api'
const COLORS = ['#f87171', '#34d399']

const StudentReportPage = () => {
    const router = useRouter()
    const [report, setReport] = useState(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [selectedSubjects, setSelectedSubjects] = useState({})
    const [exportMenuOpen, setExportMenuOpen] = useState(false)
    const [exportFormat, setExportFormat] = useState('pdf')

    useEffect(() => {
        if (getUserRole() !== 'student') {
            router.replace('/404')
            return
        }

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

    useEffect(() => {
        if (report?.subjects) {
            const initial = {}
            report.subjects.forEach((_, idx) => {
                initial[idx] = true
            })
            setSelectedSubjects(initial)
        }
    }, [report])

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

    const handleExport = () => {
        const filteredSubjects = report.subjects.filter((_, idx) => selectedSubjects[idx])

        const filteredReport = {
            ...report,
            subjects: filteredSubjects
        }

        if (exportFormat === 'pdf') {
            generateStudentPDF(filteredReport)
        } else if (exportFormat === 'excel') {
            generateStudentExcel(filteredReport)
        }

        setExportMenuOpen(false)
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">My Profile</h1>
            <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                Export Report
            </button>

            {exportMenuOpen && (
                <div className="mb-6 p-4 bg-gray-100 border rounded shadow w-full max-w-md">
                    <p className="font-semibold mb-2">Select Subjects</p>
                    <div className="space-y-2 mb-4">
                        {report.subjects.map((subject, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={selectedSubjects[idx]}
                                    onChange={() =>
                                        setSelectedSubjects((prev) => ({
                                            ...prev,
                                            [idx]: !prev[idx]
                                        }))
                                    }
                                />
                                <span>{subject.subject}</span>
                            </div>
                        ))}
                    </div>

                    <p className="font-semibold mb-2">Select Format</p>
                    <div className="flex space-x-4 mb-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="format"
                                value="pdf"
                                checked={exportFormat === 'pdf'}
                                onChange={() => setExportFormat('pdf')}
                            />
                            <span>PDF</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="format"
                                value="excel"
                                checked={exportFormat === 'excel'}
                                onChange={() => setExportFormat('excel')}
                            />
                            <span>Excel</span>
                        </label>
                    </div>

                    <button
                        onClick={handleExport}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
                        Export
                    </button>
                </div>
            )}

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
