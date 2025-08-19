import { useEffect, useMemo, useState } from 'react'
import { getToken, getUserRole, getUserId } from '../lib/userAuth'

const API = 'http://localhost:3000/api'

const WEEKDAYS = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' }
]

const SchedulePage = () => {
    const [entries, setEntries] = useState([])
    const [periods, setPeriods] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [role, setRole] = useState('')
    const [className, setClassName] = useState('')

    useEffect(() => {
        const token = getToken()
        const role = getUserRole()
        const userId = getUserId()
        setRole(role)
        if (!token || !userId) return

        const headers = { Authorization: `Bearer ${token}` }

        let timetableUrl = ''
        if (role === 'teacher') {
            timetableUrl = `${API}/timetable?teacher_id=${userId}`
        } else if (role === 'student') {
            timetableUrl = `${API}/timetable?student_id=${userId}`
        } else {
            return
        }

        Promise.all([
            fetch(timetableUrl, { headers }),
            fetch(`${API}/periods`, { headers })
        ])
            .then(async ([tRes, pRes]) => {
                const timetable = await tRes.json()
                const periods = await pRes.json()
                setEntries(timetable)
                setPeriods(periods)

                if (role === 'student'){
                    const first = timetable.find(e => e.class_name)
                    if (first?.class_name) {
                        setClassName(first.class_name)
                    }
                }
            })
            .catch(() => setError('Failed to load timetable'))
            .finally(() => setLoading(false))
    }, [])

    const grouped = useMemo(() => {
        const map = {}
        for (const entry of entries) {
            const key = `${entry.weekday}-${entry.period_id}`
            if (!map[key]) map[key] = []
            map[key].push(entry)
        }
        return map
    }, [entries])

    const renderCell = (weekday, periodId) => {
        const items = grouped[`${weekday}-${periodId}`] || []
        if (items.length === 0) return <div className="text-gray-400 italic">—</div>
        return (
            <div className="text-sm">
                {items.map(item => (
                    <div key={item.id}>
                        {role === 'student'
                            ? `${item.subject_name} — ${item.teacher_name ?? 'Unknown'}`
                            : `${item.subject_name} — ${item.class_name}`}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">
                My Schedule {role === 'student' && className && (
                <span className="text-gray-600 text-lg ml-2">(Class: {className})</span>
            )}
            </h1>
            {loading ? (
                <p>Loading…</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <div className="overflow-x-auto border rounded">
                    <table className="min-w-full table-auto border-collapse">
                        <thead>
                        <tr>
                            <th className="p-2 border text-left">Period</th>
                            {WEEKDAYS.map(day => (
                                <th key={day.key} className="p-2 border text-left">{day.label}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {periods.map(period => (
                            <tr key={period.id}>
                                <td className="p-2 border font-medium">{period.label}</td>
                                {WEEKDAYS.map(day => (
                                    <td key={`${day.key}-${period.id}`} className="p-2 border align-top">
                                        {renderCell(day.key, period.id)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default SchedulePage
