"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, User } from "lucide-react"

interface UserEditDialogProps {
  takeoffLineItem: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (takeoffLineItem: any) => void
  categories: string[]
  types: string[]
  units: string[]
}

export function UserEditDialog({
  takeoffLineItem,
  open,
  onOpenChange,
  onSave,
  categories,
  types,
  units,
}: UserEditDialogProps) {
  const [formData, setFormData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Reset form data when user changes
  useEffect(() => {
    if (takeoffLineItem) {
      setFormData({ ...takeoffLineItem })
      setHasUnsavedChanges(false)
    }
  }, [takeoffLineItem])

  const handleSave = async () => {
    if (!formData) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onSave(formData)
      setHasUnsavedChanges(false)
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFieldChange = (field: keyof any, value: any) => {
    if (!formData) return
    setFormData({ ...formData, [field]: value })
    setHasUnsavedChanges(true)
  }

  const addSkill = (skill: string) => {
    if (!formData || !skill.trim()) return
    const currentSkills = formData.skills || []
    if (!currentSkills.includes(skill.trim())) {
      handleFieldChange("skills", [...currentSkills, skill.trim()])
    }
  }

  const removeSkill = (skillToRemove: string) => {
    if (!formData) return
    const currentSkills = formData.skills || []
    handleFieldChange(
      "skills",
      currentSkills.filter((skill) => skill !== skillToRemove),
    )
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to close without saving?")) {
        setHasUnsavedChanges(false)
        onOpenChange(false)
      }
    } else {
      onOpenChange(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        event.preventDefault()
        handleClose()
      }
    }

    if (open) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, hasUnsavedChanges])

  if (!formData) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit User: {formData.name}
          </DialogTitle>
          <DialogDescription>Update user information and additional details.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleFieldChange("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate">Join Date</Label>
                <div className="relative">
                  <Input
                    id="joinDate"
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => handleFieldChange("joinDate", e.target.value)}
                  />
                  <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address || ""}
                onChange={(e) => handleFieldChange("address", e.target.value)}
                placeholder="123 Main St, City, State 12345"
                rows={2}
              />
            </div>
          </div>

          {/* Takeoff Line Item Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Takeoff Line Item Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleFieldChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleFieldChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manager">Manager</Label>
                <Select
                  value={formData.manager || "none"}
                  onValueChange={(value) => handleFieldChange("manager", value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No unit</SelectItem>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary || ""}
                  onChange={(e) => handleFieldChange("salary", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="75000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleFieldChange("status", value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Skills</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSkill(e.currentTarget.value)
                      e.currentTarget.value = ""
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement
                    addSkill(input.value)
                    input.value = ""
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.skills || []).map((skill) => (
                  <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bio</h3>
            <Textarea
              value={formData.bio || ""}
              onChange={(e) => handleFieldChange("bio", e.target.value)}
              placeholder="Tell us about this user..."
              rows={3}
            />
          </div>

          {/* Metadata */}
          {formData.lastLogin && (
            <div className="space-y-2">
              <Label>Last Login</Label>
              <div className="text-sm text-muted-foreground">{new Date(formData.lastLogin).toLocaleString()}</div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
