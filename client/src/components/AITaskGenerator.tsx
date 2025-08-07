import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, DollarSign, Zap } from 'lucide-react';

interface TaskSuggestion {
  title: string;
  description: string;
  payment: number;
  difficulty: string;
}

interface TaskEnhancement {
  enhancedDescription: string;
  suggestedPayment: number;
  estimatedDuration: number;
}

export default function AITaskGenerator() {
  const [category, setCategory] = useState('');
  const [userSkills, setUserSkills] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('60');
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Task Enhancement
  const [enhanceTitle, setEnhanceTitle] = useState('');
  const [enhanceDescription, setEnhanceDescription] = useState('');
  const [enhanceCategory, setEnhanceCategory] = useState('');
  const [enhancement, setEnhancement] = useState<TaskEnhancement | null>(null);
  const [enhanceLoading, setEnhanceLoading] = useState(false);

  const generateTasks = async () => {
    if (!category) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const response = await fetch('/api/generate-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          userSkills: userSkills.split(',').map(s => s.trim()).filter(Boolean),
          location: location || undefined,
          duration: parseInt(duration) || 60,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSuggestions(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tasks');
    } finally {
      setLoading(false);
    }
  };

  const enhanceTask = async () => {
    if (!enhanceTitle || !enhanceDescription) {
      setError('Please provide both title and description for enhancement');
      return;
    }

    setEnhanceLoading(true);
    setError('');
    setEnhancement(null);

    try {
      const response = await fetch('/api/enhance-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: enhanceTitle,
          description: enhanceDescription,
          category: enhanceCategory || 'General',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setEnhancement(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enhance task');
    } finally {
      setEnhanceLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Task Generation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Task Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="household">Household Tasks</SelectItem>
                  <SelectItem value="childcare">Child Care</SelectItem>
                  <SelectItem value="cooking">Cooking & Meal Prep</SelectItem>
                  <SelectItem value="organizing">Organizing & Cleaning</SelectItem>
                  <SelectItem value="errands">Errands & Shopping</SelectItem>
                  <SelectItem value="selfcare">Self Care</SelectItem>
                  <SelectItem value="garden">Garden & Outdoor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
                min="15"
                max="480"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Your Skills (comma-separated)</label>
            <Input
              value={userSkills}
              onChange={(e) => setUserSkills(e.target.value)}
              placeholder="cooking, organizing, childcare, cleaning..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location Context (optional)</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="suburban neighborhood, downtown area, etc."
            />
          </div>

          <Button 
            onClick={generateTasks} 
            disabled={loading || !category}
            className="w-full"
          >
            {loading ? 'Generating Tasks...' : 'Generate AI Task Suggestions'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">AI-Generated Task Suggestions</h3>
              {suggestions.map((task, index) => (
                <Card key={index} className="border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{task.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(task.difficulty)}>
                          {task.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-green-600 font-semibold">
                          <DollarSign className="w-4 h-4" />
                          {task.payment}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{task.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Enhancement Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            AI Task Enhancement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Task Title</label>
            <Input
              value={enhanceTitle}
              onChange={(e) => setEnhanceTitle(e.target.value)}
              placeholder="Enter your task title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Basic Description</label>
            <Textarea
              value={enhanceDescription}
              onChange={(e) => setEnhanceDescription(e.target.value)}
              placeholder="Enter a basic description of your task..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Select value={enhanceCategory} onValueChange={setEnhanceCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="household">Household Tasks</SelectItem>
                <SelectItem value="childcare">Child Care</SelectItem>
                <SelectItem value="cooking">Cooking & Meal Prep</SelectItem>
                <SelectItem value="organizing">Organizing & Cleaning</SelectItem>
                <SelectItem value="errands">Errands & Shopping</SelectItem>
                <SelectItem value="selfcare">Self Care</SelectItem>
                <SelectItem value="garden">Garden & Outdoor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={enhanceTask} 
            disabled={enhanceLoading || !enhanceTitle || !enhanceDescription}
            className="w-full"
          >
            {enhanceLoading ? 'Enhancing Task...' : 'Enhance with AI'}
          </Button>

          {enhancement && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">AI-Enhanced Task</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Enhanced Description:</label>
                    <p className="text-sm mt-1">{enhancement.enhancedDescription}</p>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">
                        Suggested Payment: ${enhancement.suggestedPayment}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        Estimated Duration: {enhancement.estimatedDuration} min
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}