"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GovernmentHeader } from "@/components/government-header"
import { Shield, Settings } from "lucide-react"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Admin credentials (in future this will come from MongoDB)
  const adminCredentials = {
    username: "admin",
    password: "admin123",
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check credentials
    if (username === adminCredentials.username && password === adminCredentials.password) {
      // Store admin login info in localStorage
      localStorage.setItem(
        "adminUser",
        JSON.stringify({
          role: "admin",
          name: "System Administrator",
          loginTime: new Date().toISOString(),
        }),
      )

      router.push("/admin/dashboard")
    } else {
      setError("Invalid admin credentials")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <GovernmentHeader title="Administrative Portal" showLogout={false} />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-3 bg-destructive/10 rounded-full">
                <Settings className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground">System Administration</h2>
            <p className="text-muted-foreground">Authorized personnel only</p>
          </div>

          <Card className="gov-card border-destructive/20">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-serif text-destructive">Admin Authentication</CardTitle>
              <CardDescription>Enter administrator credentials to access the management dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="font-medium">
                    Admin Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter admin username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" variant="destructive" className="w-full h-11 font-medium" disabled={isLoading}>
                  {isLoading ? "Authenticating..." : "Access Admin Dashboard"}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-destructive" />
                  <h3 className="font-semibold text-sm text-foreground">Demo Admin Credentials</h3>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    Username: <code className="bg-muted px-1 rounded">admin</code>
                  </p>
                  <p>
                    Password: <code className="bg-muted px-1 rounded">admin123</code>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
