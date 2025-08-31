"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Copy, Eye, EyeOff, Trash2, Edit } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Department {
  id: string
  name: string
  code: string
  description: string
  username: string
  password: string
  createdAt: string
}

export function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    code: "",
    description: "",
    username: "",
    password: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [editingPassword, setEditingPassword] = useState<{ [key: string]: boolean }>({})
  const [newPasswords, setNewPasswords] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    loadDepartments()
  }, [])

  const loadDepartments = () => {
    const stored = localStorage.getItem("departments")
    if (stored) {
      setDepartments(JSON.parse(stored))
    }
  }

  const saveDepartments = (depts: Department[]) => {
    localStorage.setItem("departments", JSON.stringify(depts))
    setDepartments(depts)
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const addDepartment = () => {
    if (!newDepartment.name || !newDepartment.username || !newDepartment.password) {
      toast({
        title: "Error",
        description: "Department name, username, and password are required",
        variant: "destructive",
      })
      return
    }

    if (departments.some((dept) => dept.username.toLowerCase() === newDepartment.username.toLowerCase())) {
      toast({
        title: "Error",
        description: "Username already exists",
        variant: "destructive",
      })
      return
    }

    const department: Department = {
      id: Date.now().toString(),
      name: newDepartment.name,
      code: newDepartment.code,
      description: newDepartment.description,
      username: newDepartment.username,
      password: newDepartment.password,
      createdAt: new Date().toISOString(),
    }

    const updatedDepartments = [...departments, department]
    saveDepartments(updatedDepartments)

    setNewDepartment({ name: "", code: "", description: "", username: "", password: "" })

    toast({
      title: "✅ Department Added Successfully!",
      description: `${department.name} has been created with username: ${department.username}. The department can now login to submit loan applications.`,
      duration: 5000,
    })

    setTimeout(() => {
      const manageTab = document.querySelector('[value="manage"]') as HTMLElement
      if (manageTab) {
        manageTab.click()
      }
    }, 1000)
  }

  const deleteDepartment = (id: string) => {
    const updatedDepartments = departments.filter((dept) => dept.id !== id)
    saveDepartments(updatedDepartments)
    toast({
      title: "Success",
      description: "Department deleted successfully",
    })
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: `${type} copied to clipboard`,
    })
  }

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const updatePassword = (id: string) => {
    const newPassword = newPasswords[id]
    if (!newPassword) {
      toast({
        title: "Error",
        description: "Password cannot be empty",
        variant: "destructive",
      })
      return
    }

    const updatedDepartments = departments.map((dept) => (dept.id === id ? { ...dept, password: newPassword } : dept))
    saveDepartments(updatedDepartments)

    setEditingPassword((prev) => ({ ...prev, [id]: false }))
    setNewPasswords((prev) => ({ ...prev, [id]: "" }))

    toast({
      title: "Success",
      description: "Password updated successfully",
    })
  }

  const cancelPasswordEdit = (id: string) => {
    setEditingPassword((prev) => ({ ...prev, [id]: false }))
    setNewPasswords((prev) => ({ ...prev, [id]: "" }))
  }

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Department Management</h2>
          <p className="text-muted-foreground">Manage government departments and their login credentials</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {departments.length} Department{departments.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <Tabs defaultValue="add" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add">Add Department</TabsTrigger>
          <TabsTrigger value="manage">Manage Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Department</CardTitle>
              <CardDescription>Create a new government department with custom login credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dept-name">Department Name</Label>
                  <Input
                    id="dept-name"
                    placeholder="e.g., Agriculture Department"
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept-code">Department Code (Optional)</Label>
                  <Input
                    id="dept-code"
                    placeholder="e.g., AGR"
                    value={newDepartment.code}
                    onChange={(e) => setNewDepartment((prev) => ({ ...prev, code: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dept-username">Username</Label>
                  <Input
                    id="dept-username"
                    placeholder="e.g., agriculture_dept"
                    value={newDepartment.username}
                    onChange={(e) => setNewDepartment((prev) => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept-password">Password</Label>
                  <Input
                    id="dept-password"
                    type="password"
                    placeholder="Enter secure password"
                    value={newDepartment.password}
                    onChange={(e) => setNewDepartment((prev) => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept-description">Description (Optional)</Label>
                <Input
                  id="dept-description"
                  placeholder="Brief description of the department"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <Button onClick={addDepartment} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              {searchTerm && (
                <Badge variant="outline">
                  {filteredDepartments.length} result{filteredDepartments.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            {filteredDepartments.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    {searchTerm ? "No departments found matching your search." : "No departments added yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredDepartments.map((dept) => (
                  <Card key={dept.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg">{dept.name}</h3>
                            {dept.code && <Badge variant="secondary">{dept.code}</Badge>}
                          </div>
                          {dept.description && <p className="text-sm text-muted-foreground">{dept.description}</p>}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Username</Label>
                              <div className="flex items-center space-x-2">
                                <code className="bg-muted px-2 py-1 rounded text-sm">{dept.username}</code>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(dept.username, "Username")}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Password</Label>
                              {editingPassword[dept.id] ? (
                                <div className="flex items-center space-x-2">
                                  <Input
                                    type="password"
                                    placeholder="New password"
                                    value={newPasswords[dept.id] || ""}
                                    onChange={(e) =>
                                      setNewPasswords((prev) => ({ ...prev, [dept.id]: e.target.value }))
                                    }
                                    className="text-sm"
                                  />
                                  <Button size="sm" variant="default" onClick={() => updatePassword(dept.id)}>
                                    Save
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => cancelPasswordEdit(dept.id)}>
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <code className="bg-muted px-2 py-1 rounded text-sm">
                                    {showPasswords[dept.id] ? dept.password : "••••••••••••"}
                                  </code>
                                  <Button size="sm" variant="ghost" onClick={() => togglePasswordVisibility(dept.id)}>
                                    {showPasswords[dept.id] ? (
                                      <EyeOff className="w-3 h-3" />
                                    ) : (
                                      <Eye className="w-3 h-3" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(dept.password, "Password")}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingPassword((prev) => ({ ...prev, [dept.id]: true }))}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Created: {new Date(dept.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteDepartment(dept.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
