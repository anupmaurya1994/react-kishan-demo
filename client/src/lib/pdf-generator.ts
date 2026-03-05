import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateExamPDF(exam: any) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Safe Fallbacks
    const title = exam.title || "Exam Document";
    const subject = exam.subject || (exam.subjects && Array.isArray(exam.subjects) ? exam.subjects.join(", ") : "") || "Subject";
    const dateStr = exam.date || (exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : "N/A");
    const qCount = exam.questionsCount ?? (Array.isArray(exam.questions) ? exam.questions.length : Array.isArray(exam.questionData) ? exam.questionData.length : typeof exam.questions === 'number' ? exam.questions : 0);

    // Header
    doc.setFontSize(22);
    doc.setTextColor(33, 33, 33);
    doc.text(title, pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(subject, pageWidth / 2, 30, { align: "center" });

    // Metadata Line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, pageWidth - 20, 35);

    doc.setFontSize(10);
    doc.text(`Date: ${dateStr}`, 20, 42);
    doc.text(`Time Limit: ${exam.timeLimit || "N/A"} mins`, pageWidth / 2, 42, { align: "center" });
    doc.text(`Questions: ${qCount}`, pageWidth - 20, 42, { align: "right" });

    doc.line(20, 47, pageWidth - 20, 47);

    // Questions
    let currentY = 60;
    const questions = (Array.isArray(exam.questions) ? exam.questions : exam.questionData) || [];

    questions.forEach((q: any, index: number) => {
        // Check if we need a new page
        if (currentY > 250) {
            doc.addPage();
            currentY = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");

        // Question Header (Q# and Marks)
        const qHeader = `Q${index + 1}. ${q.text}`;
        const splitTitle = doc.splitTextToSize(qHeader, pageWidth - 45);
        doc.text(splitTitle, 20, currentY);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(120, 120, 120);
        doc.text(`[${q.marks} Marks]`, pageWidth - 20, currentY, { align: "right" });

        currentY += (splitTitle.length * 7);

        // Options for MCQ
        if (Array.isArray(q.options) && q.options.length > 0) {
            q.options.forEach((opt: string, optIndex: number) => {
                const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
                doc.setTextColor(60, 60, 60);
                doc.text(`${letter}) ${opt}`, 25, currentY);
                currentY += 7;
            });
        } else {
            // Lines for non-MCQ
            doc.setDrawColor(240, 240, 240);
            for (let i = 0; i < 3; i++) {
                currentY += 8;
                doc.line(25, currentY, pageWidth - 20, currentY);
            }
        }

        currentY += 15; // Space between questions
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
        );
    }

    // Save the PDF
    const filename = `${exam.title.replace(/\s+/g, "_")}_Exam.pdf`;
    doc.save(filename);
}
