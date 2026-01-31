"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Separator } from "../ui/separator";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch?: (opts: { country: string; workTypes: string[] }) => void;
}

const WORK_TYPES = ["FULLTIME", "CONTRACTOR", "PARTTIME", "INTERN"];

export default function JobSearchModal({
  open,
  onOpenChange,
  onSearch,
}: Props) {
  const [countries, setCountries] = useState<
    { value: string; label: string }[]
  >([]);
  const [country, setCountry] = useState<string>("");
  const [workTypes, setWorkTypes] = useState<string[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  function toggleWorkType(type: string) {
    setWorkTypes((prev) =>
      prev.includes(type) ? prev.filter((p) => p !== type) : [...prev, type]
    );
  }

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function fetchCountries() {
      setLoadingCountries(true);
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/",
          {
            signal: controller.signal,
          }
        );
        if (!res.ok) throw new Error("Failed to fetch countries");
        const json = await res.json();

        // Expecting json.data as array of { iso2, country }
        type CountryAPIItem = { iso2: string; country: string };
        const data = (json.data || []) as CountryAPIItem[];
        const items: { value: string; label: string }[] = data
          .map((c) => ({ value: c.iso2, label: c.country }))
          .filter(Boolean);

        if (mounted) {
          setCountries(items);
        }
      } catch (err) {
        if ((err as DOMException)?.name !== "AbortError") {
          console.error("Error fetching countries:", err);
        }
      } finally {
        if (mounted) setLoadingCountries(false);
      }
    }

    fetchCountries();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const handleSearch = () => {
    if (!country) {
      toast.error("Please select a country");
      return;
    }
    if (workTypes.length === 0) {
      toast.error("Please select at least one work type");
      return;
    }

    const payload = { country, workTypes };
    if (onSearch) onSearch(payload);
    toast.success("Search triggered", {
      description: `Country: ${country}, Types: ${workTypes.join(", ")}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md px-0">
        <DialogHeader className="px-4">
          <DialogTitle>Search Jobs</DialogTitle>
          <DialogDescription>
            Filter jobs by country and work type.
          </DialogDescription>
        </DialogHeader>
        <Separator />

        <div className="mt-4 space-y-4 px-4">
          <div>
            <Label className="mb-2">Country of work</Label>
            <Select value={country} onValueChange={(v) => setCountry(v)}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    loadingCountries ? "Loading..." : "Select country"
                  }
                ></SelectValue>
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2">Work type</Label>
            <div className="grid grid-cols-2 gap-2">
              {WORK_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer select-none"
                  onClick={() => toggleWorkType(type)}
                >
                  <input
                    type="checkbox"
                    checked={workTypes.includes(type)}
                    readOnly
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="px-4">
          <div className="flex gap-2 w-full justify-end">
            <DialogClose className="hover:bg-border cursor-pointer">
              Cancel
            </DialogClose>
            <Button
              onClick={handleSearch}
              className="bg-primary hover:bg-primary-hover cursor-pointer"
            >
              Search
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
