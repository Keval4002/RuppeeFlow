import React, { useState } from 'react'
import { LuUpload, LuDownload, LuX, LuCheck } from 'react-icons/lu'
import axiosInstance from '../utils/axiosInstance'

function ExcelUpload({ type = 'combined', onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState(null)
  const [showFormatInfo, setShowFormatInfo] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Check file format
      const validFormats = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
      if (!validFormats.includes(selectedFile.type) && !selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setError('Please upload a valid Excel file (.xlsx or .xls)')
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError(null)
      setUploadResult(null)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const endpoint = type === 'combined' ? '/api/v1/bulk/downloadTemplate' :
        type === 'expense' ? '/api/v1/expense/downloadExcel' : '/api/v1/income/downloadExcel'
      const response = await axiosInstance.get(endpoint, { responseType: 'blob' })

      const defaultFileName = type === 'combined'
        ? 'template.xlsx'
        : type === 'expense'
          ? 'expense-template.xlsx'
          : 'income-template.xlsx'

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', defaultFileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      setError('Failed to download template')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    // Frontend validation for Excel file before upload
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const xlsx = await import('xlsx')
        const workbook = xlsx.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const rows = xlsx.utils.sheet_to_json(worksheet)
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i]
          // Validate Amount
          if (row.Amount === undefined || isNaN(row.Amount) || Number(row.Amount) <= 0) {
            setError(`Row ${i + 2}: Amount must be a valid positive number.`)
            return
          }
          // Validate Amount decimals
          if (String(row.Amount).includes('.') && String(row.Amount).split('.')[1].length > 2) {
            setError(`Row ${i + 2}: Amount can have at most 2 decimal places.`)
            return
          }
          // Validate Date — Excel stores dates as numeric serials; use xlsx to parse them
          if (row.Date === undefined || row.Date === null || row.Date === '') {
            setError(`Row ${i + 2}: Date must be a valid date.`)
            return
          }
          let dateValid = false
          if (typeof row.Date === 'number') {
            // Excel serial date — parse via xlsx
            try {
              const parsed = xlsx.SSF.parse_date_code(row.Date)
              dateValid = !!(parsed && parsed.y)
            } catch { dateValid = false }
          } else {
            dateValid = !isNaN(new Date(row.Date).getTime())
          }
          if (!dateValid) {
            setError(`Row ${i + 2}: Date must be a valid date.`)
            return
          }
          // Only Icon column can have emoji/strings, others should not
          for (const key of Object.keys(row)) {
            if (key.toLowerCase().includes('icon')) continue
            if (
              typeof row[key] === 'string' &&
              key !== 'Date' &&
              key !== 'Type' &&
              key !== 'Name' &&
              key !== 'Category' &&
              key !== 'Source'
            ) {
              setError(`Row ${i + 2}: Unexpected string in column ${key}.`)
              return
            }
          }
        }
      } catch (err) {
        setError(`File validation failed: ${err.message || 'Unknown error'}`)
        return
      }

      setLoading(true)
      setError(null)
      setUploadResult(null)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const endpoint = type === 'combined' ? '/api/v1/bulk/uploadExcel' :
          type === 'expense' ? '/api/v1/expense/uploadExcel' : '/api/v1/income/uploadExcel'
        const response = await axiosInstance.post(endpoint, formData)
        setUploadResult(response.data)
        setFile(null)

        // Reset file input
        const fileInput = document.querySelector('input[type="file"]')
        if (fileInput) fileInput.value = ''

        // Call success callback
        if (onSuccess) {
          setTimeout(onSuccess, 1500)
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to upload file')
      } finally {
        setLoading(false)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const getExcelTemplate = () => {
    if (type === 'combined') {
      return {
        columns: ['Name', 'Type', 'Amount', 'Date', 'Icon (optional)'],
        example: [
          { Name: 'Food', Type: 'Expense', Amount: 500, Date: '2024-01-15', Icon: '🍔' },
          { Name: 'Salary', Type: 'Income', Amount: 50000, Date: '2024-01-01', Icon: '💰' },
          { Name: 'Transport', Type: 'Expense', Amount: 200, Date: '2024-01-16', Icon: '🚗' },
          { Name: 'Freelance', Type: 'Income', Amount: 5000, Date: '2024-01-10', Icon: '💻' }
        ]
      }
    } else if (type === 'expense') {
      return {
        columns: ['Category', 'Amount', 'Date', 'Icon (optional)'],
        example: [
          { Category: 'Food', Amount: 500, Date: '2024-01-15', Icon: '🍔' },
          { Category: 'Transport', Amount: 200, Date: '2024-01-16', Icon: '🚗' }
        ]
      }
    } else {
      return {
        columns: ['Source', 'Amount', 'Date', 'Icon (optional)'],
        example: [
          { Source: 'Salary', Amount: 50000, Date: '2024-01-01', Icon: '💰' },
          { Source: 'Freelance', Amount: 5000, Date: '2024-01-10', Icon: '💻' }
        ]
      }
    }
  }

  const template = getExcelTemplate()
  const title = type === 'combined' ? 'Import Income & Expenses' :
    type === 'expense' ? 'Import Expenses' : 'Import Income'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      background: 'rgba(0,0,0,0.25)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        position: 'relative', width: '100%', maxWidth: 640,
        margin: '0 16px', maxHeight: '90vh', overflowY: 'auto',
        animation: 'fadeSlideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: 28,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: '1.5px solid #EAEEF5',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column'
        }}>
          {/* Rainbow top stripe */}
          <div style={{
            height: 4,
            background: 'linear-gradient(90deg, #C8F73A, #FFE600, #FF3DAC, #3DBAFF)',
            flexShrink: 0
          }} />

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '1px solid #EAEEF5',
            position: 'sticky', top: 0, background: '#fff', zIndex: 10
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>{title}</h3>

            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#F4F6FA', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#666', fontSize: 14, transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FFE4F5'}
              onMouseLeave={e => e.currentTarget.style.background = '#F4F6FA'}
            >
              <LuX />
            </button>
          </div>

          <div style={{ padding: '24px', overflowY: 'auto' }}>
            {/* Upload Result */}
            {uploadResult && (
              <div style={{
                marginBottom: 24, padding: '16px',
                background: '#F0FBD0', border: '1px solid #C8F73A40', borderRadius: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#C8F73A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111' }}>
                    <LuCheck size={14} />
                  </div>
                  <h3 style={{ fontWeight: 700, color: '#4A6E00', fontSize: 14 }}>{uploadResult.message}</h3>
                </div>
                <p style={{ fontSize: 13, color: '#5A8000' }}>
                  Total rows processed: {uploadResult.totalRows} | Successfully imported: {uploadResult.successCount}
                </p>
                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <div style={{ marginTop: 12, maxHeight: 160, overflowY: 'auto' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#C00080', marginBottom: 8 }}>Issues found:</p>
                    <ul style={{ fontSize: 13, color: '#FF3DAC', listStyle: 'none', padding: 0, margin: 0 }}>
                      {uploadResult.errors.map((err, idx) => (
                        <li key={idx} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                          <span>•</span>
                          <span>{err}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                marginBottom: 24, padding: '14px 16px',
                background: '#FFE4F5', border: '1px solid #FF3DAC40', borderRadius: 20,
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <p style={{ fontSize: 13, color: '#C00080', lineHeight: 1.5, marginTop: 2 }}>{error}</p>
              </div>
            )}

            {/* Format Information */}
            <div style={{
              marginBottom: 24, padding: '16px',
              background: '#F7F8FA', border: '1px solid #EAEEF5', borderRadius: 20,
            }}>
              <button
                onClick={() => setShowFormatInfo(!showFormatInfo)}
                style={{
                  width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontWeight: 700, color: '#111', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>📋</span> Excel File Format Required
                </div>
                <span style={{ fontSize: 14, color: '#888' }}>{showFormatInfo ? '▼' : '▶'}</span>
              </button>

              {showFormatInfo && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontWeight: 700, color: '#555', fontSize: 13, marginBottom: 8 }}>Required Columns:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {template.columns.map((col, idx) => (
                        <span key={idx} style={{
                          background: '#E0F5FF', color: '#005E8A', padding: '4px 12px',
                          borderRadius: 999, fontSize: 12, fontWeight: 600,
                        }}>
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#555', fontSize: 13, marginBottom: 8 }}>Example Data:</p>
                    <div style={{ background: '#fff', border: '1px solid #EAEEF5', borderRadius: 12, overflowX: 'auto' }}>
                      <table style={{ width: '100%', fontSize: 13, textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#F7F8FA', borderBottom: '1px solid #EAEEF5' }}>
                            {template.columns.map((col, idx) => (
                              <th key={idx} style={{ padding: '10px 12px', color: '#111', fontWeight: 700 }}>
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {template.example.map((row, rowIdx) => (
                            <tr key={rowIdx} style={{ borderBottom: '1px solid #EAEEF5' }}>
                              {template.columns.map((col, colIdx) => {
                                const key = col.split(' (')[0]
                                return (
                                  <td key={colIdx} style={{ padding: '10px 12px', color: '#555' }}>
                                    {row[key] || '-'}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div style={{ background: '#FFF9CC', border: '1px solid #FFE600', borderRadius: 16, padding: '12px 16px', marginTop: 16 }}>
                    <p style={{ fontSize: 13, color: '#8A6E00', fontWeight: 700, marginBottom: 8 }}>📝 Notes:</p>
                    <ul style={{ fontSize: 13, color: '#6A5000', margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
                      {type === 'combined' ? (
                        <>
                          <li>Headers must be in the first row exactly as shown above</li>
                          <li>Type column: Enter either "Income" or "Expense"</li>
                          <li>Name/Category field cannot be empty</li>
                          <li>Amount must be a positive number</li>
                          <li>Date format: YYYY-MM-DD or any valid date format</li>
                          <li>Icon column is optional</li>
                        </>
                      ) : (
                        <>
                          <li>Headers must be in the first row exactly as shown above</li>
                          <li>{type === 'expense' ? 'Category' : 'Source'} field cannot be empty</li>
                          <li>Amount must be a positive number</li>
                          <li>Date format: YYYY-MM-DD or any valid date format (e.g., 2024-01-15)</li>
                          <li>Icon column is optional - you can leave it empty</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* File Upload Area */}
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block' }}>
                <div style={{
                  border: '2px dashed #C8F73A', borderRadius: 24, padding: '32px 24px',
                  textAlign: 'center', background: '#F0FBD0', cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#E6F9B0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F0FBD0'}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%', background: '#C8F73A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111',
                    }}>
                      <LuUpload size={24} />
                    </div>
                  </div>
                  <p style={{ color: '#111', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Click to upload or drag and drop</p>
                  <p style={{ color: '#6A7A40', fontSize: 13 }}>.xlsx or .xls files only</p>
                  {file && <p style={{ color: '#4A6E00', fontSize: 14, marginTop: 12, fontWeight: 800 }}>✓ {file.name}</p>}
                </div>
                <input
                  type='file'
                  accept='.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'flex-end',
            padding: '16px 24px 24px', background: '#fff',
            borderTop: '1px solid #EAEEF5',
          }}>
            <button
              onClick={handleDownloadTemplate}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                border: '1.5px solid #EAEEF5', background: '#fff', color: '#555',
                borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F7F8FA'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <LuDownload size={16} />
              Template
            </button>
            <div style={{ flex: 1 }} />
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px', border: '1.5px solid #EAEEF5', background: '#fff', color: '#555',
                borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F7F8FA'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || loading || uploadResult}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px',
                border: 'none', background: (!file || loading || uploadResult) ? '#ddd' : '#C8F73A',
                color: (!file || loading || uploadResult) ? '#888' : '#111',
                borderRadius: 999, fontSize: 13, fontWeight: 800,
                cursor: (!file || loading || uploadResult) ? 'not-allowed' : 'pointer',
                boxShadow: (!file || loading || uploadResult) ? 'none' : '0 4px 16px rgba(200,247,58,0.4)',
                transition: 'transform 0.18s ease',
              }}
              onMouseEnter={e => { if (!file && !loading && !uploadResult) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <LuUpload size={16} />
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExcelUpload
