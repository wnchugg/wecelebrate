import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Calendar, Gift, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function CreateEvent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    date: "",
    hosts: "",
    description: "",
    goalAmount: "",
  });

  const eventTypes = [
    { value: "wedding", label: "Wedding" },
    { value: "birthday", label: "Birthday" },
    { value: "baby-shower", label: "Baby Shower" },
    { value: "anniversary", label: "Anniversary" },
    { value: "graduation", label: "Graduation" },
    { value: "other", label: "Other Celebration" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter an event title");
      return;
    }
    if (!formData.type) {
      toast.error("Please select an event type");
      return;
    }
    if (!formData.date) {
      toast.error("Please select an event date");
      return;
    }
    if (!formData.hosts.trim()) {
      toast.error("Please enter host name(s)");
      return;
    }

    // In a real app, this would send data to the server
    toast.success("Event created successfully!");
    setTimeout(() => {
      void navigate("/dashboard");
    }, 1000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white mb-4">
            <Gift className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Create Your Event</h1>
          <p className="text-lg text-gray-600">
            Set up a beautiful gift registry for your special occasion
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Tell us about your celebration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Event Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Event Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Sarah & John's Wedding"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>

              {/* Event Type */}
              <div className="space-y-2">
                <Label htmlFor="type">
                  Event Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange("type", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
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

              {/* Event Date */}
              <div className="space-y-2">
                <Label htmlFor="date">
                  Event Date <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="date"
                    type="date"
                    className="pl-10"
                    value={formData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>

              {/* Hosts */}
              <div className="space-y-2">
                <Label htmlFor="hosts">
                  Host Name(s) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="hosts"
                  placeholder="e.g., Sarah Mitchell & John Anderson"
                  value={formData.hosts}
                  onChange={(e) => handleChange("hosts", e.target.value)}
                  required
                />
                <p className="text-sm text-gray-600">
                  Separate multiple hosts with " & "
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Event Description</Label>
                <Textarea
                  id="description"
                  placeholder="Share details about your event and what it means to you..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                />
              </div>

              {/* Goal Amount */}
              <div className="space-y-2">
                <Label htmlFor="goalAmount">
                  Funding Goal (Optional)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    $
                  </span>
                  <Input
                    id="goalAmount"
                    type="number"
                    min="0"
                    step="100"
                    className="pl-7"
                    placeholder="5000"
                    value={formData.goalAmount}
                    onChange={(e) => handleChange("goalAmount", e.target.value)}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Set a target amount for all gifts combined
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Feature Highlights */}
          <Card className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                What happens next?
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Heart className="h-4 w-4 text-pink-600 mt-0.5 flex-shrink-0" />
                  <span>Add gifts to your registry with custom descriptions and images</span>
                </li>
                <li className="flex items-start gap-2">
                  <Gift className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Share your event page with friends and family</span>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-pink-600 mt-0.5 flex-shrink-0" />
                  <span>Track contributions and send thank you messages</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="mt-8 flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => void navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}