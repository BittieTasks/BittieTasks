import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ModerationResult {
  approved: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  reasoning: string;
  confidence: number;
}

export default function ContentModerationTest() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<ModerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testModeration = async () => {
    if (!title || !description) {
      setError('Please provide both title and description');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/moderate/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test moderation');
    } finally {
      setLoading(false);
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'high': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRiskColor = (riskLevel: string, approved: boolean) => {
    if (!approved) return 'border-red-200 bg-red-50';
    switch (riskLevel) {
      case 'low': return 'border-green-200 bg-green-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'high': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 AI Content Moderation Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Task Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title to test..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Task Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description to test..."
              rows={4}
            />
          </div>

          <Button 
            onClick={testModeration} 
            disabled={loading || !title || !description}
            className="w-full"
          >
            {loading ? 'Analyzing Content...' : 'Test AI Moderation'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Card className={`${getRiskColor(result.riskLevel, result.approved)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getRiskIcon(result.riskLevel)}
                    <span className="font-semibold">
                      {result.approved ? 'APPROVED' : 'REJECTED'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Risk: {result.riskLevel.toUpperCase()}
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Reasoning:</span>
                    <p className="text-sm mt-1">{result.reasoning}</p>
                  </div>

                  <div>
                    <span className="font-medium">Confidence:</span>
                    <span className="ml-2 text-sm">
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  {result.flags.length > 0 && (
                    <div>
                      <span className="font-medium">Flags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.flags.map((flag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Scenarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTitle('Help with grocery shopping');
              setDescription('I need someone to help me carry groceries from my car to my kitchen. Should take about 15 minutes.');
            }}
          >
            ✅ Safe Content
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTitle('Make money fast!');
              setDescription('Earn $500 per day working from home! No experience needed. Contact me at 555-123-4567 for details.');
            }}
          >
            ⚠️ Suspicious Content
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTitle('Personal assistance needed');
              setDescription('Looking for help with organizing my home office and filing documents.');
            }}
          >
            ✅ Professional Content
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}