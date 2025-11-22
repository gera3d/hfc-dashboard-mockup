'use client'

import AgentDetailContent from '@/components/AgentDetailContent'

interface AgentDetailsModalProps {
  agentId: string | null
  onClose: () => void
}

export default function AgentDetailsModal({ agentId, onClose }: AgentDetailsModalProps) {
  if (!agentId) return null
  return <AgentDetailContent agentId={agentId} onClose={onClose} isModal />
}
