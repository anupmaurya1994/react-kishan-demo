import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/** Internal: builds all PDF content into the given jsPDF instance */
function buildExamPDF(doc: jsPDF, exam: any) {
    const pageWidth = doc.internal.pageSize.getWidth();   // 210mm
    const pageHeight = doc.internal.pageSize.getHeight();  // 297mm

    // ── Margins & Layout Constants ───────────────────────────────────────────
    const ML = 20;                           // left margin
    const MR = 20;                           // right margin (distance from edge)
    const CONTENT_W = pageWidth - ML - MR;   // 170mm usable width

    // For the two-column question layout
    const Q_NUM_X = ML;                   // question number column start
    const Q_TEXT_X = ML + 8;              // question text column start
    const Q_TEXT_W = CONTENT_W - 32;      // 138mm — strict max for question text
    const MARKS_EDGE = pageWidth - MR;       // right edge anchor for marks

    // ── Colors ───────────────────────────────────────────────────────────────
    const BLUE = [59, 130, 246] as [number, number, number];
    const DARK = [30, 41, 59] as [number, number, number];
    const GRAY = [100, 116, 139] as [number, number, number];

    // ── Data ─────────────────────────────────────────────────────────────────
    const title = exam.title || "Examination Paper";
    const difficulty = (exam.difficulty || "Medium");
    const dateStr = exam.createdAt
        ? new Date(exam.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : new Date().toLocaleDateString('en-IN');
    const qCount = exam.questionsCount
        ?? (Array.isArray(exam.questions) ? exam.questions.length
            : Array.isArray(exam.questionData) ? exam.questionData.length : 0);
    const description = exam.description || "";
    const topics = Array.isArray(exam.topics)
        ? exam.topics.join(", ") : (exam.topics || "");
    const timeLimitType = exam?.timeLimitType === 'per-question'
        ? 'per question' : 'overall';
    const timeLimit = exam?.timeLimit ?? exam?.duration ?? 60;
    const totalMarks = Math.round(exam.totalPoints ?? exam.totalMarks ?? qCount);
    const language = exam.language || "English";
    const questions = (Array.isArray(exam.questions) ? exam.questions
        : Array.isArray(exam.questionData) ? exam.questionData : []);

    // ═══════════════════════════════════════════════════════════════════════
    // 1.  HEADER
    // ═══════════════════════════════════════════════════════════════════════

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...DARK);
    doc.text(title, pageWidth / 2, 20, { align: "center" });

    // Metadata row 1 — Difficulty | Language
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text(`Difficulty: ${difficulty}`, ML, 30);
    doc.text(`Language: ${language}`, MARKS_EDGE, 30, { align: "right" });

    // Metadata row 2 — Duration | Total marks
    doc.text(`Duration: ${timeLimit} min (${timeLimitType})`, ML, 36);
    doc.text(`Total marks: ${totalMarks}`, MARKS_EDGE, 36, { align: "right" });

    // Metadata row 3 — Date | Questions count
    doc.text(`Date: ${dateStr}`, ML, 42);
    doc.text(`Total questions: ${qCount}`, MARKS_EDGE, 42, { align: "right" });

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(ML, 47, MARKS_EDGE, 47);

    // ═══════════════════════════════════════════════════════════════════════
    // 2.  DESCRIPTION + TOPICS
    // ═══════════════════════════════════════════════════════════════════════
    let y = 56;

    if (description) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(...BLUE);
        doc.text("Description", ML, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        const descLines = doc.splitTextToSize(description, CONTENT_W);
        doc.text(descLines, ML, y);
        y += descLines.length * 5 + 3;
    }

    if (topics) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...GRAY);
        const topicLines = doc.splitTextToSize(`Topics: ${topics}`, CONTENT_W);
        doc.text(topicLines, ML, y);
        y += topicLines.length * 5 + 6;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 3.  QUESTIONS HEADER
    // ═══════════════════════════════════════════════════════════════════════
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...BLUE);
    doc.text("Questions:", ML, y);
    y += 10;

    // ═══════════════════════════════════════════════════════════════════════
    // 4.  QUESTIONS — strict two-column layout
    // ═══════════════════════════════════════════════════════════════════════
    questions.forEach((q: any, index: number) => {
        const qText = q.text || q.question || "No question text provided";
        const marks = q.marks ?? 1;
        const marksLabel = `(${marks} Marks)`;

        // ── page break ────────────────────────────────────────────────────
        if (y > pageHeight - 50) { doc.addPage(); y = 20; }

        // ── number ───────────────────────────────────────────────────────
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...DARK);
        doc.text(`${index + 1}.`, Q_NUM_X, y);

        // ── question text (strictly bounded — never overlaps marks) ───────
        const qLines = doc.splitTextToSize(qText, Q_TEXT_W);
        doc.text(qLines, Q_TEXT_X, y);

        // ── marks — ALWAYS on the FIRST line, right-aligned ──────────────
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        doc.text(marksLabel, MARKS_EDGE, y, { align: "right" });

        y += qLines.length * 6 + 2;

        // ── options (MCQ) ─────────────────────────────────────────────────
        if (Array.isArray(q.options) && q.options.length > 0) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(...DARK);

            q.options.forEach((opt: string, oi: number) => {
                if (y > pageHeight - 20) { doc.addPage(); y = 20; }
                const letter = String.fromCharCode(65 + oi);
                const optLines = doc.splitTextToSize(`${letter}) ${opt}`, Q_TEXT_W + 8);
                doc.text(optLines, Q_TEXT_X, y);
                y += optLines.length * 6;
            });
        } else {
            // answer lines for subjective
            doc.setDrawColor(200, 200, 200);
            for (let i = 0; i < 3; i++) { y += 7; doc.line(Q_TEXT_X, y, MARKS_EDGE, y); }
        }

        y += 8; // gap between questions
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 5.  FOOTER — every page
    // ═══════════════════════════════════════════════════════════════════════
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(...GRAY);
        doc.text(`Generated by Exam AI on ${dateStr}`, ML, pageHeight - 8);
        doc.text(`Page ${i} of ${pageCount}`, MARKS_EDGE, pageHeight - 8, { align: "right" });
    }
}

/** Public: downloads the PDF immediately */
export function generateExamPDF(exam: any) {
    const doc = new jsPDF();
    buildExamPDF(doc, exam);
    const title = exam.title || "Examination";
    doc.save(`${title.replace(/\s+/g, "_")}_Examination.pdf`);
}

/** Public: builds the PDF and returns an object-URL string for inline preview (remember to revoke it!) */
export function generateExamPDFBlobUrl(exam: any): string {
    const doc = new jsPDF();
    buildExamPDF(doc, exam);
    const blob = doc.output("blob");
    return URL.createObjectURL(blob);
}

/** Public: generates a professional student performance report */
export function generateStudentReportPDF(student: any, profileData: any) {
    if (!student) throw new Error("Student data is missing");
    if (!profileData) throw new Error("Profile data is missing");

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const ML = 20;
    const MR = 20;
    const DARK = [30, 41, 59] as [number, number, number];
    const BLUE = [79, 70, 229] as [number, number, number]; // Indigo-600

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...DARK);
    doc.text("PERFORMANCE REPORT", pageWidth / 2, 25, { align: "center" });
    
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(1.5);
    doc.line(ML, 32, pageWidth - MR, 32);

    // Student Info Section
    doc.setFontSize(14);
    doc.setTextColor(...DARK);
    doc.text("Student Information", ML, 45);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const firstName = student.firstName || student.name?.split(' ')[0] || "N/A";
    const lastName = student.lastName || student.name?.split(' ').slice(1).join(' ') || "";
    doc.text(`Name: ${firstName} ${lastName}`, ML, 55);
    doc.text(`Email: ${student.email || "N/A"}`, ML, 62);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, ML, 69);

    // Stats Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Aggregate Statistics", pageWidth / 2 + 10, 45);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Average Score: ${profileData.avgScore || 0}%`, pageWidth / 2 + 10, 55);
    const rankText = profileData.rank ? `#${profileData.rank}` : "N/A";
    const totalText = profileData.totalStudents ? `/ ${profileData.totalStudents}` : "";
    doc.text(`Global Rank: ${rankText} ${totalText}`, pageWidth / 2 + 10, 62);
    doc.text(`Total Exams Taken: ${profileData.totalExams || 0}`, pageWidth / 2 + 10, 69);

    // Table
    const attempts = profileData.attempts || [];
    const tableData = attempts.length > 0 
        ? attempts.map((a: any) => [
            a.title || "Untitled",
            a.subject || "N/A",
            a.score || 0,
            a.totalMarks || 0,
            `${a.percentage || 0}%`,
            a.date ? new Date(a.date).toLocaleDateString() : "N/A"
        ])
        : [["No exam attempts recorded", "-", "-", "-", "-", "-"]];

    autoTable(doc, {
        startY: 80,
        head: [["Exam Title", "Subject", "Score", "Total", "Percentage", "Date"]],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: BLUE, textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { font: "helvetica", fontSize: 10, cellPadding: 5 },
        alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generated by ExamAI Management System`, ML, doc.internal.pageSize.getHeight() - 10);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - MR, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    }

    doc.save(`ExamAI_Report_${firstName}_${lastName}.pdf`);
}

/** Public: generates a professional teacher report */
export function generateTeacherReportPDF(teacher: any) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const ML = 20;
    const MR = 20;
    const DARK = [30, 41, 59] as [number, number, number];
    const VIOLET = [124, 58, 237] as [number, number, number]; // Violet-600

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...DARK);
    doc.text("TEACHER PROFILE REPORT", pageWidth / 2, 25, { align: "center" });
    
    doc.setDrawColor(124, 58, 237);
    doc.setLineWidth(1.5);
    doc.line(ML, 32, pageWidth - MR, 32);

    // Profile Section
    doc.setFontSize(14);
    doc.setTextColor(...DARK);
    doc.text("Professional Profile", ML, 45);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${teacher.firstName} ${teacher.lastName}`, ML, 55);
    doc.text(`Email: ${teacher.email}`, ML, 62);
    doc.text(`Profession: ${teacher.profession || 'Instructor'}`, ML, 69);
    doc.text(`Institution: ${teacher.college || 'N/A'}`, ML, 76);
    doc.text(`Department/Subject: ${teacher.subject || 'General'}`, ML, 83);
    doc.text(`Location: ${teacher.city || 'N/A'}, ${teacher.state || 'N/A'}`, ML, 90);
    doc.text(`Joined On: ${new Date(teacher.createdAt).toLocaleDateString()}`, ML, 97);

    // Stats Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Activity Statistics", pageWidth / 2 + 10, 45);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Exams Created: ${teacher.totalExams || 0}`, pageWidth / 2 + 10, 55);
    doc.text(`Total Questions Authored: ${teacher.totalQuestions || 0}`, pageWidth / 2 + 10, 62);
    doc.text(`Account Status: Active`, pageWidth / 2 + 10, 69);

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generated by ExamAI Management System`, ML, pageHeight - 10);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, pageWidth - MR, pageHeight - 10, { align: "right" });

    doc.save(`ExamAI_Teacher_Report_${teacher.firstName}_${teacher.lastName}.pdf`);
}
