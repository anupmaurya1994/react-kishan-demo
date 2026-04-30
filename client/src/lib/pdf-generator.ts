import jsPDF from "jspdf";

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
