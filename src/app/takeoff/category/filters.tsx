"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useMemo } from "react";
import { useState } from "react";

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchFilter({ 
  value, 
  onChange, 
  placeholder = "Search by name...", 
  className 
}: SearchFilterProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}

interface TypeFilterProps {
  value: string;
  onChange: (value: string) => void;
  data: any[];
  placeholder?: string;
  className?: string;
}

export function TypeFilter({ 
  value, 
  onChange, 
  data, 
  placeholder = "Tout les types", 
  className 
}: TypeFilterProps) {
  const uniqueTypes = useMemo(() => {
    const types = new Set(data.map(item => item.type).filter(Boolean));
    return Array.from(types).sort();
  }, [data]);

  return (
    <div className={className}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les types</SelectItem>
          {uniqueTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Hook for managing filters
export function useDataFilters(data: any[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = !searchTerm || 
        (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = selectedType === "all" || item.type === selectedType;
      
      return matchesSearch && matchesType;
    });
  }, [data, searchTerm, selectedType]);

  return {
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    filteredData,
    // Reset filters
    resetFilters: () => {
      setSearchTerm("");
      setSelectedType("all");
    }
  };
} 