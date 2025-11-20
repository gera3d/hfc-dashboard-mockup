'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import AgentDetailContent from '@/components/AgentDetailContent'

interface AgentDetailProps {
  params: Promise<{
    id: string
  }>
}

export default function AgentDetail({ params }: AgentDetailProps) {
  const router = useRouter()
  const { id: agentId } = use(params)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Back Button - Only shown on direct page access */}
      <div className="bg-gradient-to-r from-[#0066cc] via-[#0077dd] to-[#0066cc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
      
      <AgentDetailContent agentId={agentId} isModal={false} />
    </div>
  )
}
