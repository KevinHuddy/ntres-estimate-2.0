"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

interface EditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: any | null
}

export default function EditModal({ open, onOpenChange, item }: EditModalProps) {
  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;élément</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nom
            </Label>
            <Input
              id="name"
              defaultValue={item.name}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Input
              id="type"
              defaultValue={item.type}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit_type" className="text-right">
              Unité
            </Label>
            <Input
              id="unit_type"
              defaultValue={item.unit_type}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="qty_takeoff" className="text-right">
              Quantité
            </Label>
            <Input
              id="qty_takeoff"
              type="number"
              defaultValue={item.qty_takeoff}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cost_takeoff" className="text-right">
              Prix
            </Label>
            <Input
              id="cost_takeoff"
              type="number"
              step="0.01"
              defaultValue={item.cost_takeoff}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Total
            </Label>
            <div className="col-span-3 px-3 py-2 text-sm bg-muted rounded-md">
              {formatCurrency(item.cost_takeoff * item.qty_takeoff)}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Fournisseur
            </Label>
            <div className="col-span-3 px-3 py-2 text-sm bg-muted rounded-md">
              {item.supplierName || 'Aucun fournisseur'}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit">
            Sauvegarder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 