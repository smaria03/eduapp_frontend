import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export const generateStudentExcel = (report) => {
    const wb = XLSX.utils.book_new()
    const sheetData = []

    sheetData.push(['Student Report'])
    sheetData.push([])
    sheetData.push(['Name', report.student_name])
    sheetData.push(['Class', report.class_name])
    sheetData.push(['Overall Average', report.overall_average])
    sheetData.push(['Class Position', report.class_position])
    sheetData.push(['Total Absences', report.total_absences])
    sheetData.push([])

    report.subjects.forEach(subject => {
        sheetData.push([`Subject: ${subject.subject}`])
        sheetData.push(['Average', subject.average ?? '-'])
        sheetData.push(['Absences', subject.absences])
        sheetData.push(['Homeworks', `${subject.homeworks.submitted}/${subject.homeworks.total}`])

        if (subject.quizzes.length) {
            sheetData.push([])
            sheetData.push(['Quiz Title', 'Score'])
            subject.quizzes.forEach(q => {
                sheetData.push([q.quiz_title, q.score])
            })
        }

        sheetData.push([])
    })

    const ws = XLSX.utils.aoa_to_sheet(sheetData)
    XLSX.utils.book_append_sheet(wb, ws, 'Student Report')

    const date = new Date().toISOString().slice(0, 10)
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `Report_${report.student_name}_${date}.xlsx`)
}
