import * as XLSX from 'xlsx-js-style'

/** Default filename for Excel export */
const DEFAULT_FILENAME = 'ExportData.xlsx'

/** Color palette matching design-system tokens (colors.css) */
export const EXCEL_COLORS = {
  primaryHeaderBg: '0a5fe6',
  primaryHeaderText: 'FFFFFF',
  primaryRowBg: 'e6f2ff',
  white: 'FFFFFF',
  textPrimary: '1c1917',
  border: 'd6d3d1',
} as const

/** Normalize API response to an array of row objects for export. */
export function extractExportArray(response: unknown): Record<string, unknown>[] {
  if (Array.isArray(response)) {
    return response as Record<string, unknown>[]
  }
  if (response && typeof response === 'object' && !Array.isArray(response)) {
    const obj = response as Record<string, unknown>
    if (Array.isArray(obj.Data)) return obj.Data as Record<string, unknown>[]
    if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[]
    if (Array.isArray(obj.items)) return obj.items as Record<string, unknown>[]
  }
  return []
}

export interface ExportToExcelOptions {
  /** Filename for the downloaded file (default: ExportData.xlsx) */
  filename?: string
}

/**
 * Export an array of row objects to a styled Excel file and trigger download.
 * Uses primary header and alternating row styles.
 */
export function exportToExcel(
  data: Record<string, unknown>[],
  options: ExportToExcelOptions = {},
): void {
  const filename = options.filename ?? DEFAULT_FILENAME
  const worksheet = XLSX.utils.json_to_sheet(data)
  const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : null

  const thinBorder = {
    style: 'thin' as const,
    color: { rgb: EXCEL_COLORS.border },
  }

  const headerCellStyle = {
    fill: {
      fgColor: { rgb: EXCEL_COLORS.primaryHeaderBg },
      patternType: 'solid' as const,
    },
    font: {
      bold: true,
      color: { rgb: EXCEL_COLORS.primaryHeaderText },
      sz: 11,
      name: 'Calibri',
    },
    alignment: {
      horizontal: 'center' as const,
      vertical: 'center' as const,
      wrapText: false,
    },
    border: {
      top: thinBorder,
      bottom: thinBorder,
      left: thinBorder,
      right: thinBorder,
    },
  }

  const dataCellStyle = (isAlternate: boolean) => ({
    fill: {
      fgColor: {
        rgb: isAlternate ? EXCEL_COLORS.primaryRowBg : EXCEL_COLORS.white,
      },
      patternType: 'solid' as const,
    },
    font: {
      color: { rgb: EXCEL_COLORS.textPrimary },
      sz: 11,
      name: 'Calibri',
    },
    alignment: {
      horizontal: 'left' as const,
      vertical: 'center' as const,
      wrapText: false,
    },
    border: {
      top: thinBorder,
      bottom: thinBorder,
      left: thinBorder,
      right: thinBorder,
    },
  })

  if (range) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r: range.s.r, c })
      if (worksheet[addr] && !(worksheet[addr] as { s?: unknown }).s) {
        ; (worksheet[addr] as { s: typeof headerCellStyle }).s = headerCellStyle
      }
    }
    for (let r = range.s.r + 1; r <= range.e.r; r++) {
      const isAlternate = (r - range.s.r) % 2 === 1
      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r, c })
        if (worksheet[addr] && !(worksheet[addr] as { s?: unknown }).s) {
          ; (worksheet[addr] as { s: ReturnType<typeof dataCellStyle> }).s =
            dataCellStyle(isAlternate)
        }
      }
    }
    const colCount = range.e.c - range.s.c + 1
    worksheet['!cols'] = Array.from({ length: colCount }, () => ({ wch: 18 }))
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, filename)
}
