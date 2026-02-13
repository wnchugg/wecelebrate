import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { getEventById, getGiftsByEventId } from "../data/mockData";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ProductCard } from "../components/ProductCard";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Gift, 
  DollarSign, 
  Share2, 
  Heart, 
  ArrowLeft,
  CheckCircle,
  Clock,
  TrendingUp,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export function EventDetails() {
  const { eventId } = useParams<{ eventId: string }>();
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState<string>("");
  const [contributorName, setContributorName] = useState<string>("");
  const [showContributeDialog, setShowContributeDialog] = useState(false);

  const event = eventId ? getEventById(eventId) : undefined;
  const gifts = eventId ? getGiftsByEventId(eventId) : [];

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">
            The event you're looking for doesn't exist.
          </p>
          <Link to="/events">
            <Button>Browse Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const fundingPercentage = Math.round((event.fundedAmount / event.goalAmount) * 100);

  const eventTypeColors = {
    wedding: "bg-pink-100 text-pink-700 border-pink-200",
    birthday: "bg-blue-100 text-blue-700 border-blue-200",
    "baby-shower": "bg-purple-100 text-purple-700 border-purple-200",
    anniversary: "bg-rose-100 text-rose-700 border-rose-200",
    graduation: "bg-green-100 text-green-700 border-green-200",
    other: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const eventTypeLabels = {
    wedding: "Wedding",
    birthday: "Birthday",
    "baby-shower": "Baby Shower",
    anniversary: "Anniversary",
    graduation: "Graduation",
    other: "Celebration",
  };

  // Get image URLs
  const eventImages: Record<string, string> = {
    "1": "https://images.unsplash.com/photo-1655490162630-175929877280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY291cGxlJTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzY5ODA2ODYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    "2": "https://images.unsplash.com/photo-1650584997985-e713a869ee77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMHBhcnR5JTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzY5NzUxNjkyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    "3": "https://images.unsplash.com/photo-1765317270424-923630242acc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwc2hvd2VyJTIwY3V0ZXxlbnwxfHx8fDE3Njk4MDY4NjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "4": "https://images.unsplash.com/photo-1765248626449-3e2ad01da3fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbm5pdmVyc2FyeSUyMGNvdXBsZSUyMGNlbGVicmF0aW9ufGVufDF8fHx8MTc2OTgwNjg2NHww&ixlib=rb-4.1.0&q=80&w=1080",
    "5": "https://images.unsplash.com/photo-1653250198948-1405af521dbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFkdWF0aW9uJTIwc3R1ZGVudCUyMGNlbGVicmF0aW9ufGVufDF8fHx8MTc2OTgwNjg2NHww&ixlib=rb-4.1.0&q=80&w=1080",
    "6": "https://images.unsplash.com/photo-1710883727450-d3a0ab1bbbe3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjBob3VzZSUyMGhvbWUlMjBpbnRlcmlvcnxlbnwxfHx8fDE3Njk4MDY4NjR8MA&ixlib=rb-4.1.0&q=80&w=1080",
  };

  const handleContribute = (giftId: string) => {
    setSelectedGift(giftId);
    setShowContributeDialog(true);
  };

  const handleSubmitContribution = () => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast.error("Please enter a valid contribution amount");
      return;
    }

    if (!contributorName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    // Add to cart
    const cart = JSON.parse(localStorage.getItem("jala-cart") || "[]");
    const gift = gifts.find((g) => g.id === selectedGift);
    
    if (gift) {
      cart.push({
        giftId: selectedGift,
        amount: parseFloat(contributionAmount),
        contributorName: contributorName.trim(),
        eventTitle: event.title,
        giftName: gift.name,
      });
      localStorage.setItem("jala-cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));
      
      toast.success(`Added $${contributionAmount} to ${gift.name} to your cart!`);
    }

    setShowContributeDialog(false);
    setContributionAmount("");
    setContributorName("");
    setSelectedGift(null);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[300px] md:h-[400px] bg-gray-900">
        <img
          src={eventImages[event.id]}
          alt={event.title}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="container mx-auto">
            <Link to="/events" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <Badge className={`${eventTypeColors[event.type]} border mb-2`}>
                  {eventTypeLabels[event.type]}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {event.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(event.date), "MMMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {event.hosts.join(" & ")}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShare}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details and Gifts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <Tabs defaultValue="gifts" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="gifts">Gift Registry</TabsTrigger>
                <TabsTrigger value="about">About Event</TabsTrigger>
              </TabsList>

              <TabsContent value="gifts" className="mt-6">
                <div className="space-y-4">
                  {gifts.map((gift) => {
                    const giftFundingPercentage = Math.round((gift.funded / gift.price) * 100);
                    const remainingAmount = Math.max(0, gift.price - gift.funded);
                    const isFullyFunded = giftFundingPercentage >= 100;

                    return (
                      <Card key={gift.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row">
                          <div className="sm:w-48 h-48 sm:h-auto bg-gray-100 flex-shrink-0">
                            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                              <Gift className="h-12 w-12 text-purple-300" />
                            </div>
                          </div>
                          
                          <div className="flex-1 p-5">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">{gift.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">{gift.description}</p>
                                <Badge variant="outline" className="text-xs">
                                  {gift.category}
                                </Badge>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-2xl font-bold text-purple-600">
                                  ${gift.price.toFixed(2)}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                  {gift.contributors} {gift.contributors === 1 ? "contributor" : "contributors"}
                                </span>
                                <span className="font-semibold text-purple-600">
                                  {giftFundingPercentage}% funded
                                </span>
                              </div>
                              <Progress value={giftFundingPercentage} className="h-2" />
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>${gift.funded.toFixed(2)} raised</span>
                                {!isFullyFunded && (
                                  <span>${remainingAmount.toFixed(2)} remaining</span>
                                )}
                              </div>
                            </div>

                            <div className="mt-4">
                              {isFullyFunded ? (
                                <Button
                                  variant="outline"
                                  className="w-full"
                                  disabled
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Fully Funded
                                </Button>
                              ) : (
                                <Button
                                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                  onClick={() => handleContribute(gift.id)}
                                >
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Contribute
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">About This Event</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {event.description}
                    </p>

                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                          <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Event Date</div>
                          <div className="font-medium">
                            {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
                          <Users className="h-5 w-5 text-pink-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Hosted By</div>
                          <div className="font-medium">{event.hosts.join(" & ")}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                          <Gift className="h-5 w-5 text-rose-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Registry Items</div>
                          <div className="font-medium">{event.giftCount} gifts</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Progress Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Funding Progress</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold text-purple-600">
                        ${event.fundedAmount.toLocaleString()}
                      </span>
                      <span className="text-gray-500">
                        of ${event.goalAmount.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={fundingPercentage} className="h-3" />
                    <div className="mt-2 text-sm text-gray-600">
                      {fundingPercentage}% funded
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-2xl font-bold">{event.giftCount}</div>
                      <div className="text-sm text-gray-600">Gift Items</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {gifts.reduce((sum, gift) => sum + gift.contributors, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Contributors</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <Link to="/cart">
                      <Button className="w-full" variant="outline">
                        View Cart
                      </Button>
                    </Link>
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={() => {
                        const firstUnfundedGift = gifts.find(
                          (g) => g.funded < g.price
                        );
                        if (firstUnfundedGift) {
                          handleContribute(firstUnfundedGift.id);
                        }
                      }}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Contribute Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contribution Dialog */}
      <Dialog open={showContributeDialog} onOpenChange={setShowContributeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contribute to Gift</DialogTitle>
            <DialogDescription>
              {selectedGift && gifts.find((g) => g.id === selectedGift)?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Contribution Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="0.00"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
              />
              {selectedGift && (
                <p className="text-sm text-gray-600">
                  ${(
                    gifts.find((g) => g.id === selectedGift)!.price -
                    gifts.find((g) => g.id === selectedGift)!.funded
                  ).toFixed(2)}{" "}
                  remaining
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowContributeDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitContribution}>Add to Cart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}