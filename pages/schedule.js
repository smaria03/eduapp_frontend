import { useEffect, useMemo, useState } from 'react'
import { getToken } from '../lib/userAuth'

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

    const getTeacherId = () => {
        try {
            const token = getToken()
            const payload = JSON.parse(atob(token.split('.')[1]))
            return payload.sub || payload.id || payload.user_id
        } catch {
            return null
        }
    }

    useEffect(() => {
        const token = getToken()
        const teacherId = getTeacherId()
        if (!token || !teacherId) return

        const headers = { Authorization: `Bearer ${token}` }

        Promise.all([
            fetch(`${API}/timetable?teacher_id=${teacherId}`, { headers }),
            fetch(`${API}/periods`, { headers })
        ])
            .then(async ([tRes, pRes]) => {
                const timetable = await tRes.json()
                const periods = await pRes.json()
                setEntries(timetable)
                setPeriods(periods)
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
                        {item.subject_name} — {item.class_name}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">My Schedule</h1>
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
