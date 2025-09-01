import { useEffect, useState } from 'react'
import { getToken } from '../lib/userAuth'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import dayjs from 'dayjs'

const API = 'http://localhost:3000/api'

const weekdays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']

const AttendanceModal = ({ onClose, assignmentId, students }) => {
    const [timetable, setTimetable] = useState([])
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedPeriodId, setSelectedPeriodId] = useState('')
    const [attendanceMap, setAttendanceMap] = useState({})

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const res = await fetch(`${API}/timetable?assignment_id=${assignmentId}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                })
                const data = await res.json()
                setTimetable(data)
            } catch (err) {
                console.error('Error fetching timetable entries:', err)
            }
        }

        fetchTimetable()
    }, [assignmentId])

    useEffect(() => {
        const fetchExistingAttendances = async () => {
            if (!selectedDate || !selectedPeriodId) return

            try {
                const res = await fetch(`${API}/attendances?assignment_id=${assignmentId}&period_id=${selectedPeriodId}&date=${selectedDate}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                })

                const data = await res.json()

                const map = {}
                data.forEach(a => {
                    map[a.user_id] = { id: a.id, status: a.status }
                })
                setAttendanceMap(map)
            } catch (err) {
                console.error('Error fetching existing attendances:', err)
            }
        }

        fetchExistingAttendances()
    }, [selectedDate, selectedPeriodId, assignmentId])

    const getWeekday = (dateStr) => weekdays[new Date(dateStr).getDay()]
    const periodsForDay = (dateStr) => timetable.filter(p => p.weekday === getWeekday(dateStr))

    const isValidDate = (dateStr) => periodsForDay(dateStr).length > 0

    const handleDateChange = (e) => {
        const date = e.target.value
        setSelectedDate(date)

        const validPeriods = periodsForDay(date)
        setSelectedPeriodId(validPeriods.length === 1 ? validPeriods[0].period_id : '')
    }

    const handleStatusChange = (studentId, status) => {
        setAttendanceMap(prev => {
            const existing = prev[studentId] || {}
            return {
                ...prev,
                [studentId]: { id: existing.id, status }
            }
        })
    }

    const markAll = (status) => {
        const map = {}
        students.forEach(s => {
            const existing = attendanceMap[s.id] || {}
            map[s.id] = { id: existing.id, status }
        })
        setAttendanceMap(map)
    }

    const handleSubmit = async () => {
        for (const student of students) {
            const attendanceEntry = attendanceMap[student.id]

            if (!attendanceEntry || !attendanceEntry.status) continue

            const payload = {
                attendance: {
                    user_id: student.id,
                    assignment_id: assignmentId,
                    period_id: selectedPeriodId,
                    date: selectedDate,
                    status: attendanceEntry.status
                }
            }

            if (attendanceEntry.id) {
                await fetch(`${API}/attendances/${attendanceEntry.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(payload)
                })
            } else {
                await fetch(`${API}/attendances`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(payload)
                })
            }
        }

        onClose()
    }

    return (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow w-full max-w-xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>

                <label className="block mb-1 font-medium">Select Date:</label>
                <DatePicker
                    selected={selectedDate ? new Date(selectedDate) : null}
                    onChange={(date) => {
                        const formatted = dayjs(date).format('YYYY-MM-DD')
                        handleDateChange({ target: { value: formatted } })
                    }}
                    maxDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    className="border p-3 rounded w-full mb-4 text-lg h-14"
                />
                {selectedDate && !isValidDate(selectedDate) && (
                    <p className="text-sm text-red-500 mt-[-12px] mb-4">No scheduled class on this date</p>
                )}

                {selectedDate && isValidDate(selectedDate) && periodsForDay(selectedDate).length > 1 && (
                    <>
                        <label className="block mb-1 font-medium">Select Period:</label>
                        <select
                            value={selectedPeriodId}
                            onChange={(e) => setSelectedPeriodId(e.target.value)}
                            className="border p-2 rounded w-full mb-4">
                            <option value="">—</option>
                            {periodsForDay(selectedDate).map(p => (
                                <option key={p.period_id} value={p.period_id}>{p.period_label}</option>
                            ))}
                        </select>
                    </>
                )}

                {selectedDate && selectedPeriodId && (
                    <>
                        <div className="flex gap-4 mb-4">
                            <button onClick={() => markAll('present')} className="bg-green-600 text-white px-4 py-2 rounded">Mark All Present</button>
                            <button onClick={() => markAll('absent')} className="bg-red-600 text-white px-4 py-2 rounded">Mark All Absent</button>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {students.map(student => (
                                <div key={student.id} className="flex justify-between items-center border rounded p-2">
                                    <span>{student.name}</span>
                                    <select
                                        value={attendanceMap[student.id]?.status || ''}
                                        onChange={(e) => handleStatusChange(student.id, e.target.value)}
                                        className="border p-1 rounded">
                                        <option value="">—</option>
                                        <option value="present">Present</option>
                                        <option value="absent">Absent</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="text-gray-600">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedDate || !selectedPeriodId}
                        className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50">
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AttendanceModal
