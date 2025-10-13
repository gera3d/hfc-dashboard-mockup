import { Download } from 'lucide-react'

interface TableContainerProps {
  title: string
  subtitle: string
  children: React.ReactNode
  onExport?: () => void
}

export function TableContainer({ title, subtitle, children, onExport }: TableContainerProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-300 shadow-lg hover:shadow-2xl hover:border-[#0066cc] transition-all duration-300">
      {/* Header */}
      <div className="px-6 py-5 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50/50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">{title}</h3>
            <p className="text-sm text-gray-600 mt-1 font-medium">{subtitle}</p>
          </div>
          {onExport && (
            <button 
              onClick={onExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#0066cc] to-[#0055aa] border-2 border-white/50 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
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
