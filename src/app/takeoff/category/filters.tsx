"use client";

import { Input } from "@/components/ui/input";
import { SearchSelectCombobox } from "@/components/search-select-combobox";
import { Search } from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

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
  placeholder = "Tous les types", 
  className 
}: TypeFilterProps) {
  // Optimize uniqueTypes computation by memoizing on data.length instead of full data array
  const uniqueTypes = useMemo(() => {
    const types = new Set(data.map(item => item.type).filter(Boolean));
    return Array.from(types).sort();
  }, [data.length, data]);

  // Convert to options format for combobox
  const options = useMemo(() => {
    const typeOptions = uniqueTypes.map(type => ({
      value: type,
      label: type
    }));
    
    return [
      { value: "all", label: "Tous les types" },
      ...typeOptions
    ];
  }, [uniqueTypes]);

  const handleChange = useCallback((newValue: string) => {
    onChange(newValue);
  }, [onChange]);

  return (
    <div className={className}>
      <SearchSelectCombobox
        options={options}
        value={value}
        onSelect={handleChange}
        placeholder={placeholder}
        searchPlaceholder="Rechercher un type..."
        isLoading={false}
      />
    </div>
  );
}

// Hook for managing filters with debounced search
export function useDataFilters(data: any[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  
  // Debounce search term to reduce filter computations while typing
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 150);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = !debouncedSearchTerm || 
        (item.name && item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
      
      const matchesType = selectedType === "all" || item.type === selectedType;
      
      return matchesSearch && matchesType;
    });
  }, [data, debouncedSearchTerm, selectedType]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    setSelectedType(value);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedType("all");
  }, []);

  return {
    searchTerm,
    setSearchTerm: handleSearchChange,
    selectedType,
    setSelectedType: handleTypeChange,
    filteredData,
    resetFilters,
  };
} 