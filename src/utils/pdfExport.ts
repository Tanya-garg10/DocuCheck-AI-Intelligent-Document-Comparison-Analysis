import { jsPDF } from 'jspdf';
import { ComparisonRecord } from '../types/comparison';

export function exportComparisonPDF(record: ComparisonRecord): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  let cursorY = margin;

  function checkPageBreak(requiredSpace: number) {
    if (cursorY + requiredSpace > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
    }
  }

  // Header Bar
  doc.setFillColor(23, 26, 43); // #171A2B deep navy
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('DocuCheck AI — Intelligent Document Comparison', margin, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${new Date(record.timestamp).toLocaleDateString()} | Model: ${record.aiAnalysis.modelUsed}`, pageWidth - margin, 14, { align: 'right' });

  cursorY = 32;

  // Document Metadata Box
  doc.setDrawColor(233, 234, 241); // #E9EAF1
  doc.setFillColor(248, 249, 252); // #F8F9FC
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(23, 26, 43);
  doc.text('Original Document:', margin + 4, cursorY + 7.5);
  doc.text('Updated Document:', margin + 4, cursorY + 15.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(101, 88, 232); // #6558E8 primary accent
  doc.text(record.originalDocumentName, margin + 42, cursorY + 7.5);
  doc.text(record.updatedDocumentName, margin + 42, cursorY + 15.5);

  cursorY += 28;

  // Quantitative Summary Strip
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(23, 26, 43);
  doc.text('Change Intelligence Summary', margin, cursorY);
  cursorY += 5;

  const colWidth = (pageWidth - margin * 2) / 4;
  const stats = [
    { label: 'Total Changes', val: `${record.statistics.totalChanges}`, color: [23, 26, 43] },
    { label: 'Critical / High', val: `${record.statistics.criticalChanges || 0}`, color: [223, 89, 102] }, // Red
    { label: 'Important', val: `${record.statistics.importantChanges || 0}`, color: [217, 154, 53] }, // Amber
    { label: 'Similarity Score', val: `${record.statistics.similarityScore}%`, color: [21, 150, 107] }, // Green
  ];

  stats.forEach((stat, idx) => {
    const x = margin + idx * colWidth;
    doc.setFillColor(248, 249, 252);
    doc.setDrawColor(233, 234, 241);
    doc.roundedRect(x, cursorY, colWidth - 3, 15, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(119, 125, 145); // #777D91
    doc.text(stat.label, x + 3.5, cursorY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.text(stat.val, x + 3.5, cursorY + 11.5);
  });

  cursorY += 21;

  // Executive Summary Section
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(23, 26, 43);
  doc.text('Executive Summary', margin, cursorY);
  cursorY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(55, 65, 81);
  const summaryLines = doc.splitTextToSize(record.aiAnalysis.executiveSummary, pageWidth - margin * 2);
  doc.text(summaryLines, margin, cursorY);
  cursorY += summaryLines.length * 4.2 + 6;

  // Key Changes with Impact Classifications & Before/After Values
  if (record.aiAnalysis.importantChanges && record.aiAnalysis.importantChanges.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(23, 26, 43);
    doc.text('Key Discrepancies & Classified Changes', margin, cursorY);
    cursorY += 6;

    record.aiAnalysis.importantChanges.forEach((change, idx) => {
      checkPageBreak(22);
      
      // Determine severity color
      let badgeR = 101, badgeG = 88, badgeB = 232;
      if (change.severity === 'Critical') {
        badgeR = 223; badgeG = 89; badgeB = 102;
      } else if (change.severity === 'Important') {
        badgeR = 217; badgeG = 154; badgeB = 53;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(badgeR, badgeG, badgeB);
      const tag = `[${change.severity.toUpperCase()}${change.entityType ? ` · ${change.entityType.toUpperCase()}` : ''}]`;
      doc.text(tag, margin, cursorY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(23, 26, 43);
      doc.text(` ${idx + 1}. ${change.title}`, margin + doc.getTextWidth(tag) + 1, cursorY);
      cursorY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const descLines = doc.splitTextToSize(change.description, pageWidth - margin * 2 - 4);
      doc.text(descLines, margin + 4, cursorY);
      cursorY += descLines.length * 3.8 + 2;

      // Before and After values if available
      if (change.beforeValue || change.afterValue) {
        checkPageBreak(12);
        doc.setFont('courier', 'normal');
        doc.setFontSize(7.5);
        if (change.beforeValue) {
          doc.setTextColor(223, 89, 102);
          doc.text(`  Original (Was): ${change.beforeValue}`, margin + 4, cursorY);
          cursorY += 3.8;
        }
        if (change.afterValue) {
          doc.setTextColor(21, 150, 107);
          doc.text(`  Updated  (Now): ${change.afterValue}`, margin + 4, cursorY);
          cursorY += 3.8;
        }
      }

      // Why it matters
      if (change.whyItMatters) {
        checkPageBreak(10);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.setTextColor(101, 88, 232);
        const whyLines = doc.splitTextToSize(`Why it matters: ${change.whyItMatters}`, pageWidth - margin * 2 - 4);
        doc.text(whyLines, margin + 4, cursorY);
        cursorY += whyLines.length * 3.6 + 3;
      } else {
        cursorY += 2;
      }
    });
  }

  // Missing Information
  if (record.aiAnalysis.missingInformation && record.aiAnalysis.missingInformation.length > 0) {
    checkPageBreak(25);
    cursorY += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(217, 154, 53); // Amber-600
    doc.text('Omitted or Missing Provisions', margin, cursorY);
    cursorY += 6;

    record.aiAnalysis.missingInformation.forEach((missing) => {
      checkPageBreak(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(23, 26, 43);
      doc.text(`* ${missing.field}`, margin, cursorY);
      cursorY += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const missLines = doc.splitTextToSize(`${missing.description} (Impact: ${missing.impact})`, pageWidth - margin * 2 - 4);
      doc.text(missLines, margin + 4, cursorY);
      cursorY += missLines.length * 3.8 + 2.5;
    });
  }

  // Recommendations
  if (record.aiAnalysis.recommendations && record.aiAnalysis.recommendations.length > 0) {
    checkPageBreak(25);
    cursorY += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(101, 88, 232); // Primary indigo
    doc.text('Recommended Actions for Reviewers', margin, cursorY);
    cursorY += 6;

    record.aiAnalysis.recommendations.forEach((rec, idx) => {
      checkPageBreak(12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(23, 26, 43);
      const recLines = doc.splitTextToSize(`${idx + 1}. ${rec}`, pageWidth - margin * 2);
      doc.text(recLines, margin, cursorY);
      cursorY += recLines.length * 3.8 + 2;
    });
  }

  // Footer Disclaimer
  checkPageBreak(15);
  cursorY = Math.max(cursorY + 6, pageHeight - 16);
  doc.setDrawColor(233, 234, 241);
  doc.line(margin, cursorY - 2, pageWidth - margin, cursorY - 2);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(119, 125, 145);
  doc.text(
    'DocuCheck AI Notice: This comparison report is generated using deterministic syntactic diffing and BharatCode AI. All insights are advisory.',
    margin,
    cursorY + 2
  );

  doc.save(`DocuCheck_Report_${record.originalDocumentName.replace(/\.[^/.]+$/, '')}_vs_${record.updatedDocumentName.replace(/\.[^/.]+$/, '')}.pdf`);
}
