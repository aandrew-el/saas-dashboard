"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Loader2, CheckCircle, XCircle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getUserProfile } from "@/lib/supabase-actions"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

type PlanType = 'free' | 'pro' | 'enterprise'

interface PlanLimits {
  users: number // -1 for unlimited
  storage: number // -1 for unlimited (GB)
  price: number
}

const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: { users: 5, storage: 5, price: 0 },
  pro: { users: 50, storage: 100, price: 29 },
  enterprise: { users: -1, storage: -1, price: 99 }
}

export default function BillingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [currentPlan, setCurrentPlan] = useState<PlanType>('free')
  const [currentUsage, setCurrentUsage] = useState({
    users: 3, // Realistic usage for free plan
    storage: 2.3 // GB
  })
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showCanceled, setShowCanceled] = useState(false)

  // Check for success/cancel params
  useEffect(() => {
    if (searchParams?.get('success') === 'true') {
      const plan = searchParams.get('plan')
      const planName = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'new plan'
      toast.success(`Successfully upgraded to ${planName}!`, {
        description: 'Your subscription is now active.'
      })
      
      // Update current plan state
      if (plan) {
        setCurrentPlan(plan as PlanType)
      }
      
      // Clean up URL
      router.replace('/billing')
    }
    
    if (searchParams?.get('canceled') === 'true') {
      toast.error('Checkout canceled', {
        description: 'You can upgrade anytime.'
      })
      router.replace('/billing')
    }
  }, [searchParams, router])

  // Helper function to calculate usage status
  const getUsageStatus = (current: number, limit: number) => {
    if (limit === -1) return { percentage: 0, color: 'bg-green-500', label: 'Unlimited' }
    
    const percentage = (current / limit) * 100
    let color = 'bg-green-500'
    
    if (percentage >= 90) color = 'bg-red-500'
    else if (percentage >= 70) color = 'bg-yellow-500'
    
    return { percentage, color, label: `${current}/${limit}` }
  }

  // Helper function for plan button text
  const getPlanButtonText = (plan: PlanType) => {
    if (plan === currentPlan) return 'Current Plan'
    
    const planOrder: PlanType[] = ['free', 'pro', 'enterprise']
    const currentIndex = planOrder.indexOf(currentPlan)
    const targetIndex = planOrder.indexOf(plan)
    
    const planName = plan.charAt(0).toUpperCase() + plan.slice(1)
    return targetIndex > currentIndex 
      ? `Upgrade to ${planName}`
      : `Downgrade to ${planName}`
  }

  // Load user's current plan
  useEffect(() => {
    async function loadUserPlan() {
      const { data } = await getUserProfile()
      if (data) {
        const planStr = (data.subscription_status || data.plan || 'free').toLowerCase() as PlanType
        setCurrentPlan(planStr)
        
        // Set realistic usage based on plan
        if (planStr === 'pro') {
          setCurrentUsage({ users: 25, storage: 45 })
        } else if (planStr === 'enterprise') {
          setCurrentUsage({ users: 150, storage: 500 })
        } else {
          setCurrentUsage({ users: 3, storage: 2.3 })
        }
      }
      setLoading(false)
    }
    loadUserPlan()
  }, [])

  const handleCheckout = async (plan: 'pro' | 'enterprise') => {
    if (!user) {
      toast.error('Please sign in', {
        description: 'You need to be signed in to upgrade your plan.'
      })
      router.push('/settings')
      return
    }

    setCheckoutLoading(plan)
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          userId: user.id,
          email: user.email
        }),
      })

      const data = await response.json()

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to start checkout', {
        description: error instanceof Error ? error.message : 'Please try again later.'
      })
      setCheckoutLoading(null)
    }
  }

  const plans: Array<{
    name: string
    planType: PlanType
    price: string
    period: string
    description: string
    features: string[]
    popular?: boolean
  }> = [
    {
      name: "Free",
      planType: 'free',
      price: "$0",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "Up to 5 users",
        "Basic analytics",
        "Email support",
        "5GB storage",
      ],
    },
    {
      name: "Pro",
      planType: 'pro',
      price: "$29",
      period: "/month",
      description: "For growing businesses",
      features: [
        "Up to 50 users",
        "Advanced analytics",
        "Priority support",
        "100GB storage",
        "API access",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      planType: 'enterprise',
      price: "$99",
      period: "/month",
      description: "For large organizations",
      features: [
        "Unlimited users",
        "Custom analytics",
        "24/7 support",
        "Unlimited storage",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
      ],
    },
  ]

  // Calculate dynamic usage stats based on current plan
  const currentPlanLimits = PLAN_LIMITS[currentPlan]
  const usersStatus = getUsageStatus(currentUsage.users, currentPlanLimits.users)
  const storageStatus = getUsageStatus(currentUsage.storage, currentPlanLimits.storage)

  const featureComparison = [
    { feature: "Users", free: "5", pro: "50", enterprise: "Unlimited" },
    { feature: "Storage", free: "5GB", pro: "100GB", enterprise: "Unlimited" },
    { feature: "Analytics", free: true, pro: true, enterprise: true },
    { feature: "API Access", free: false, pro: true, enterprise: true },
    { feature: "Priority Support", free: false, pro: true, enterprise: true },
    { feature: "Custom Integrations", free: false, pro: false, enterprise: true },
    { feature: "Dedicated Manager", free: false, pro: false, enterprise: true },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </div>
        {/* Demo Plan Switcher - For Portfolio Demo */}
        <div className="hidden md:flex gap-2">
          <Button 
            size="sm" 
            variant={currentPlan === 'free' ? 'default' : 'outline'}
            onClick={() => {
              setCurrentPlan('free')
              setCurrentUsage({ users: 3, storage: 2.3 })
            }}
          >
            Demo: Free
          </Button>
          <Button 
            size="sm" 
            variant={currentPlan === 'pro' ? 'default' : 'outline'}
            onClick={() => {
              setCurrentPlan('pro')
              setCurrentUsage({ users: 25, storage: 45 })
            }}
          >
            Demo: Pro
          </Button>
          <Button 
            size="sm" 
            variant={currentPlan === 'enterprise' ? 'default' : 'outline'}
            onClick={() => {
              setCurrentPlan('enterprise')
              setCurrentUsage({ users: 150, storage: 500 })
            }}
          >
            Demo: Enterprise
          </Button>
        </div>
      </div>

      {/* Success/Cancel Messages */}
      {showSuccess && (
        <Card className="border-emerald-500 bg-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-900">
                Payment successful! Your subscription has been activated.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {showCanceled && (
        <Card className="border-gray-500 bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-gray-600" />
              <p className="text-sm font-medium text-gray-900">
                Payment canceled. You can upgrade anytime.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan with Usage */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription className="mt-2">
                You are currently on the <strong>{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</strong> plan
              </CardDescription>
            </div>
            <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Usage Stats */}
          <div className="space-y-4">
            {/* Users Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Users</span>
                <span className="text-muted-foreground">
                  {usersStatus.label}
                </span>
              </div>
              {currentPlanLimits.users !== -1 ? (
                <div className="relative h-3 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`${usersStatus.color} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(usersStatus.percentage, 100)}%` }}
                  />
                </div>
              ) : (
                <div className="text-sm text-emerald-600 font-medium">
                  ∞ Unlimited
                </div>
              )}
            </div>

            {/* Storage Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Storage</span>
                <span className="text-muted-foreground">
                  {storageStatus.label}{currentPlanLimits.storage !== -1 ? ' GB' : ''}
                </span>
              </div>
              {currentPlanLimits.storage !== -1 ? (
                <div className="relative h-3 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`${storageStatus.color} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(storageStatus.percentage, 100)}%` }}
                  />
                </div>
              ) : (
                <div className="text-sm text-emerald-600 font-medium">
                  ∞ Unlimited
                </div>
              )}
            </div>
          </div>

          {/* Billing Info */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium">Next billing date</p>
              <p className="text-sm text-muted-foreground">
                {currentPlan === 'free' 
                  ? 'N/A' 
                  : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })
                }
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Next invoice</p>
              <p className="text-sm text-muted-foreground">
                ${currentPlanLimits.price.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`shadow-sm hover:shadow-lg transition-all duration-300 ${
                plan.popular ? "border-indigo-500 ring-2 ring-indigo-500 ring-opacity-50" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.popular && (
                    <Badge className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm">Popular</Badge>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full shadow-sm hover:shadow-md transition-all ${
                    plan.popular && plan.planType !== currentPlan ? "bg-indigo-600 hover:bg-indigo-700" : ""
                  }`}
                  variant={plan.planType === currentPlan ? "outline" : (plan.popular ? "default" : "outline")}
                  disabled={plan.planType === currentPlan || checkoutLoading !== null}
                  onClick={() => plan.planType !== 'free' && handleCheckout(plan.planType)}
                >
                  {checkoutLoading === plan.planType ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting to checkout...
                    </>
                  ) : (
                    getPlanButtonText(plan.planType)
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Feature Comparison */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>
            Compare features across all plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Feature</TableHead>
                  <TableHead className="text-center font-semibold">Free</TableHead>
                  <TableHead className="text-center font-semibold">Pro</TableHead>
                  <TableHead className="text-center font-semibold">Enterprise</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featureComparison.map((item, index) => (
                  <TableRow 
                    key={item.feature}
                    className={`hover:bg-muted/60 transition-colors ${
                      index % 2 === 0 ? "bg-muted/20" : ""
                    }`}
                  >
                    <TableCell className="font-medium">{item.feature}</TableCell>
                    <TableCell className="text-center">
                      {typeof item.free === "boolean" ? (
                        item.free ? (
                          <Check className="h-5 w-5 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm font-medium">{item.free}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {typeof item.pro === "boolean" ? (
                        item.pro ? (
                          <Check className="h-5 w-5 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm font-medium">{item.pro}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {typeof item.enterprise === "boolean" ? (
                        item.enterprise ? (
                          <Check className="h-5 w-5 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm font-medium">{item.enterprise}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
