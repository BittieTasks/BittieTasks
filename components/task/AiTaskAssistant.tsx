'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Sparkles, Lightbulb, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AiTaskAssistantProps {
  taskType: 'community' | 'barter'
  currentData: {
    title: string
    description: string
    offering?: string
    seeking?: string
  }
  onUpdateData: (updates: any) => void
  onApplySuggestions: (suggestions: any) => void
}

interface TaskSuggestion {
  title: string
  description: string
  category: string
  estimatedDuration: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedPrice?: number
  tags: string[]
  requirements?: string[]
}

export default function AiTaskAssistant({ 
  taskType, 
  currentData, 
  onUpdateData, 
  onApplySuggestions 
}: AiTaskAssistantProps) {
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([])
  const [enhancement, setEnhancement] = useState<{
    enhancedDescription: string
    suggestions: string[]
  } | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [contentCheck, setContentCheck] = useState<any>(null)
  const [ideaInput, setIdeaInput] = useState('')

  const enhanceDescription = async () => {
    if (!currentData.title || !currentData.description) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/ai/task-assistance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enhance_description',
          data: {
            title: currentData.title,
            description: currentData.description,
            type: taskType
          }
        })
      })
      
      const result = await response.json()
      setEnhancement(result)
    } catch (error) {
      console.error('Enhancement failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeTask = async () => {
    if (!currentData.title || !currentData.description) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/ai/task-assistance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_task',
          data: {
            title: currentData.title,
            description: currentData.description,
            type: taskType,
            offering: currentData.offering,
            seeking: currentData.seeking
          }
        })
      })
      
      const result = await response.json()
      setAnalysis(result)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateIdeas = async () => {
    if (!ideaInput.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/ai/task-assistance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_suggestions',
          data: {
            userInput: ideaInput,
            type: taskType
          }
        })
      })
      
      const result = await response.json()
      setSuggestions(result.suggestions || [])
    } catch (error) {
      console.error('Suggestion generation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkContent = async () => {
    const content = `${currentData.title} ${currentData.description} ${currentData.offering || ''} ${currentData.seeking || ''}`.trim()
    if (!content) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/ai/task-assistance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check_content',
          data: { content }
        })
      })
      
      const result = await response.json()
      setContentCheck(result)
    } catch (error) {
      console.error('Content check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyEnhancement = () => {
    if (enhancement) {
      onUpdateData({ description: enhancement.enhancedDescription })
      setEnhancement(null)
    }
  }

  const applySuggestion = (suggestion: TaskSuggestion) => {
    onApplySuggestions({
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      duration: suggestion.estimatedDuration,
      difficulty: suggestion.difficulty,
      earningPotential: suggestion.estimatedPrice?.toString() || '',
      tags: suggestion.tags?.join(', ') || '',
      requirements: suggestion.requirements?.join('\n') || ''
    })
    setSuggestions([])
  }

  const applyAnalysis = () => {
    if (analysis) {
      onApplySuggestions({
        category: analysis.category,
        difficulty: analysis.difficulty,
        duration: analysis.estimatedDuration,
        earningPotential: analysis.estimatedPrice?.toString() || '',
        tags: analysis.tags?.join(', ') || ''
      })
    }
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50" data-testid="card-ai-assistant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <Sparkles className="h-5 w-5" />
          AI Task Assistant
        </CardTitle>
        <CardDescription>
          Get intelligent suggestions and improvements for your {taskType} task
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Task Idea Generator */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder={`Describe what you need help with or want to trade...`}
              value={ideaInput}
              onChange={(e) => setIdeaInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateIdeas()}
              data-testid="input-ai-idea"
            />
            <Button 
              onClick={generateIdeas}
              disabled={loading || !ideaInput.trim()}
              size="sm"
              data-testid="button-generate-ideas"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
              Ideas
            </Button>
          </div>
        </div>

        {/* Generated Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-purple-700">Task Suggestions</h4>
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="p-3 border-purple-200" data-testid={`suggestion-${index}`}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{suggestion.title}</h5>
                    <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                    <div className="flex gap-1 mt-2">
                      <Badge variant="secondary" className="text-xs">{suggestion.category}</Badge>
                      <Badge variant="outline" className="text-xs">{suggestion.difficulty}</Badge>
                      {suggestion.estimatedPrice && (
                        <Badge variant="outline" className="text-xs">${suggestion.estimatedPrice}</Badge>
                      )}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => applySuggestion(suggestion)}
                    data-testid={`button-apply-suggestion-${index}`}
                  >
                    Use This
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Enhancement and Analysis Tools */}
        {(currentData.title && currentData.description) && (
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={enhanceDescription}
              disabled={loading}
              size="sm"
              variant="outline"
              data-testid="button-enhance-description"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Enhance Description
            </Button>
            
            <Button 
              onClick={analyzeTask}
              disabled={loading}
              size="sm"
              variant="outline"
              data-testid="button-analyze-task"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Smart Analysis
            </Button>
            
            <Button 
              onClick={checkContent}
              disabled={loading}
              size="sm"
              variant="outline"
              data-testid="button-check-content"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
              Safety Check
            </Button>
          </div>
        )}

        {/* Enhancement Results */}
        {enhancement && (
          <Alert className="border-green-200 bg-green-50" data-testid="alert-enhancement">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-2">
                <div>
                  <strong>Enhanced Description:</strong>
                  <p className="mt-1 text-sm">{enhancement.enhancedDescription}</p>
                </div>
                {enhancement.suggestions.length > 0 && (
                  <div>
                    <strong>Suggestions:</strong>
                    <ul className="mt-1 text-sm space-y-1">
                      {enhancement.suggestions.map((tip, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-green-600">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button size="sm" onClick={applyEnhancement} data-testid="button-apply-enhancement">
                  Apply Enhancement
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Analysis Results */}
        {analysis && (
          <Alert className="border-blue-200 bg-blue-50" data-testid="alert-analysis">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">Category: {analysis.category}</Badge>
                  <Badge variant="outline">Difficulty: {analysis.difficulty}</Badge>
                  <Badge variant="outline">Duration: {analysis.estimatedDuration}</Badge>
                  {analysis.estimatedPrice && (
                    <Badge variant="outline">Suggested: ${analysis.estimatedPrice}</Badge>
                  )}
                </div>
                {analysis.improvements?.length > 0 && (
                  <div>
                    <strong>Improvements:</strong>
                    <ul className="mt-1 text-sm space-y-1">
                      {analysis.improvements.map((tip: string, index: number) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-blue-600">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button size="sm" onClick={applyAnalysis} data-testid="button-apply-analysis">
                  Apply Analysis
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Content Check Results */}
        {contentCheck && (
          <Alert 
            className={contentCheck.isAppropriate 
              ? "border-green-200 bg-green-50" 
              : "border-red-200 bg-red-50"
            }
            data-testid="alert-content-check"
          >
            {contentCheck.isAppropriate ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              <div className="space-y-2">
                <strong>
                  {contentCheck.isAppropriate 
                    ? "✓ Content looks good!" 
                    : "⚠ Content needs attention"
                  }
                </strong>
                {contentCheck.flags?.length > 0 && (
                  <div>
                    <p className="text-sm">Issues found:</p>
                    <ul className="mt-1 text-sm space-y-1">
                      {contentCheck.flags.map((flag: string, index: number) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-red-600">•</span>
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}