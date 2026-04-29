import React, { useState } from 'react'
import { LuUpload, LuDownload, LuX } from 'react-icons/lu'
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
      const response = await axiosInstance.get(endpoint)
      // The file will be automatically downloaded by the browser
    } catch (err) {
      setError('Failed to download template')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file')
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
      const response = await axiosInstance.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

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
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex justify-between items-center mb-6 sticky top-0 bg-white pb-3 border-b'>
          <h2 className='text-2xl font-bold text-gray-900'>
            {title}
          </h2>
          <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
            <LuX size={24} />
          </button>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <LuCheck className='text-green-600' size={20} />
              <h3 className='font-semibold text-green-900'>{uploadResult.message}</h3>
            </div>
            <p className='text-sm text-green-800'>
              Total rows processed: {uploadResult.totalRows} | Successfully imported: {uploadResult.successCount}
            </p>
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className='mt-3 max-h-40 overflow-y-auto'>
                <p className='text-sm font-semibold text-orange-900 mb-2'>Issues found:</p>
                <ul className='text-sm text-orange-800 space-y-1'>
                  {uploadResult.errors.map((err, idx) => (
                    <li key={idx} className='flex gap-2'>
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
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3'>
            <span className='text-red-600 flex-shrink-0 mt-0.5 text-xl'>⚠️</span>
            <p className='text-sm text-red-800'>{error}</p>
          </div>
        )}

        {/* Format Information */}
        <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
          <button
            onClick={() => setShowFormatInfo(!showFormatInfo)}
            className='w-full text-left flex items-center justify-between font-semibold text-blue-900 hover:text-blue-700'
          >
            <span>📋 Excel File Format Required</span>
            <span className='text-lg'>{showFormatInfo ? '▼' : '▶'}</span>
          </button>
          
          {showFormatInfo && (
            <div className='mt-4 space-y-3'>
              <div>
                <p className='font-semibold text-gray-800 mb-2'>Required Columns:</p>
                <div className='flex flex-wrap gap-2'>
                  {template.columns.map((col, idx) => (
                    <span key={idx} className='bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium'>
                      {col}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className='font-semibold text-gray-800 mb-2'>Example Data:</p>
                <div className='bg-white border border-blue-200 rounded overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='bg-blue-100 border-b'>
                        {template.columns.map((col, idx) => (
                          <th key={idx} className='px-3 py-2 text-left text-gray-700 font-semibold'>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {template.example.map((row, rowIdx) => (
                        <tr key={rowIdx} className='border-b hover:bg-gray-50'>
                          {template.columns.map((col, colIdx) => {
                            const key = col.split(' (')[0]
                            return (
                              <td key={colIdx} className='px-3 py-2 text-gray-700'>
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
              <div className='bg-yellow-50 border border-yellow-200 rounded p-3 mt-3'>
                <p className='text-sm text-yellow-800'>
                  <strong>📝 Notes:</strong>
                  <ul className='list-disc list-inside mt-2 space-y-1'>
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
                </p>
              </div>
            </div>
          )}
        </div>

        {/* File Upload Area */}
        <div className='mb-6'>
          <label className='block mb-3'>
            <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer'>
              <div className='flex justify-center mb-3'>
                <LuUpload className='text-gray-400 text-3xl' />
              </div>
              <p className='text-gray-700 font-medium mb-1'>Click to upload or drag and drop</p>
              <p className='text-gray-500 text-sm'>.xlsx or .xls files only</p>
              {file && <p className='text-green-600 text-sm mt-2 font-semibold'>✓ {file.name}</p>}
            </div>
            <input
              type='file'
              accept='.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
              onChange={handleFileChange}
              className='hidden'
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-3 justify-end sticky bottom-0 bg-white pt-3 border-t'>
          <button
            onClick={handleDownloadTemplate}
            className='flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium'
          >
            <LuDownload size={18} />
            Download Template
          </button>
          <button
            onClick={onClose}
            className='px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium'
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || loading || uploadResult}
            className='flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium'
          >
            <LuUpload size={18} />
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExcelUpload
