"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Building2, Search, Key, Eye, EyeOff, Copy } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BranchCredential {
  username: string
  password: string
  bankName: string
  branchName: string
}

interface Bank {
  id: string
  name: string
  branches: string[]
  credentials: BranchCredential[]
}

export function BankManagement() {
  const [banks, setBanks] = useState<Bank[]>([])
  const [newBankName, setNewBankName] = useState("")
  const [selectedBankId, setSelectedBankId] = useState("")
  const [newBranchName, setNewBranchName] = useState("")
  const [isAddingBank, setIsAddingBank] = useState(false)
  const [isAddingBranch, setIsAddingBranch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const savedBanks = localStorage.getItem("banks")
    if (savedBanks) {
      const parsedBanks = JSON.parse(savedBanks)
      // Ensure backward compatibility - add credentials array if missing
      const banksWithCredentials = parsedBanks.map((bank: any) => ({
        ...bank,
        credentials: bank.credentials || [],
      }))
      setBanks(banksWithCredentials)
    }
  }, [])

  // Save banks to localStorage whenever banks change
  useEffect(() => {
    localStorage.setItem("banks", JSON.stringify(banks))
  }, [banks])

  const generateUsername = (bankName: string, branchName: string) => {
    const bankCode = bankName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 6)
    const branchCode = branchName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 6)
    return `${bankCode}_${branchCode}`
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleAddBank = () => {
    if (!newBankName.trim()) return

    const newBank: Bank = {
      id: `bank-${Date.now()}`,
      name: newBankName.trim(),
      branches: [],
      credentials: [], // Add credentials array
    }

    setBanks([...banks, newBank])
    setNewBankName("")
    setIsAddingBank(false)
  }

  const handleAddBranch = () => {
    if (!selectedBankId || !newBranchName.trim()) return

    const selectedBank = banks.find((bank) => bank.id === selectedBankId)
    if (!selectedBank) return

    const username = generateUsername(selectedBank.name, newBranchName.trim())
    const password = generatePassword()

    const newCredential: BranchCredential = {
      username,
      password,
      bankName: selectedBank.name,
      branchName: newBranchName.trim(),
    }

    setBanks(
      banks.map((bank) =>
        bank.id === selectedBankId
          ? {
              ...bank,
              branches: [...bank.branches, newBranchName.trim()],
              credentials: [...bank.credentials, newCredential], // Add credential
            }
          : bank,
      ),
    )
    setNewBranchName("")
    setIsAddingBranch(false)
  }

  const handleDeleteBank = (bankId: string) => {
    setBanks(banks.filter((bank) => bank.id !== bankId))
  }

  const handleDeleteBranch = (bankId: string, branchIndex: number) => {
    setBanks(
      banks.map((bank) =>
        bank.id === bankId
          ? {
              ...bank,
              branches: bank.branches.filter((_, index) => index !== branchIndex),
              credentials: bank.credentials.filter((_, index) => index !== branchIndex), // Remove credential
            }
          : bank,
      ),
    )
  }

  const togglePasswordVisibility = (credentialKey: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [credentialKey]: !prev[credentialKey],
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getAllCredentials = () => {
    return banks.flatMap((bank) => bank.credentials)
  }

  const filteredBanks = banks.filter((bank) => {
    const bankNameMatch = bank.name.toLowerCase().includes(searchQuery.toLowerCase())
    const branchMatch = bank.branches.some((branch) => branch.toLowerCase().includes(searchQuery.toLowerCase()))
    return bankNameMatch || branchMatch
  })

  const filteredCredentials = getAllCredentials().filter((credential) => {
    const bankNameMatch = credential.bankName.toLowerCase().includes(searchQuery.toLowerCase())
    const branchNameMatch = credential.branchName.toLowerCase().includes(searchQuery.toLowerCase())
    return bankNameMatch || branchNameMatch
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Bank Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="banks" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="banks">Banks & Branches</TabsTrigger>
              <TabsTrigger value="credentials">Branch Credentials</TabsTrigger>
            </TabsList>

            <TabsContent value="banks" className="space-y-6">
              {/* Add New Bank */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Add New Bank</h3>
                  <Button onClick={() => setIsAddingBank(!isAddingBank)} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bank
                  </Button>
                </div>

                {isAddingBank && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter bank name (e.g., State Bank of India)"
                      value={newBankName}
                      onChange={(e) => setNewBankName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddBank()}
                    />
                    <Button onClick={handleAddBank} disabled={!newBankName.trim()}>
                      Add
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingBank(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Add New Branch */}
              {banks.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Add New Branch</h3>
                    <Button onClick={() => setIsAddingBranch(!isAddingBranch)} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Branch
                    </Button>
                  </div>

                  {isAddingBranch && (
                    <div className="space-y-2">
                      <Label>Select Bank</Label>
                      <Select value={selectedBankId} onValueChange={setSelectedBankId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {banks.map((bank) => (
                            <SelectItem key={bank.id} value={bank.id}>
                              {bank.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter branch name (e.g., Main Branch, City Center)"
                          value={newBranchName}
                          onChange={(e) => setNewBranchName(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleAddBranch()}
                        />
                        <Button onClick={handleAddBranch} disabled={!selectedBankId || !newBranchName.trim()}>
                          Add
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddingBranch(false)}>
                          Cancel
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Login credentials will be automatically generated for this branch.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Configured Banks & Branches</h3>
                  {banks.length > 0 && (
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search banks or branches..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  )}
                </div>

                {banks.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No banks configured yet. Add banks and their branches to enable dropdown selection in loan
                      applications.
                    </AlertDescription>
                  </Alert>
                ) : filteredBanks.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No banks or branches found matching "{searchQuery}". Try a different search term.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {searchQuery && (
                      <p className="text-sm text-muted-foreground">
                        Found {filteredBanks.length} bank(s) matching "{searchQuery}"
                      </p>
                    )}

                    {filteredBanks.map((bank) => (
                      <Card key={bank.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-lg">{bank.name}</h4>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteBank(bank.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {bank.branches.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No branches added yet</p>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Branches ({bank.branches.length}):</p>
                              <div className="flex flex-wrap gap-2">
                                {bank.branches.map((branch, index) => (
                                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                    {branch}
                                    <button
                                      onClick={() => handleDeleteBranch(bank.id, index)}
                                      className="ml-1 hover:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="credentials" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Branch Login Credentials</h3>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Key className="h-3 w-3" />
                    {getAllCredentials().length} Credentials
                  </Badge>
                </div>

                {getAllCredentials().length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No branch credentials available. Add branches to automatically generate login credentials.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid gap-4">
                    {banks.map((bank) =>
                      bank.credentials.map((credential, index) => {
                        const credentialKey = `${bank.id}-${index}`
                        return (
                          <Card key={credentialKey} className="border-l-4 border-l-green-500">
                            <CardContent className="pt-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-semibold">{credential.bankName}</h4>
                                    <p className="text-sm text-muted-foreground">{credential.branchName}</p>
                                  </div>
                                  <Badge variant="secondary">Branch Login</Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-xs font-medium">Username</Label>
                                    <div className="flex items-center gap-2">
                                      <Input value={credential.username} readOnly className="font-mono text-sm" />
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => copyToClipboard(credential.username)}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-xs font-medium">Password</Label>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type={showPasswords[credentialKey] ? "text" : "password"}
                                        value={credential.password}
                                        readOnly
                                        className="font-mono text-sm"
                                      />
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => togglePasswordVisibility(credentialKey)}
                                      >
                                        {showPasswords[credentialKey] ? (
                                          <EyeOff className="h-3 w-3" />
                                        ) : (
                                          <Eye className="h-3 w-3" />
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => copyToClipboard(credential.password)}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      }),
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
