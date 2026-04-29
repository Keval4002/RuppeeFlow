import React, { useState } from 'react'
import { LuX, LuFileSpreadsheet } from 'react-icons/lu'
import ExcelUpload from '../ExcelUpload'

function ExcelUploadModal({ type, onClose, onSuccess }) {
  const [selectedType, setSelectedType] = useState(type || 'combined')

  return (
    <ExcelUpload 
      type={selectedType} 
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}

export default ExcelUploadModal
