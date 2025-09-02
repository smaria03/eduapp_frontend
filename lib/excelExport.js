import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export const generateExcel = (report) => {
    const wb = XLSX.utils.book_new()

    report.subjects.forEach(subject => {
        const sheetData = []

        sheetData.push([`Subject: ${subject.subject}`])
        sheetData.push([])

        sheetData.push(['Student', 'Average'])

        const studentRows = subject.grades?.per_student?.map(s => [
            s.name,
            s.average ?? '-'
        ]) || []

        sheetData.push(...studentRows)

        sheetData.push([])

        let below = 0
        let above = 0

        subject.grades?.per_student?.forEach(s => {
            const avg = parseFloat(s.average)
            if (!isNaN(avg)) {
                avg < 5 ? below++ : above++
            }
        })

        sheetData.push(['Grade Distribution'])
        sheetData.push(['Average < 5', below])
        sheetData.push(['Average >= 5', above])
        sheetData.push([])

        if (subject.grades?.class_average) {
            sheetData.push(['Class average', subject.grades.class_average])
            sheetData.push([])
        }

        if (subject.attendance) {
            sheetData.push(['Attendance'])
            sheetData.push(['Present', subject.attendance.present])
            sheetData.push(['Absent', subject.attendance.absent])
            sheetData.push([])
        }

        if (subject.homeworks?.length) {
            sheetData.push(['Homeworks'])
            sheetData.push(['Title', 'Submitted', 'Avg. Grade'])

            subject.homeworks.forEach(hw => {
                sheetData.push([
                    hw.title,
                    hw.submitted,
                    hw.average_grade ?? '-'
                ])
            })

            sheetData.push([])
        }

        if (subject.quizzes?.length) {
            sheetData.push(['Quizzes'])
            sheetData.push(['Title', 'Submitted', 'Avg. Score'])

            subject.quizzes.forEach(q => {
                sheetData.push([
                    q.title,
                    q.submitted,
                    q.average_score ?? '-'
                ])
            })

            sheetData.push([])
        }

        const ws = XLSX.utils.aoa_to_sheet(sheetData)
        XLSX.utils.book_append_sheet(wb, ws, subject.subject.slice(0, 31))
    })

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${report.class_name}_Report.xlsx`)
}
