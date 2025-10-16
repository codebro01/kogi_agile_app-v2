import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export const exportToExcel = (data, fileName) => {
  // Convert JSON data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data)

  // Create a new workbook
  const workbook = XLSX.utils.book_new()

  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

  // Write workbook to binary array
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

  // Create a Blob and trigger download
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `${fileName}.xlsx`)
}
