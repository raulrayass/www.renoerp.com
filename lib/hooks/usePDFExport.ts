import { useCallback, useState } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ExportPDFOptions {
  filename?: string
  title?: string
  columns: string[]
  data: (string | number)[][]
}

export function usePDFExport() {
  const [isExporting, setIsExporting] = useState(false)

  const exportPDF = useCallback(async ({
    filename = 'reporte.pdf',
    title,
    columns,
    data,
  }: ExportPDFOptions) => {
    setIsExporting(true)

    try {
      const doc = new jsPDF()
      
      // Metadata
      doc.setProperties({
        title: title || filename,
        creator: 'RenoERP',
      })

      // Title
      if (title) {
        doc.setFontSize(16)
        doc.text(title, 14, 22)
      }

      // Timestamp
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, 14, title ? 32 : 22)

      // Table
      autoTable(doc, {
        head: [columns],
        body: data,
        startY: title ? 40 : 30,
        theme: 'grid',
        headStyles: {
          fillColor: [29, 184, 84], // Verde primario
          textColor: 255,
          fontStyle: 'bold',
        },
        bodyStyles: {
          textColor: 50,
        },
        alternateRowStyles: {
          fillColor: [240, 242, 245],
        },
        margin: { left: 14, right: 14 },
      })

      // Download
      doc.save(filename)
      setIsExporting(false)
      return true
    } catch (error) {
      console.error('[v0] PDF export error:', error)
      setIsExporting(false)
      return false
    }
  }, [])

  return {
    exportPDF,
    isExporting,
  }
}
