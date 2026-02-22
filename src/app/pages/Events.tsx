import { useState } from "react";
import { EventCard } from "../components/EventCard";
import { mockEvents } from "../data/mockData";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export function Events() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");

  const eventTypes = [
    { value: "all", label: "All Events" },
    { value: "wedding", label: "Weddings" },
    { value: "birthday", label: "Birthdays" },
    { value: "baby-shower", label: "Baby Showers" },
    { value: "anniversary", label: "Anniversaries" },
    { value: "graduation", label: "Graduations" },
    { value: "other", label: "Other" },
  ];

  const sortOptions = [
    { value: "date", label: "Event Date" },
    { value: "newest", label: "Newest First" },
    { value: "progress", label: "Funding Progress" },
    { value: "popular", label: "Most Popular" },
  ];

  // Filter and sort events
  const filteredEvents = mockEvents
    .filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.hosts.some((host) =>
          host.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesType = selectedType === "all" || event.type === selectedType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "newest":
          return b.id.localeCompare(a.id);
        case "progress":
          return (
            b.fundedAmount / b.goalAmount - a.fundedAmount / a.goalAmount
          );
        case "popular":
          return b.giftCount - a.giftCount;
        default:
          return 0;
      }
    });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSortBy("date");
  };

  const hasActiveFilters = searchQuery !== "" || selectedType !== "all" || sortBy !== "date";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Events</h1>
          <p className="text-lg text-gray-600">
            Discover and contribute to special celebrations
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search events or hosts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Event Type Filter */}
            <div className="w-full lg:w-48">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="w-full lg:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full lg:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:text-gray-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedType !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Type: {eventTypes.find((t) => t.value === selectedType)?.label}
                  <button
                    onClick={() => setSelectedType("all")}
                    className="ml-1 hover:text-gray-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} found
          </p>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search query
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}