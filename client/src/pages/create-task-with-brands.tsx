import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AccessibleForm, FormField } from "@/components/ui/accessible-form";
import { AccessibleButton } from "@/components/ui/accessible-button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { ArrowLeft, DollarSign, Package, Star, ShoppingCart } from "lucide-react";
import { z } from "zod";
import type { TaskCategory, AffiliateProduct } from "@shared/schema";

const createTaskSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  categoryId: z.number().min(1, "Please select a category"),
  payment: z.number().min(5, "Payment must be at least $5"),
  maxParticipants: z.number().min(1).max(10).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  scheduledFor: z.string().min(1, "Please select a date and time"),
  location: z.string().min(1, "Location is required"),
  requirements: z.array(z.string()).optional(),
  affiliateProducts: z.array(z.number()).optional(),
});

type CreateTaskForm = z.infer<typeof createTaskSchema>;

export default function CreateTaskWithBrands() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<TaskCategory[]>({
    queryKey: ["/api/categories"]
  });

  const { data: affiliateProducts = [], isLoading: productsLoading } = useQuery<AffiliateProduct[]>({
    queryKey: ["/api/affiliate-products"]
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: CreateTaskForm) => {
      return await apiRequest("POST", "/api/tasks", {
        ...data,
        affiliateProducts: selectedProducts,
        scheduledFor: new Date(data.scheduledFor).toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your task has been created and is now available to the community.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProductToggle = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getCommissionEarnings = () => {
    const selectedProductsData = affiliateProducts.filter(p => selectedProducts.includes(p.id));
    const totalCommission = selectedProductsData.reduce((sum, product) => 
      sum + (product.price * product.commissionRate / 100), 0
    );
    return totalCommission;
  };

  if (categoriesLoading || productsLoading) {
    return (
      <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen">
        <div className="animate-pulse p-4">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center space-x-3">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Create Task with Brands</h1>
        </div>
      </header>

      <main className="p-4 pb-20">
        {/* Affiliate Earnings Preview */}
        {selectedProducts.length > 0 && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-800">Bonus Earnings!</h3>
                  <p className="text-sm text-green-600">
                    Extra ${getCommissionEarnings().toFixed(2)} from affiliate products
                  </p>
                </div>
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
        )}

        <AccessibleForm
          schema={createTaskSchema}
          onSubmit={(data) => createTaskMutation.mutate(data)}
          title="Create Community Task"
          description="Share a task you're already doing and earn money from neighbors who want to join"
          submitButtonText="Create Task"
          isLoading={createTaskMutation.isPending}
        >
          <FormField>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Weekly grocery run to Whole Foods"
              required
            />
          </FormField>

          <FormField>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what you'll be doing and how neighbors can benefit from joining..."
              rows={4}
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField>
              <Label htmlFor="categoryId">Category</Label>
              <Select name="categoryId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select name="difficulty" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField>
              <Label htmlFor="payment">Payment per Person ($)</Label>
              <Input
                id="payment"
                name="payment"
                type="number"
                min="5"
                step="5"
                placeholder="25"
                required
              />
            </FormField>

            <FormField>
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                min="1"
                max="10"
                placeholder="3"
              />
            </FormField>
          </div>

          <FormField>
            <Label htmlFor="scheduledFor">Date & Time</Label>
            <Input
              id="scheduledFor"
              name="scheduledFor"
              type="datetime-local"
              required
            />
          </FormField>

          <FormField>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g., Target on Main Street"
              required
            />
          </FormField>

          {/* Affiliate Products Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Recommend Products (Optional)</h3>
            </div>
            <p className="text-sm text-gray-600">
              Recommend products you'll be using for this task. You'll earn commission if neighbors purchase through your recommendations!
            </p>

            <div className="space-y-3">
              {affiliateProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedProducts.includes(product.id) ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleProductToggle(product.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleProductToggle(product.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{product.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold">${product.price}</span>
                            <Badge variant="secondary" className="text-xs">
                              +${(product.price * product.commissionRate / 100).toFixed(2)} commission
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{product.description}</p>
                        <div className="flex items-center mt-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-2">
                            {product.rating} ({product.reviewCount} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Selected Products</h4>
                </div>
                <div className="space-y-2">
                  {affiliateProducts
                    .filter(p => selectedProducts.includes(p.id))
                    .map(product => (
                      <div key={product.id} className="flex justify-between text-sm">
                        <span className="text-blue-700">{product.name}</span>
                        <span className="font-medium text-blue-800">
                          +${(product.price * product.commissionRate / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  <div className="border-t border-blue-200 pt-2 flex justify-between font-semibold">
                    <span className="text-blue-800">Total Bonus:</span>
                    <span className="text-blue-800">+${getCommissionEarnings().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </AccessibleForm>
      </main>
    </div>
  );
}