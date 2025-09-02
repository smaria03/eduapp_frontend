import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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
        { name: 'Average >= 5', value: above }
    ]
}

export const generatePDF = (report) => {
    const doc = new jsPDF()
    let yOffset = 20

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(`Class Report: ${report.class_name}`, 14, yOffset)

    yOffset += 10

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Students enrolled: ${report.students_count}`, 14, yOffset)
    yOffset += 10

    doc.setDrawColor(200)
    doc.line(14, yOffset, 196, yOffset)
    yOffset += 6

    report.subjects.forEach((subject, i) => {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(`Subject: ${subject.subject}`, 14, yOffset)
        yOffset += 8

        const studentData = subject.grades?.per_student?.map(s => [
            s.name,
            s.average ?? '-'
        ]) || []

        autoTable(doc, {
            head: [['Student', 'Average']],
            body: studentData,
            startY: yOffset,
            styles: { fontSize: 10 },
            theme: 'striped',
            margin: { left: 14, right: 14 },
            headStyles: { fillColor: [79, 70, 229] },
        })

        yOffset = doc.lastAutoTable.finalY + 6

        const pieData = getPieData(subject.grades?.per_student)

        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Grade distribution:', 14, yOffset)
        yOffset += 6

        doc.setFont('helvetica', 'normal')
        pieData.forEach(entry => {
            doc.text(`- ${entry.name}: ${entry.value} students`, 18, yOffset)
            yOffset += 5
        })

        if (subject.grades?.class_average) {
            yOffset += 2
            doc.text(`Class average: ${subject.grades.class_average}`, 14, yOffset)
            yOffset += 6
        }

        if (subject.attendance) {
            doc.setFont('helvetica', 'bold')
            doc.text('Attendance:', 14, yOffset)
            doc.setFont('helvetica', 'normal')
            yOffset += 5
            doc.text(`Present: ${subject.attendance.present}`, 18, yOffset)
            doc.text(`Absent: ${subject.attendance.absent}`, 80, yOffset)
            yOffset += 8
        }

        if (subject.homeworks?.length) {
            doc.setFont('helvetica', 'bold')
            doc.text('Homeworks:', 14, yOffset)
            doc.setFont('helvetica', 'normal')
            yOffset += 5

            const hwData = subject.homeworks.map(hw => [
                hw.title,
                hw.submitted,
                hw.average_grade ?? '-'
            ])

            autoTable(doc, {
                head: [['Title', 'Submitted', 'Avg. Grade']],
                body: hwData,
                startY: yOffset,
                styles: { fontSize: 10 },
                theme: 'grid',
                margin: { left: 14, right: 14 },
                headStyles: { fillColor: [79, 70, 229] },
            })

            yOffset = doc.lastAutoTable.finalY + 6
        }

        if (subject.quizzes?.length) {
            doc.setFont('helvetica', 'bold')
            doc.text('Quizzes:', 14, yOffset)
            doc.setFont('helvetica', 'normal')
            yOffset += 5

            const quizData = subject.quizzes.map(q => [
                q.title,
                q.submitted,
                q.average_score ?? '-'
            ])

            autoTable(doc, {
                head: [['Title', 'Submitted', 'Avg. Score']],
                body: quizData,
                startY: yOffset,
                styles: { fontSize: 10 },
                theme: 'grid',
                margin: { left: 14, right: 14 },
                headStyles: { fillColor: [79, 70, 229] },
            })

            yOffset = doc.lastAutoTable.finalY + 8
        }

        if (i < report.subjects.length - 1) {
            doc.setDrawColor(220)
            doc.line(14, yOffset, 196, yOffset)
            yOffset += 10
        }

        if (yOffset + 50 > 280) {
            doc.addPage()
            yOffset = 20
        }
    })

    doc.save(`${report.class_name}_Report.pdf`)
}
