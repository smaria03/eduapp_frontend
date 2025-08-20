import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getToken, getUserRole } from '../../lib/userAuth'

const API = 'http://localhost:3000/api'

const WEEKDAYS = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' }
]
const WEEKDAY_TO_NUM = { monday:1, tuesday:2, wednesday:3, thursday:4, friday:5 }

const TimetablePage = () => {
    const router = useRouter()
    const [classes, setClasses] = useState([])
    const [teachers, setTeachers] = useState([])
    const [periods, setPeriods] = useState([])
    const [mode, setMode] = useState('class')
    const [classId, setClassId] = useState()
    const [teacherId, setTeacherId] = useState()
    const [entries, setEntries] = useState([])
    const [assignments, setAssignments] = useState([])
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState('')

    useEffect(() => {
        const role = getUserRole()
        if (role !== 'admin') { router.push('/login'); return }

        const load = async () => {
            try {
                const clsRes = await fetch(`${API}/school_classes`, { headers: { Authorization: `Bearer ${getToken()}` } })
                const cls = await clsRes.json()
                const tchRes = await fetch(`${API}/teachers`, { headers: { Authorization: `Bearer ${getToken()}` } })
                const tch = await tchRes.json()
                const prdRes = await fetch(`${API}/periods`, { headers: { Authorization: `Bearer ${getToken()}` } })
                const prd = await prdRes.json()

                setClasses([...cls].sort((a,b)=>a.name.localeCompare(b.name, undefined, { numeric:true })))
                setTeachers([...tch].sort((a,b)=>a.name.localeCompare(b.name)))
                setPeriods(prd)

                if (!classId && cls.length && mode==='class') setClassId(cls[0].id)
            } catch {
                setErr('Failed to load metadata')
            }
        }
        load()
    }, [router, classId, mode])

    useEffect(() => {
        const load = async () => {
            if (mode !== 'class' || !classId) { setAssignments([]); return }
            try {
                const res = await fetch(`${API}/school_classes/${classId}/subjects`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                })
                const data = await res.json()
                const withTeacher = data
                    .filter(s => s.assignment_id && s.teacher?.id)
                    .sort((a,b) =>
                        (a.name || '').localeCompare(b.name || '') ||
                        (a.teacher.name || '').localeCompare(b.teacher.name || '')
                    )
                setAssignments(withTeacher)
            } catch {
                setAssignments([])
            }
        }
        load()
    }, [mode, classId])

    useEffect(() => {
        const load = async () => {
            if ((mode==='class' && !classId) || (mode==='teacher' && !teacherId)) { setEntries([]); return }
            setLoading(true); setErr('')
            try {
                const url = mode==='class'
                    ? `${API}/timetable?class_id=${classId}`
                    : `${API}/timetable?teacher_id=${teacherId}`

                const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
                const data = await res.json()
                setEntries(data.map(e => ({ ...e, weekday: WEEKDAY_TO_NUM[String(e.weekday).toLowerCase()] })))
            } catch {
                setErr('Failed to load timetable')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [mode, classId, teacherId])

    const reload = async () => {
        const url = mode==='class'
            ? `${API}/timetable?class_id=${classId}`
            : `${API}/timetable?teacher_id=${teacherId}`
        const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
        const data = await res.json()
        setEntries(data.map(e => ({ ...e, weekday: WEEKDAY_TO_NUM[String(e.weekday).toLowerCase()] })))
    }

    const handleAdd = async ({ assignment_id, weekday, period_id }) => {
        const res = await fetch(`${API}/timetable`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ timetable_entry: { assignment_id, weekday, period_id } })
        })

        if (!res.ok) {
            setErr('Cannot add: slot is taken or invalid.')
            return
        }

        await reload()
    }

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API}/timetable/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` }
            })
            if (res.ok) await reload()
        } catch {
            setErr('Failed to delete entry')
        }
    }

    const gridMap = {}
    for (const e of entries) gridMap[`${e.weekday}-${e.period_id}`] = e

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold mb-4">Timetable</h1>

            <div className="flex flex-wrap gap-3 items-end">
                <div className="flex items-center gap-3 border rounded p-2">
                    <label className="flex items-center gap-1">
                        <input type="radio" name="mode" value="class" checked={mode==='class'} onChange={()=>setMode('class')} />
                        By class
                    </label>
                    <label className="flex items-center gap-1">
                        <input type="radio" name="mode" value="teacher" checked={mode==='teacher'} onChange={()=>setMode('teacher')} />
                        By teacher
                    </label>
                </div>

                {mode === 'class' && (
                    <select
                        className="border rounded p-2"
                        value={classId || ''}
                        onChange={e=>setClassId(e.target.value ? Number(e.target.value) : undefined)}>
                        <option value="">Select class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                )}

                {mode === 'teacher' && (
                    <select
                        className="border rounded p-2"
                        value={teacherId || ''}
                        onChange={e=>setTeacherId(e.target.value ? Number(e.target.value) : undefined)}>
                        <option value="">Select teacher</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                )}
            </div>

            {err && <div className="text-red-600">{err}</div>}
            {loading && <div>Loading…</div>}

            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                    <tr className="bg-gray-50">
                        <th className="p-2 border">Period / Day</th>
                        {WEEKDAYS.map(d => <th key={d.value} className="p-2 border text-center">{d.label}</th>)}
                    </tr>
                    </thead>
                    <tbody>
                    {periods.map(p => (
                        <tr key={p.id}>
                            <td className="p-2 border font-medium whitespace-nowrap">{p.label}</td>
                            {WEEKDAYS.map(d => {
                                const e = gridMap[`${d.value}-${p.id}`]
                                return (
                                    <td key={`${d.value}-${p.id}`} className="p-2 border align-top">
                                        {e ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="text-sm">
                                                    <div className="font-semibold">{e.subject_name || '—'}</div>
                                                    <div className="text-gray-600">
                                                        {mode === 'class' ? e.teacher_name || '—' : e.class_name || '—'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <button
                                                        className="text-sm border rounded px-2 py-1 hover:bg-gray-100"
                                                        onClick={() => handleDelete(e.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {mode === 'teacher' ? (
                                                    <div className="text-xs text-gray-400">—</div>
                                                ) : !assignments.length ? (
                                                    <div className="text-xs text-gray-500">No subjects with an assigned teacher.</div>
                                                ) : (
                                                    <select
                                                        className="text-sm border rounded p-1"
                                                        defaultValue=""
                                                        onChange={(ev) => {
                                                            const assignment_id = Number(ev.target.value)
                                                            if (!assignment_id) return
                                                            handleAdd({ assignment_id, weekday: d.value, period_id: p.id })
                                                            ev.target.value = ""
                                                        }}>
                                                        <option value="">Add subject — teacher</option>
                                                        {assignments.map(a => (
                                                            <option key={a.assignment_id} value={a.assignment_id}>
                                                                {a.name} — {a.teacher.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </>
                                        )}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TimetablePage
