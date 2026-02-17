'use client'

import { useState, useRef } from 'react'
import { X, Upload, Download, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react'
import { downloadTemplate, parseExcelFile } from '@/lib/excel'

interface BulkUploadModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'events' | 'dishes' | 'expenses'
  onUpload: (data: any[]) => Promise<{ success: boolean; error?: string }>
  validateData: (data: any[]) => { valid: boolean; errors: string[] }
}

export default function BulkUploadModal({
  isOpen,
  onClose,
  type,
  onUpload,
  validateData,
}: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [parsedData, setParsedData] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Check file type
    if (
      !selectedFile.name.endsWith('.xlsx') &&
      !selectedFile.name.endsWith('.xls') &&
      !selectedFile.name.endsWith('.csv')
    ) {
      setValidationErrors(['Please upload a valid Excel file (.xlsx, .xls, or .csv)'])
      return
    }

    setFile(selectedFile)
    setValidationErrors([])
    setUploadStatus('idle')

    // Parse and validate
    try {
      const data = await parseExcelFile(selectedFile)
      setParsedData(data)

      const validation = validateData(data)
      if (!validation.valid) {
        setValidationErrors(validation.errors)
      }
    } catch (error) {
      setValidationErrors(['Failed to parse Excel file. Please check the format.'])
    }
  }

  const handleUpload = async () => {
    if (!file || !parsedData.length || validationErrors.length > 0) return

    setUploading(true)
    try {
      const result = await onUpload(parsedData)
      if (result.success) {
        setUploadStatus('success')
        setTimeout(() => {
          handleClose()
        }, 2000)
      } else {
        setUploadStatus('error')
        setValidationErrors([result.error || 'Upload failed'])
      }
    } catch (error) {
      setUploadStatus('error')
      setValidationErrors(['Upload failed. Please try again.'])
    } finally {
      setUploading(false)
    }
  }

  const handleDownloadTemplate = () => {
    downloadTemplate(type)
  }

  const handleClose = () => {
    setFile(null)
    setParsedData([])
    setValidationErrors([])
    setUploadStatus('idle')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  const getTitle = () => {
    switch (type) {
      case 'events':
        return 'Bulk Upload Events'
      case 'dishes':
        return 'Bulk Upload Dishes'
      case 'expenses':
        return 'Bulk Upload Expenses'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{getTitle()}</h2>
            <p className="text-sm text-slate-500 mt-1">Upload Excel file with multiple entries</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Download Template */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-2">Step 1: Download Template</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Download the Excel template, fill in your data, and upload it back.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
            </div>
          </div>

          {/* Upload File */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3">Step 2: Upload Filled Template</h3>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                file
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload
                className={`w-12 h-12 mx-auto mb-4 ${file ? 'text-emerald-600' : 'text-slate-400'}`}
              />
              {file ? (
                <>
                  <p className="font-semibold text-emerald-900 mb-1">{file.name}</p>
                  <p className="text-sm text-emerald-600">
                    {parsedData.length} rows detected • Click to change file
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-900 mb-1">Click to upload Excel file</p>
                  <p className="text-sm text-slate-500">or drag and drop</p>
                  <p className="text-xs text-slate-400 mt-2">Supports .xlsx, .xls, .csv</p>
                </>
              )}
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-red-900 mb-2">Validation Errors Found</h4>
                  <p className="text-sm text-red-700 mb-3">
                    Please fix the following errors in your Excel file:
                  </p>
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto bg-white rounded-xl p-4 border border-red-200">
                <ul className="space-y-1 text-sm text-red-700">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Success Message */}
          {uploadStatus === 'success' && (
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-emerald-900">Upload Successful!</h4>
                  <p className="text-sm text-emerald-700 mt-1">
                    {parsedData.length} {type} have been uploaded successfully.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-3">Guidelines</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">•</span>
                <span>All required fields must be filled in</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">•</span>
                <span>Use the exact column names from the template</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">•</span>
                <span>Dates should be in YYYY-MM-DD format</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">•</span>
                <span>Numbers should not contain commas or currency symbols</span>
              </li>
              {type === 'events' && (
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span>Event Type: MAIN_EVENT or LOCAL_ORDER</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || validationErrors.length > 0 || uploading || uploadStatus === 'success'}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload {parsedData.length} Items
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
