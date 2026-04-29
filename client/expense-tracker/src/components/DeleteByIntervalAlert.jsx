import React, { useState } from 'react'

function DeleteByIntervalAlert({type = 'expense', onDelete, onCancel}) {
  const [selectedInterval, setSelectedInterval] = useState('day')
  const [loading, setLoading] = useState(false)

  const intervals = [
    { value: 'day', label: 'Past Day (24 hours)', description: 'Delete records from the last 24 hours' },
    { value: 'month', label: 'Past Month (30 days)', description: 'Delete records from the last 30 days' },
    { value: 'all', label: 'All Time', description: 'Delete ALL records (Cannot be undone!)' }
  ]

  const handleDelete = async () => {
    setLoading(true)
    try {
      await onDelete(selectedInterval)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setLoading(false)
    }
  }

  const typeLabel = type === 'expense' ? 'Expenses' : 'Income'
  const isAllTime = selectedInterval === 'all'

  return (
    <div className='p-6'>
      <div className='flex items-start gap-3 mb-4'>
        <span className='text-orange-500 flex-shrink-0 mt-1 text-2xl'>⚠️</span>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>Delete {typeLabel}</h3>
          <p className='text-sm text-gray-600 mt-1'>
            Select the time interval for deletion. This action cannot be undone.
          </p>
        </div>
      </div>

      <div className='space-y-3 mb-6'>
        {intervals.map((interval) => (
          <label key={interval.value} className='flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors' style={{borderColor: selectedInterval === interval.value ? '#875CF5' : '#e5e7eb'}}>
            <input
              type='radio'
              name='interval'
              value={interval.value}
              checked={selectedInterval === interval.value}
              onChange={(e) => setSelectedInterval(e.target.value)}
              className='mt-1'
            />
            <div className='flex-1'>
              <p className='font-medium text-gray-900'>{interval.label}</p>
              <p className='text-sm text-gray-600'>{interval.description}</p>
            </div>
          </label>
        ))}
      </div>

      {isAllTime && (
        <div className='mb-6 p-3 bg-red-50 border border-red-200 rounded-lg'>
          <p className='text-sm text-red-800 font-medium'>
            ⚠️ Warning: This will delete ALL {typeLabel.toLowerCase()} records. This cannot be undone!
          </p>
        </div>
      )}

      <div className='flex justify-end gap-3'>
        <button
          type='button'
          className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50'
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type='button'
          className={`px-4 py-2 rounded-lg text-white font-medium ${isAllTime ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'} disabled:opacity-50`}
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  )
}

export default DeleteByIntervalAlert
