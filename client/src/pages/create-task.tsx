import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, DollarSign, Clock, Users } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { TaskCategory, InsertTask } from "@shared/schema";

export default function CreateTaskPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    payment: "",
    duration: "",
    difficulty: "easy" as "easy" | "medium" | "hard",
    requirements: "",
    taskType: "shared" as "shared" | "solo"
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<TaskCategory[]>({
    queryKey: ["/api/categories"]
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: InsertTask) => {
      const response = await apiRequest("POST", "/api/tasks", taskData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Task Created!",
        description: "Your task has been posted and is now available for your community.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Task",
        description: error.message || "There was an error creating your task.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.payment || !formData.categoryId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const taskData: InsertTask = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      categoryId: formData.categoryId,
      payment: formData.payment,
      duration: formData.duration ? parseInt(formData.duration) : null,
      difficulty: formData.difficulty,
      requirements: formData.requirements.trim() ? [formData.requirements.trim()] : null,
      taskType: formData.taskType,
      imageUrl: null,
      sponsorInfo: null
    };

    createTaskMutation.mutate(taskData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (categoriesLoading) {
    return (
      <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen">
        <div className="animate-pulse p-4">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-40 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Create New Task</h1>
          </div>
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Plus className="text-white" size={16} />
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="p-4 space-y-6">
        {/* Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Share Your Daily Task</CardTitle>
            <CardDescription>
              Create a task you're already planning to do and invite neighbors to join you for a fee.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-sm font-medium text-green-700 mb-1">
                <Users size={16} />
                <span>Community Earning Model</span>
              </div>
              <p className="text-xs text-gray-600">
                Set a price for neighbors to join your task. You earn money while building community connections!
              </p>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Grocery shopping at Whole Foods"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.categoryId} onValueChange={(value) => handleInputChange("categoryId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your task in detail. What will you be doing? What should neighbors expect?"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="payment">Price for Neighbors to Join *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                id="payment"
                type="number"
                step="0.01"
                min="1"
                placeholder="25.00"
                value={formData.payment}
                onChange={(e) => handleInputChange("payment", e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500">
              This is what each neighbor pays to join your task. You can earn multiple payments if several neighbors join!
            </p>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Estimated Duration (minutes)</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                placeholder="120"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500">
              Enter duration in minutes (e.g., 120 for 2 hours)
            </p>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy - Anyone can do this</SelectItem>
                <SelectItem value="medium">Medium - Some effort required</SelectItem>
                <SelectItem value="hard">Hard - Requires skill or experience</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Task Type */}
          <div className="space-y-2">
            <Label htmlFor="taskType">Task Type</Label>
            <Select value={formData.taskType} onValueChange={(value) => handleInputChange("taskType", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shared">Shared - Neighbors join me</SelectItem>
                <SelectItem value="solo">Solo - I do this alone but share the benefit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Special Requirements</Label>
            <Textarea
              id="requirements"
              placeholder="Any special requirements or things neighbors should bring/know..."
              value={formData.requirements}
              onChange={(e) => handleInputChange("requirements", e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Earning Preview */}
          {formData.payment && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Earning Potential</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>1 neighbor joins:</span>
                    <span className="font-bold text-green-600">${formData.payment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2 neighbors join:</span>
                    <span className="font-bold text-green-600">${(parseFloat(formData.payment) * 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3 neighbors join:</span>
                    <span className="font-bold text-green-600">${(parseFloat(formData.payment) * 3).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={createTaskMutation.isPending}
          >
            {createTaskMutation.isPending ? "Creating Task..." : "Create Task"}
          </Button>
        </form>
      </div>
    </div>
  );
}