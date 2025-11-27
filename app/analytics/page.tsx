import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, MousePointerClick, Clock, TrendingUp } from "lucide-react"

export default function AnalyticsPage() {
  const stats = [
    {
      title: "Page Views",
      value: "124,532",
      icon: Eye,
      description: "Total page views this month",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      title: "Bounce Rate",
      value: "42.3%",
      icon: MousePointerClick,
      description: "Average bounce rate",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      title: "Avg Session",
      value: "3m 24s",
      icon: Clock,
      description: "Average session duration",
      gradient: "from-purple-500 to-pink-600",
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      icon: TrendingUp,
      description: "Visitors to customers",
      gradient: "from-emerald-500 to-teal-600",
    },
  ]

  const topPages = [
    { name: "Dashboard", views: 45234, percentage: 100 },
    { name: "Users", views: 32145, percentage: 71 },
    { name: "Analytics", views: 28456, percentage: 63 },
    { name: "Billing", views: 19872, percentage: 44 },
    { name: "Settings", views: 15623, percentage: 35 },
  ]

  const trafficSources = [
    { name: "Direct", count: 52341, percentage: 42, color: "from-indigo-500 to-indigo-600" },
    { name: "Search", count: 38215, percentage: 31, color: "from-blue-500 to-blue-600" },
    { name: "Social", count: 21456, percentage: 17, color: "from-purple-500 to-purple-600" },
    { name: "Referral", count: 12520, percentage: 10, color: "from-pink-500 to-pink-600" },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          View your application analytics and metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300" style={{animationDelay: `${index * 0.1}s`}}>
              <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} opacity-10`}>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Pages */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topPages.map((page) => (
                <div key={page.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{page.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {page.views.toLocaleString()} views
                    </span>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500 shadow-sm"
                      style={{ width: `${page.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {trafficSources.map((source) => (
                <div key={source.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{source.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {source.count.toLocaleString()}
                      </span>
                      <span className="text-sm font-medium">
                        {source.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full bg-gradient-to-r ${source.color} transition-all duration-500 shadow-sm`}
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
