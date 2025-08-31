"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Search } from "lucide-react"

interface User {
  department: string
  name: string
  loginTime: string
}

interface LoanApplicationFormProps {
  user: User
}

interface LoanApplication {
  id: string
  loanType: "shg" | "individual"
  applicantName: string
  address: string
  bankBranch: string
  description: string
  department: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
}

interface Bank {
  id: string
  name: string
  branches: string[]
}

export function LoanApplicationForm({ user }: LoanApplicationFormProps) {
  const [loanType, setLoanType] = useState<"shg" | "individual">("individual")
  const [applicantName, setApplicantName] = useState("")
  const [address, setAddress] = useState("")
  const [selectedBank, setSelectedBank] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [banks, setBanks] = useState<Bank[]>([])
  const [bankSearchQuery, setBankSearchQuery] = useState("")
  const [branchSearchQuery, setBranchSearchQuery] = useState("")

  // Load banks from localStorage
  useEffect(() => {
    const savedBanks = localStorage.getItem("banks")
    if (savedBanks) {
      setBanks(JSON.parse(savedBanks))
    }
  }, [])

  // Reset branch selection when bank changes
  useEffect(() => {
    setSelectedBranch("")
    setBranchSearchQuery("")
  }, [selectedBank])

  const selectedBankData = banks.find((bank) => bank.id === selectedBank)

  const filteredBanks = banks.filter((bank) => bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase()))

  const filteredBranches =
    selectedBankData?.branches.filter((branch) => branch.toLowerCase().includes(branchSearchQuery.toLowerCase())) || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Create bank branch string
    const bankBranchString = selectedBankData ? `${selectedBankData.name} - ${selectedBranch}` : ""

    // Create application object
    const application: LoanApplication = {
      id: `APP-${Date.now()}`,
      loanType,
      applicantName,
      address,
      bankBranch: bankBranchString,
      description,
      department: user.department,
      status: "pending",
      submittedAt: new Date().toISOString(),
    }

    // Save to localStorage (in future this will go to MongoDB)
    const existingApplications = JSON.parse(localStorage.getItem("loanApplications") || "[]")
    existingApplications.push(application)
    localStorage.setItem("loanApplications", JSON.stringify(existingApplications))

    setIsSubmitting(false)
    setIsSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setApplicantName("")
      setAddress("")
      setSelectedBank("")
      setSelectedBranch("")
      setDescription("")
      setBankSearchQuery("")
      setBranchSearchQuery("")
    }, 3000)
  }

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Submitted Successfully!</h3>
            <p className="text-gray-600">
              Your loan application has been submitted and is now pending review by the admin.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show message if no banks are configured
  if (banks.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Banks Not Configured</h3>
            <p className="text-gray-600">
              No banks have been configured yet. Please contact the administrator to add banks and branches before
              submitting loan applications.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">Loan Application Form</CardTitle>
        <p className="text-gray-600">Please fill out all required fields to submit your loan application.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Loan Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Loan Type *</Label>
            <RadioGroup value={loanType} onValueChange={(value: "shg" | "individual") => setLoanType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual">Individual Loan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="shg" id="shg" />
                <Label htmlFor="shg">Self Help Group (SHG) Loan</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Applicant/SHG Name */}
          <div className="space-y-2">
            <Label htmlFor="applicantName" className="text-base font-semibold">
              {loanType === "shg" ? "SHG Name" : "Applicant Name"} *
            </Label>
            <Input
              id="applicantName"
              type="text"
              placeholder={loanType === "shg" ? "Enter SHG name" : "Enter applicant's full name"}
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              required
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-base font-semibold">
              Address *
            </Label>
            <Textarea
              id="address"
              placeholder="Enter complete address with village, district, state, and PIN code"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Bank Selection with Search */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Select Bank *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search banks..."
                value={bankSearchQuery}
                onChange={(e) => setBankSearchQuery(e.target.value)}
                className="pl-10 mb-2"
              />
            </div>
            <Select value={selectedBank} onValueChange={setSelectedBank} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a bank" />
              </SelectTrigger>
              <SelectContent>
                {filteredBanks.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    {bankSearchQuery ? `No banks found matching "${bankSearchQuery}"` : "No banks available"}
                  </div>
                ) : (
                  filteredBanks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Branch Selection with Search */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Select Branch *</Label>
            {selectedBank && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search branches..."
                  value={branchSearchQuery}
                  onChange={(e) => setBranchSearchQuery(e.target.value)}
                  className="pl-10 mb-2"
                />
              </div>
            )}
            <Select value={selectedBranch} onValueChange={setSelectedBranch} disabled={!selectedBank} required>
              <SelectTrigger>
                <SelectValue placeholder={selectedBank ? "Choose a branch" : "Select a bank first"} />
              </SelectTrigger>
              <SelectContent>
                {!selectedBank ? (
                  <div className="p-2 text-sm text-muted-foreground">Select a bank first</div>
                ) : filteredBranches.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    {branchSearchQuery
                      ? `No branches found matching "${branchSearchQuery}"`
                      : "No branches available for this bank"}
                  </div>
                ) : (
                  filteredBranches.map((branch, index) => (
                    <SelectItem key={index} value={branch}>
                      {branch}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-semibold">
              Loan Purpose & Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Please describe the purpose of the loan, amount needed, and how it will be used..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting || !selectedBank || !selectedBranch}
            >
              {isSubmitting ? "Submitting Application..." : "Submit Loan Application"}
            </Button>
          </div>
        </form>

        <Alert className="mt-6">
          <AlertDescription>
            <strong>Note:</strong> All fields marked with (*) are required. Your application will be reviewed by the
            admin and you will be notified of the decision.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
