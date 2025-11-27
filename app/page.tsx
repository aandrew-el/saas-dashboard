"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  TrendingUp,
  UserPlus,
  Settings,
  Bell,
  FileText
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  id: string
  name: string
  email: string
  created_at: string
}

export default function Dashboard() {
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentUsers() {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) {
          console.error("Error fetching users:", error)
        } else {
          setRecentUsers(data || [])
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentUsers()
  }, [])

  // Mock data
  const kpis = [
    {
      title: "Total Users",
      value: "12,345",
      icon: Users,
      description: "+12% from last month",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "Revenue",
      value: "$45,231",
      icon: DollarSign,
      description: "+8% from last month",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      title: "Active Subscriptions",
      value: "8,234",
      icon: CreditCard,
      description: "+5% from last month",
      gradient: "from-purple-500 to-pink-600",
    },
    {
      title: "Growth %",
      value: "+12.5%",
      icon: TrendingUp,
      description: "+2.3% from last month",
      gradient: "from-orange-500 to-red-600",
    },
  ]

  const recentActivity = [
    {
      icon: UserPlus,
      description: "New user registered: Sarah Johnson",
      timestamp: "2 minutes ago",
      color: "bg-indigo-500",
    },
    {
      icon: DollarSign,
      description: "Payment received: $299.00 from Acme Corp",
      timestamp: "15 minutes ago",
      color: "bg-emerald-500",
    },
    {
      icon: CreditCard,
      description: "Pro plan subscription activated",
      timestamp: "1 hour ago",
      color: "bg-purple-500",
    },
    {
      icon: Settings,
      description: "System settings updated",
      timestamp: "3 hours ago",
      color: "bg-gray-500",
    },
    {
      icon: Bell,
      description: "New notification sent to 1,234 users",
      timestamp: "5 hours ago",
      color: "bg-blue-500",
    },
    {
      icon: FileText,
      description: "Monthly report generated",
      timestamp: "1 day ago",
      color: "bg-orange-500",
    },
  ]

  const revenueStreams = [
    { name: "Subscriptions", value: 75, amount: "$33,923" },
    { name: "One-time Sales", value: 45, amount: "$20,385" },
    { name: "Add-ons", value: 30, amount: "$13,590" },
    { name: "Consulting", value: 20, amount: "$9,045" },
  ]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your SaaS dashboard
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300" style={{animationDelay: `${index * 0.1}s`}}>
              <div className={`h-1 bg-gradient-to-r ${kpi.gradient}`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${kpi.gradient} opacity-10`}>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpi.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className={`rounded-lg ${activity.color} p-2 shadow-sm group-hover:shadow-md transition-shadow`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No users found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" alt={user.name} />
                            <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getRelativeTime(user.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Progress */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {revenueStreams.map((stream) => (
              <div key={stream.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stream.name}</span>
                  <span className="text-muted-foreground">{stream.amount}</span>
                </div>
                <div className="relative h-3 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500 shadow-sm"
                    style={{ width: `${stream.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
