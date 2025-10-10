import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, TrendingUp, TrendingDown, Award, Users, Heart } from 'lucide-react'
import { AgentMetrics } from '@/data/dataService'

interface AgentLeaderboardProps {
  data: AgentMetrics[]
  limit?: number
}

export function AgentLeaderboard({ data, limit = 10 }: AgentLeaderboardProps) {
  const chartData = data
    .filter(agent => agent.total > 0)
    .slice(0, limit)

  // Calculate team average for comparison
  const teamAvgRating = chartData.length > 0 
    ? chartData.reduce((sum, a) => sum + a.avg_rating, 0) / chartData.length 
    : 0

  // Generate achievement badges
  const getAchievements = (agent: AgentMetrics, rank: number) => {
    const achievements: Array<{ label: string; color: string; icon: any }> = []
    
    if (rank === 0) achievements.push({ label: 'Top Performer', color: 'bg-blue-500', icon: Award })
    if (agent.avg_rating >= 4.9) achievements.push({ label: '5-Star Quality', color: 'bg-yellow-500', icon: Star })
    if (agent.total >= 50) achievements.push({ label: 'Volume Leader', color: 'bg-purple-500', icon: Users })
    if (agent.percent_5_star >= 95) achievements.push({ label: 'Customer Favorite', color: 'bg-pink-500', icon: Heart })
    
    return achievements
  }

  // Calculate trend vs team average
  const getTrend = (agent: AgentMetrics) => {
    const delta = agent.avg_rating - teamAvgRating
    if (delta > 0.2) return { text: `+${delta.toFixed(1)} vs avg`, color: 'text-green-600', icon: TrendingUp }
    if (delta < -0.2) return { text: `${delta.toFixed(1)} vs avg`, color: 'text-red-600', icon: TrendingDown }
    return null
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <p className="text-muted-foreground">No agent data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Medal emojis for top 3
  const getMedal = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Agent Performance</CardTitle>
        <CardDescription>
          Ranked by average rating with {chartData.length} agents
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="space-y-4">
          {chartData.map((agent, index) => {
            const medal = getMedal(index)
            const isTopThree = index < 3

            return (
              <div 
                key={agent.agent_id} 
                className="flex items-center gap-4 rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                {/* Rank with Medal */}
                <div className="flex flex-col items-center gap-1">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                    index === 1 ? 'bg-gray-500/20 text-gray-400' :
                    index === 2 ? 'bg-orange-600/20 text-orange-600' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  {medal && <span className="text-base">{medal}</span>}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={agent.image_url} alt={agent.agent_name} />
                  <AvatarFallback>
                    {agent.agent_name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Agent Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {agent.agent_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {agent.department_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    5-Star Rate: {agent.percent_5_star.toFixed(1)}%
                  </p>
                </div>

                {/* Rating */}
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-bold">{agent.avg_rating.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {agent.total.toLocaleString()} reviews
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
