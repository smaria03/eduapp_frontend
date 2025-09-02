import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const generateStudentPDF = (report) => {
    const doc = new jsPDF()
    let yOffset = 20

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(`Student Report`, 14, yOffset)

    yOffset += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Name: ${report.student_name}`, 14, yOffset)
    yOffset += 6
    doc.text(`Class: ${report.class_name}`, 14, yOffset)
    yOffset += 6
    doc.text(`Overall Average: ${report.overall_average}`, 14, yOffset)
    yOffset += 6
    doc.text(`Class Position: #${report.class_position}`, 14, yOffset)
    yOffset += 6
    doc.text(`Total Absences: ${report.total_absences}`, 14, yOffset)
    yOffset += 10

    report.subjects.forEach((subject, idx) => {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(13)
        doc.text(`Subject: ${subject.subject}`, 14, yOffset)
        yOffset += 6

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        doc.text(`Average: ${subject.average ?? '-'}`, 14, yOffset)
        yOffset += 5
        doc.text(`Absences: ${subject.absences}`, 14, yOffset)
        yOffset += 5
        doc.text(`Homeworks: ${subject.homeworks.submitted}/${subject.homeworks.total}`, 14, yOffset)
        yOffset += 6

        if (subject.quizzes.length) {
            doc.setFont('helvetica', 'bold')
            doc.text(`Quizzes:`, 14, yOffset)
            yOffset += 5

            const quizData = subject.quizzes.map(q => [q.quiz_title, q.score])
            autoTable(doc, {
                head: [['Quiz Title', 'Score']],
                body: quizData,
                startY: yOffset,
                styles: { fontSize: 10 },
                margin: { left: 14, right: 14 },
                theme: 'grid',
                headStyles: { fillColor: [79, 70, 229] }
            })
            yOffset = doc.lastAutoTable.finalY + 6
        }

        if (yOffset > 270) {
            doc.addPage()
            yOffset = 20
        }
    })

    const date = new Date().toISOString().slice(0, 10)
    doc.save(`Report_${report.student_name}_${date}.pdf`)
}
