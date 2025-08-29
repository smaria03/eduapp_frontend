import { useState } from 'react'
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'

const COLORS = ['#f87171', '#34d399']

const ClassReportModal = ({ report, onClose }) => {
    const [openSubjects, setOpenSubjects] = useState({})

    if (!report) return null

    const toggleSubject = (index) => {
        setOpenSubjects((prev) => ({
            ...prev,
            [index]: !prev[index]
        }))
    }

    const getPieData = (perStudent = []) => {
        let below = 0
        let above = 0

        perStudent.forEach((s) => {
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

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-h-[90vh] w-[90vw] overflow-y-auto shadow-xl relative">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
                    onClick={onClose}
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold mb-2">Class Report: {report.class_name}</h2>
                <p className="mb-4 text-gray-600">Students enrolled: {report.students_count}</p>

                {report.subjects.map((subject, index) => (
                    <div key={index} className="mb-6 border rounded-lg shadow-sm">
                        <button
                            onClick={() => toggleSubject(index)}
                            className="w-full text-left px-4 py-3 bg-indigo-100 hover:bg-indigo-200 font-semibold flex justify-between items-center rounded-t-lg"
                        >
                            <span>{subject.subject}</span>
                            <span className="text-sm italic">{openSubjects[index] ? 'Hide' : 'Show'}</span>
                        </button>

                        {openSubjects[index] && (
                            <div className="px-6 py-5 bg-white space-y-6 rounded-b-lg">
                                <div className="border rounded-lg p-4 shadow-sm bg-gray-50">
                                    <p className="font-semibold text-lg mb-2">Grades</p>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <ul className="list-disc ml-5 space-y-1">
                                            {subject.grades?.per_student?.map((entry, idx) => (
                                                <li key={idx} className="text-gray-800">
                                                    {entry.name}: {entry.average ?? '-'}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="h-48 w-full">
                                            <ResponsiveContainer>
                                                <PieChart>
                                                    <Pie
                                                        data={getPieData(subject.grades?.per_student)}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        outerRadius={70}
                                                        label
                                                    >
                                                        {getPieData(subject.grades?.per_student).map((_, i) => (
                                                            <Cell key={i} fill={COLORS[i]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-sm text-gray-700">
                                        <strong>Class Average:</strong> {subject.grades?.class_average ?? '-'}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-4 shadow-sm bg-gray-50">
                                    <p className="font-semibold text-lg mb-2">Attendance</p>
                                    <p>Present: {subject.attendance.present}</p>
                                    <p>Absent: {subject.attendance.absent}</p>
                                </div>

                                <div className="border rounded-lg p-4 shadow-sm bg-gray-50">
                                    <p className="font-semibold text-lg mb-2">Homeworks</p>
                                    <ul className="list-disc ml-5 space-y-1">
                                        {subject.homeworks.map((hw, idx) => (
                                            <li key={idx}>
                                                <strong>{hw.title}</strong> – {hw.submitted} submitted, avg grade: {hw.average_grade ?? '-'}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="border rounded-lg p-4 shadow-sm bg-gray-50">
                                    <p className="font-semibold text-lg mb-2">Quizzes</p>
                                    <ul className="list-disc ml-5 space-y-1">
                                        {subject.quizzes.map((quiz, idx) => (
                                            <li key={idx}>
                                                <strong>{quiz.title}</strong> – {quiz.submitted} submitted, avg score: {quiz.average_score ?? '-'}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ClassReportModal
