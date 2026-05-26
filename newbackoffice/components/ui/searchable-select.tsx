"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SearchableSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      setOpen(false);
      setSearchQuery("");
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const listBody = (
    <>
      <div className="p-2">
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setSearchQuery("");
            }
          }}
        />
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {filteredOptions.length === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="p-1">
            {filteredOptions.map((option) => {
              const isDisabled = Boolean(option.disabled);
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-disabled={isDisabled}
                  className={cn(
                    "relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                    isDisabled
                      ? "cursor-not-allowed text-muted-foreground opacity-60"
                      : "cursor-default hover:bg-accent hover:text-accent-foreground",
                    value === option.value && !isDisabled && "bg-accent"
                  )}
                  onClick={() => {
                    if (isDisabled) return;
                    onValueChange?.(
                      option.value === value ? "" : option.value
                    );
                    setOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  const listShellClass =
    "rounded-md border bg-popover text-popover-foreground shadow-md";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between font-normal"
        disabled={disabled}
        onClick={() => {
          setOpen(!open);
          setSearchQuery("");
        }}
      >
        <span className="truncate text-left">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 top-full z-[300] mt-1 max-h-[min(360px,calc(100vh-8rem))] overflow-hidden",
            listShellClass
          )}
        >
          {listBody}
        </div>
      )}
    </div>
  );
}
