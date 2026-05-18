/**
 * pdfReport.js
 * Generates downloadable PDF reports using jsPDF + jspdf-autotable
 */

export const generatePDFReport = async (reportData) => {
  // Dynamic import for code-splitting
  const jsPDFModule = await import('jspdf')
  const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default

  // jspdf-autotable attaches itself to jsPDF prototype on import
  await import('jspdf-autotable')

  const {
    algorithm = 'Algorithm',
    inputSize = 0,
    inputType = 'random',
    caseType = 'average',
    executionTime = 0,
    operationCount = 0,
    memoryUsage = 0,
    timeComplexity = 'O(n)',
    spaceComplexity = 'O(1)',
    benchmarkPoints = [],
    comparisonData = [],
    optimizationNotes = []
  } = reportData

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const margin = 18
  let y = margin

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const addLine = () => {
    doc.setDrawColor(34, 197, 94)
    doc.setLineWidth(0.3)
    doc.line(margin, y + 1, W - margin, y + 1)
    y += 5
  }

  const addSection = (title) => {
    y += 5
    doc.setFillColor(13, 20, 36)
    doc.roundedRect(margin - 2, y - 4, W - margin * 2 + 4, 10, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setTextColor(34, 197, 94)
    doc.text(title, margin + 1, y + 2)
    y += 11
  }

  const addLabel = (lbl, val) => {
    doc.setFontSize(9)
    doc.setTextColor(134, 239, 172)
    doc.text(lbl + ':', margin, y)
    doc.setTextColor(220, 230, 240)
    doc.text(String(val), margin + 52, y)
    y += 6
  }

  const checkPageBreak = (needed = 20) => {
    if (y + needed > 280) {
      doc.addPage()
      doc.setFillColor(5, 8, 16)
      doc.rect(0, 0, W, 297, 'F')
      y = 20
    }
  }

  // ── Background ───────────────────────────────────────────────────────────────
  doc.setFillColor(5, 8, 16)
  doc.rect(0, 0, W, 297, 'F')

  // ── Header ───────────────────────────────────────────────────────────────────
  doc.setFillColor(8, 13, 26)
  doc.rect(0, 0, W, 30, 'F')
  doc.setFillColor(34, 197, 94)
  doc.rect(0, 0, 4, 30, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(34, 197, 94)
  doc.text('AlgoLens', margin + 4, 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text('AI-Powered Algorithm Complexity Analyzer', margin + 4, 21)
  doc.text('Generated: ' + new Date().toLocaleString(), W - margin, 21, { align: 'right' })

  y = 40

  // ── Title ────────────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(255, 255, 255)
  doc.text(algorithm + ' — Performance Report', margin, y)
  y += 7
  addLine()

  // ── Config ───────────────────────────────────────────────────────────────────
  addSection('Configuration')
  addLabel('Algorithm', algorithm)
  addLabel('Input Size', Number(inputSize).toLocaleString() + ' elements')
  addLabel('Array Type', inputType.charAt(0).toUpperCase() + inputType.slice(1))
  addLabel('Test Case', caseType.charAt(0).toUpperCase() + caseType.slice(1) + ' Case')

  // ── Performance ──────────────────────────────────────────────────────────────
  checkPageBreak(40)
  addSection('Performance Measurements')
  addLabel('Execution Time', executionTime.toFixed(4) + ' ms')
  addLabel('Operation Count', Number(operationCount).toLocaleString())
  addLabel('Memory (estimated)', (memoryUsage / 1024).toFixed(2) + ' KB')

  // ── Complexity ───────────────────────────────────────────────────────────────
  checkPageBreak(30)
  addSection('Complexity Analysis')
  addLabel('Time Complexity', timeComplexity)
  addLabel('Space Complexity', spaceComplexity)

  // ── Benchmark Table ──────────────────────────────────────────────────────────
  if (benchmarkPoints.length > 0) {
    checkPageBreak(60)
    addSection('Benchmark Data Points')

    doc.autoTable({
      startY: y,
      head: [['Input Size (n)', 'Time (ms)', 'Operations', 'µs / op']],
      body: benchmarkPoints.map(p => [
        Number(p.n).toLocaleString(),
        p.time.toFixed(4),
        Number(p.ops).toLocaleString(),
        p.ops > 0 ? ((p.time / p.ops) * 1000).toFixed(4) : '—'
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [8, 13, 26],
        textColor: [34, 197, 94],
        fontStyle: 'bold',
        lineColor: [34, 197, 94],
        lineWidth: 0.3,
        fontSize: 8
      },
      bodyStyles: {
        fillColor: [5, 8, 16],
        textColor: [200, 210, 220],
        lineColor: [25, 35, 55],
        lineWidth: 0.2,
        fontSize: 8
      },
      alternateRowStyles: { fillColor: [8, 13, 26] },
      margin: { left: margin, right: margin }
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // ── Comparison Table ─────────────────────────────────────────────────────────
  if (comparisonData.length > 0) {
    checkPageBreak(60)
    addSection('Algorithm Comparison')

    doc.autoTable({
      startY: y,
      head: [['Algorithm', 'Time (ms)', 'Operations', 'Time Complexity']],
      body: comparisonData.map(c => [
        c.name,
        c.time.toFixed(4),
        Number(c.ops).toLocaleString(),
        c.timeComplexity
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [8, 13, 26],
        textColor: [34, 197, 94],
        fontStyle: 'bold',
        lineColor: [34, 197, 94],
        lineWidth: 0.3,
        fontSize: 8
      },
      bodyStyles: {
        fillColor: [5, 8, 16],
        textColor: [200, 210, 220],
        lineColor: [25, 35, 55],
        lineWidth: 0.2,
        fontSize: 8
      },
      alternateRowStyles: { fillColor: [8, 13, 26] },
      margin: { left: margin, right: margin }
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // ── Optimization Notes ───────────────────────────────────────────────────────
  if (optimizationNotes.length > 0) {
    checkPageBreak(30)
    addSection('Optimization Suggestions')
    doc.setFont('helvetica', 'normal')
    optimizationNotes.forEach((note, i) => {
      checkPageBreak(14)
      doc.setFontSize(8)
      doc.setTextColor(34, 197, 94)
      doc.text(`${i + 1}.`, margin, y)
      doc.setTextColor(200, 210, 220)
      const lines = doc.splitTextToSize(note, W - margin * 2 - 8)
      doc.text(lines, margin + 6, y)
      y += lines.length * 5 + 3
    })
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFillColor(8, 13, 26)
    doc.rect(0, 285, W, 12, 'F')
    doc.setFontSize(7)
    doc.setTextColor(71, 85, 105)
    doc.text('AlgoLens — Algorithm Complexity Analyzer', margin, 291)
    doc.text(`Page ${i} of ${totalPages}`, W - margin, 291, { align: 'right' })
  }

  doc.save(`AlgoLens_${algorithm.replace(/\s+/g, '_')}_Report.pdf`)
}
