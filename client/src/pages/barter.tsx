import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MessageCircle, Clock, DollarSign, Handshake, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { BarterTransaction, Task } from "@shared/schema";

interface BarterTaskFormData {
  title: string;
  description: string;
  barterOffered: string;
  barterWanted: string;
  estimatedValue: string;
  duration: string;
  barterCategory: string;
}

function CreateBarterTaskDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<BarterTaskFormData>({
    title: "",
    description: "",
    barterOffered: "",
    barterWanted: "",
    estimatedValue: "",
    duration: "",
    barterCategory: "skill"
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createBarterTask = useMutation({
    mutationFn: async (data: BarterTaskFormData) => {
      return await apiRequest("POST", "/api/tasks/barter", {
        title: data.title,
        description: data.description,
        difficulty: "Medium",
        duration: parseInt(data.duration),
        estimatedValue: parseFloat(data.estimatedValue),
        paymentType: "barter",
        taskType: "barter",
        barterOffered: data.barterOffered,
        barterWanted: data.barterWanted,
        barterCategory: data.barterCategory,
        flexibleBarter: true
      });
    },
    onSuccess: () => {
      toast({
        title: "Barter Task Created",
        description: "Your barter task has been posted to the community!"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/barter"] });
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        barterOffered: "",
        barterWanted: "",
        estimatedValue: "",
        duration: "",
        barterCategory: "skill"
      });
    },
    onError: (error) => {
      toast({
        title: "Error Creating Task",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBarterTask.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Barter Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a Barter Exchange</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What do you need help with?"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the task in detail..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="barterOffered">What I'm Offering</Label>
              <Input
                id="barterOffered"
                value={formData.barterOffered}
                onChange={(e) => setFormData({ ...formData, barterOffered: e.target.value })}
                placeholder="e.g., 2 hours of tutoring"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="barterWanted">What I Want in Return</Label>
              <Input
                id="barterWanted"
                value={formData.barterWanted}
                onChange={(e) => setFormData({ ...formData, barterWanted: e.target.value })}
                placeholder="e.g., lawn mowing service"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
              <Input
                id="estimatedValue"
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                placeholder="50"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="120"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="barterCategory">Category</Label>
              <select
                id="barterCategory"
                value={formData.barterCategory}
                onChange={(e) => setFormData({ ...formData, barterCategory: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="skill">Skill</option>
                <option value="service">Service</option>
                <option value="item">Item</option>
                <option value="time">Time</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBarterTask.isPending}>
              {createBarterTask.isPending ? "Creating..." : "Create Barter Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BarterTaskCard({ task }: { task: Task & { barterOffered?: string; barterWanted?: string; estimatedValue?: string } }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const proposeBarterTrade = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/barter-transactions", {
        taskId: task.id,
        offeredService: task.barterWanted,
        requestedService: task.barterOffered,
        agreedValue: task.estimatedValue || "0"
      });
    },
    onSuccess: () => {
      toast({
        title: "Barter Proposal Sent!",
        description: "The task creator will be notified of your proposal."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/barter-transactions"] });
    },
    onError: (error) => {
      toast({
        title: "Error Sending Proposal",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return (
    <Card className="border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
            <Handshake className="w-3 h-3 mr-1" />
            Barter
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">{task.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded-lg border">
            <h4 className="font-semibold text-emerald-700 mb-1">Offering:</h4>
            <p className="text-sm">{task.barterOffered}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <h4 className="font-semibold text-blue-700 mb-1">Seeking:</h4>
            <p className="text-sm">{task.barterWanted}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {task.duration} min
          </div>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            ~${task.estimatedValue} value
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-1" />
            {Number(task.rating || 0).toFixed(1)}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={() => proposeBarterTrade.mutate()}
            disabled={proposeBarterTrade.isPending}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            <Handshake className="w-4 h-4 mr-2" />
            {proposeBarterTrade.isPending ? "Proposing..." : "Propose Trade"}
          </Button>
          <Button variant="outline" size="icon">
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BarterTransactionCard({ transaction }: { transaction: BarterTransaction }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "proposed": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold">{transaction.offeredService} ↔ {transaction.requestedService}</h3>
          <Badge className={getStatusColor(transaction.status)}>
            {transaction.status.replace('_', ' ')}
          </Badge>
        </div>
        
        <div className="text-sm text-gray-600 mb-3">
          <p><strong>Value:</strong> ${transaction.agreedValue}</p>
          {transaction.deliveryDate && (
            <p><strong>Scheduled:</strong> {new Date(transaction.deliveryDate).toLocaleDateString()}</p>
          )}
        </div>

        <div className="flex space-x-2">
          {transaction.status === "proposed" && (
            <>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">Accept</Button>
              <Button size="sm" variant="outline">Counter-Offer</Button>
            </>
          )}
          {transaction.status === "accepted" && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Mark Complete</Button>
          )}
          <Button size="sm" variant="outline">
            <MessageCircle className="w-4 h-4 mr-1" />
            Chat
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BarterPage() {
  const { data: barterTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks/barter"],
    retry: false
  });

  const { data: myTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/barter-transactions/my"],
    retry: false
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Barter Exchange</h1>
          <p className="text-gray-600">Trade skills, services, and time with your neighbors</p>
        </div>

        <div className="mb-6">
          <CreateBarterTaskDialog />
        </div>

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">Available Trades</TabsTrigger>
            <TabsTrigger value="my-transactions">My Exchanges</TabsTrigger>
            <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {tasksLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {barterTasks?.map((task: Task) => (
                  <BarterTaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-transactions" className="space-y-4">
            {transactionsLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {myTransactions?.map((transaction: BarterTransaction) => (
                  <BarterTransactionCard key={transaction.id} transaction={transaction} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="how-it-works" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-emerald-700">How BittieTasks Bartering Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">🤝 Create Exchange</h3>
                    <p className="text-sm text-gray-600">Post what you can offer and what you need in return. Set a fair market value for tax purposes.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">💬 Negotiate Terms</h3>
                    <p className="text-sm text-gray-600">Chat with potential trading partners to agree on specific details and timing.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">✅ Complete Exchange</h3>
                    <p className="text-sm text-gray-600">Both parties fulfill their commitments and mark the exchange as complete.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">⭐ Rate & Review</h3>
                    <p className="text-sm text-gray-600">Leave feedback to build trust and improve the community experience.</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-yellow-800 mb-2">Tax Information</h4>
                  <p className="text-sm text-yellow-700">
                    Barter transactions may be subject to tax reporting. The IRS requires reporting the fair market value of bartered services. 
                    We'll help generate tax forms for transactions over $600.
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-800 mb-2">Popular Parent Exchanges</h4>
                  <ul className="text-sm text-emerald-700 space-y-1">
                    <li>• Babysitting for house cleaning</li>
                    <li>• Tutoring for lawn care</li>
                    <li>• Meal prep for car maintenance</li>
                    <li>• Photography for organizing services</li>
                    <li>• Language lessons for handyman work</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}