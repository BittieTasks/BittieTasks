import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ArrowLeft, Clock, Star, User, Check } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@shared/schema";

export default function TaskDetailPage() {
  const [, params] = useRoute("/task/:id");
  const taskId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: task, isLoading } = useQuery<Task>({
    queryKey: ["/api/tasks", taskId],
    enabled: !!taskId
  });

  const submitTaskMutation = useMutation({
    mutationFn: async (data: { submissionNotes: string; proofFiles: File[] }) => {
      const formData = new FormData();
      formData.append("submissionNotes", data.submissionNotes);
      formData.append("userId", "default-user-id"); // In real app, get from auth
      
      data.proofFiles.forEach((file) => {
        formData.append("proofFiles", file);
      });

      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit task");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Task Submitted!",
        description: "Your task submission is under review. You'll be notified once it's approved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setSubmissionNotes("");
      setProofFiles([]);
      setIsSubmitting(false);
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your task. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = () => {
    if (!submissionNotes.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide submission notes describing your work.",
        variant: "destructive",
      });
      return;
    }

    if (proofFiles.length === 0) {
      toast({
        title: "Missing Proof",
        description: "Please upload at least one photo or video as proof of completion.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    submitTaskMutation.mutate({ submissionNotes, proofFiles });
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen">
        <div className="animate-pulse p-4">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Task Not Found</h2>
          <p className="text-gray-600 mb-4">The task you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center space-x-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Task Details</h1>
        </div>
      </header>

      <div className="p-4">
        {/* Task Image */}
        {task.imageUrl && (
          <img 
            src={task.imageUrl} 
            alt={task.title}
            className="w-full h-48 object-cover rounded-xl mb-4" 
          />
        )}
        
        {/* Task Info */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h2>
        <p className="text-gray-600 mb-4">{task.description}</p>
        
        {/* Task Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-500 mb-1">Duration</p>
            <p className="font-semibold text-gray-900 flex items-center">
              <Clock size={16} className="mr-1" />
              {task.duration} minutes
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-500 mb-1">Payment</p>
            <p className="font-semibold text-green-600">${task.payment}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-500 mb-1">Difficulty</p>
            <p className="font-semibold text-gray-900 flex items-center">
              <User size={16} className="mr-1" />
              {task.difficulty}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-500 mb-1">Rating</p>
            <p className="font-semibold text-gray-900 flex items-center">
              <Star size={16} className="mr-1" />
              {task.rating}
            </p>
          </div>
        </div>
        
        {/* Requirements */}
        {task.requirements && task.requirements.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Requirements:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {task.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start">
                  <Check size={14} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  {requirement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Submission Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Submission Notes
            </label>
            <Textarea
              placeholder="Describe your work and any additional details..."
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proof of Completion (Photos/Videos)
            </label>
            <FileUpload
              onFilesChange={setProofFiles}
              accept="image/*,video/*"
              multiple
              maxFiles={5}
            />
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl"
          >
            {isSubmitting ? "Submitting..." : "Submit Task"}
          </Button>
        </div>
      </div>
    </div>
  );
}
