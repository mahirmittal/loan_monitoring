"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Clock, User, MapPin, Building2, FileText, IndianRupee } from "lucide-react"

interface LoanApplication {
  id: string
  loanType: "shg" | "individual"
  applicantName: string
  address: string
  bankBranch: string
  description: string
  department: string
  status: "pending" | "approved" | "rejected" | "disbursed"
  submittedAt: string
  adminAction?: {
    action: "approved" | "rejected"
    timestamp: string
  }
  branchAction?: {
    action: "disbursed"
    timestamp: string
    disbursedBy: string
  }
}

export function AdminApplicationsList() {
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load applications from localStorage
    const savedApplications = localStorage.getItem("loanApplications")
    if (savedApplications) {
      setApplications(JSON.parse(savedApplications))
    }
    setIsLoading(false)
  }, [])

  const updateApplicationStatus = (applicationId: string, newStatus: "approved" | "rejected") => {
    const updatedApplications = applications.map((app) =>
      app.id === applicationId
        ? {
            ...app,
            status: newStatus,
            adminAction: {
              action: newStatus,
              timestamp: new Date().toISOString(),
            },
          }
        : app,
    )
    setApplications(updatedApplications)
    localStorage.setItem("loanApplications", JSON.stringify(updatedApplications))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      case "disbursed":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <IndianRupee className="w-3 h-3 mr-1" />
            Disbursed
          </Badge>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return <div>Loading applications...</div>
  }

  if (applications.length === 0) {
    return (
      <Alert>
        <AlertDescription>No loan applications have been submitted yet.</AlertDescription>
      </Alert>
    )
  }

  const pendingCount = applications.filter((app) => app.status === "pending").length
  const approvedCount = applications.filter((app) => app.status === "approved").length
  const rejectedCount = applications.filter((app) => app.status === "rejected").length
  const disbursedCount = applications.filter((app) => app.status === "disbursed").length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-muted-foreground">Total Applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{disbursedCount}</div>
            <p className="text-xs text-muted-foreground">Disbursed</p>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">All Loan Applications</h2>
        {applications.map((application) => (
          <Card key={application.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{application.applicantName}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {application.loanType === "shg" ? "SHG Loan" : "Individual Loan"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {application.department}
                    </span>
                    <span>ID: {application.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">{getStatusBadge(application.status)}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-gray-600">{application.address}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 mt-0.5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Bank Branch</p>
                      <p className="text-sm text-gray-600">{application.bankBranch}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 mt-0.5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Loan Purpose & Description</p>
                    <p className="text-sm text-gray-600 mt-1">{application.description}</p>
                  </div>
                </div>
              </div>

              {application.adminAction && (
                <div
                  className={`mb-4 p-3 rounded-lg ${
                    application.adminAction.action === "approved" ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      application.adminAction.action === "approved" ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    <strong>Admin {application.adminAction.action === "approved" ? "Approved" : "Rejected"}:</strong>{" "}
                    {formatDate(application.adminAction.timestamp)}
                  </p>
                </div>
              )}

              {application.branchAction && (
                <div className="mb-4 p-3 rounded-lg bg-blue-50">
                  <p className="text-sm text-blue-800">
                    <strong>Loan Disbursed:</strong> {formatDate(application.branchAction.timestamp)} by{" "}
                    {application.branchAction.disbursedBy}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-xs text-gray-500">Submitted: {formatDate(application.submittedAt)}</p>
                {application.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                      onClick={() => updateApplicationStatus(application.id, "rejected")}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => updateApplicationStatus(application.id, "approved")}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                )}
                {application.status === "approved" && (
                  <div className="text-sm text-green-600 font-medium">✓ Approved - Awaiting Bank Disbursement</div>
                )}
                {application.status === "disbursed" && (
                  <div className="text-sm text-blue-600 font-medium">✓ Loan Successfully Disbursed</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
