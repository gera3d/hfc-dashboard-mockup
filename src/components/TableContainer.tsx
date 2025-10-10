import { Download } from 'lucide-react'

interface TableContainerProps {
  title: string
  subtitle: string
  children: React.ReactNode
  onExport?: () => void
}

export function TableContainer({ title, subtitle, children, onExport }: TableContainerProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          </div>
          {onExport && (
            <button 
              onClick={onExport}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      {children}
    </div>
  )
}
