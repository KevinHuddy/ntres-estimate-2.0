'use client';
import { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';



interface TakeoffLineItemEditDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	// onSave: (takeoffLineItem: any) => void;
	// categories: string[];
	// types: string[];
	// units: string[];
}
export default function TakeoffLineItemEditDialog({
	open,
	onOpenChange,
	// onSave,
	// categories,
	// types,
	// units,
}: TakeoffLineItemEditDialogProps) {
	
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && open) {
				event.preventDefault()
				handleClose()
		  	}
		}
	
		if (open) {
			document.addEventListener('keydown', handleKeyDown)
		}
	
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [open, hasUnsavedChanges])

	

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

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						{/* Edit User: {formData.name} */}
					</DialogTitle>
					<DialogDescription>
						Update user information and additional
						details.
					</DialogDescription>
				</DialogHeader>

				

				<DialogFooter>
					{/* <Button
						variant="outline"
						onClick={handleClose}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={isLoading}>
						{isLoading ? 'Saving...' : 'Save Changes'}
					</Button> */}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"

// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Textarea } from "@/components/ui/textarea"
// import { Badge } from "@/components/ui/badge"
// import { CalendarIcon, User } from "lucide-react"

// interface UserEditDialogProps {
//   takeoffLineItem: any | null
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   onSave: (takeoffLineItem: any) => void
//   categories: string[]
//   types: string[]
//   units: string[]
// }

// export function UserEditDialog({
//   takeoffLineItem,
//   open,
//   onOpenChange,
//   onSave,
//   categories,
//   types,
//   units,
// }: UserEditDialogProps) {
//   const [formData, setFormData] = useState<any | null>(null)
//   const [isLoading, setIsLoading] = useState(false)
//   const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

//   // Reset form data when user changes
//   useEffect(() => {
//     if (takeoffLineItem) {
//       setFormData({ ...takeoffLineItem })
//       setHasUnsavedChanges(false)
//     }
//   }, [takeoffLineItem])

//   const handleSave = async () => {
//     if (!formData) return

//     setIsLoading(true)
//     try {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1000))
//       onSave(formData)
//       setHasUnsavedChanges(false)
//       onOpenChange(false)
//     } catch (error) {
//       console.error("Error saving user:", error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleFieldChange = (field: keyof any, value: any) => {
//     if (!formData) return
//     setFormData({ ...formData, [field]: value })
//     setHasUnsavedChanges(true)
//   }

//   const addSkill = (skill: string) => {
//     if (!formData || !skill.trim()) return
//     const currentSkills = formData.skills || []
//     if (!currentSkills.includes(skill.trim())) {
//       handleFieldChange("skills", [...currentSkills, skill.trim()])
//     }
//   }

//   const removeSkill = (skillToRemove: string) => {
//     if (!formData) return
//     const currentSkills = formData.skills || []
//     handleFieldChange(
//       "skills",
//       currentSkills.filter((skill) => skill !== skillToRemove),
//     )
//   }

//   const handleClose = () => {
//     if (hasUnsavedChanges) {
//       if (window.confirm("You have unsaved changes. Are you sure you want to close without saving?")) {
//         setHasUnsavedChanges(false)
//         onOpenChange(false)
//       }
//     } else {
//       onOpenChange(false)
//     }
//   }

//   useEffect(() => {
//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (event.key === "Escape" && open) {
//         event.preventDefault()
//         handleClose()
//       }
//     }

//     if (open) {
//       document.addEventListener("keydown", handleKeyDown)
//     }

//     return () => {
//       document.removeEventListener("keydown", handleKeyDown)
//     }
//   }, [open, hasUnsavedChanges])

//   if (!formData) return null

//   return (

//   )
// }
