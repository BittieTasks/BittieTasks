import Anthropic from '@anthropic-ai/sdk';

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

export interface ModerationResult {
  isApproved: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  reasoning: string;
  confidence: number;
}

class ContentModerationService {
  private anthropic: Anthropic;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('ANTHROPIC_API_KEY not configured, content moderation disabled');
      this.anthropic = null as any;
      return;
    }
    
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  private extractTextFromResponse(response: any): string {
    try {
      if (response.content && Array.isArray(response.content)) {
        const textBlock = response.content.find((block: any) => block.type === 'text');
        return textBlock?.text || '{}';
      }
      return '{}';
    } catch (error) {
      console.error('Error extracting text from response:', error);
      return '{}';
    }
  }

  async moderateTaskDescription(title: string, description: string): Promise<ModerationResult> {
    if (!this.anthropic) {
      return {
        isApproved: true,
        riskLevel: 'medium',
        flags: ['moderation_disabled'],
        reasoning: 'Content moderation not configured',
        confidence: 0.0
      };
    }

    const prompt = `You are a content moderator for BittieTasks, a family-friendly platform where parents earn money through community tasks. 

Analyze this task posting for safety and appropriateness:

Title: "${title}"
Description: "${description}"

Check for:
- Inappropriate content (sexual, violent, illegal activities)
- Scams or fraudulent schemes
- Personal information sharing (addresses, phone numbers)
- Unsafe activities for families/children
- Spam or promotional content
- Tasks that violate platform policies

Respond in JSON format with:
{
  "isApproved": true,
  "riskLevel": "low",
  "flags": [],
  "reasoning": "Content appears appropriate",
  "confidence": 0.95
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = this.extractTextFromResponse(response);
      const result = JSON.parse(textContent);
      
      return {
        isApproved: result.isApproved || false,
        riskLevel: result.riskLevel || 'medium',
        flags: result.flags || [],
        reasoning: result.reasoning || '',
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5))
      };
    } catch (error) {
      console.error('Content moderation error:', error);
      return {
        isApproved: false,
        riskLevel: 'high',
        flags: ['moderation_error'],
        reasoning: 'Unable to verify content safety',
        confidence: 0.0
      };
    }
  }

  async moderateMessage(message: string, context?: string): Promise<ModerationResult> {
    if (!this.anthropic) {
      return {
        isApproved: true,
        riskLevel: 'low',
        flags: ['moderation_disabled'],
        reasoning: 'Message moderation not configured',
        confidence: 0.0
      };
    }

    const prompt = `You are a content moderator for BittieTasks messaging system. 

Analyze this message for safety and appropriateness:

Message: "${message}"
${context ? `Context: ${context}` : ''}

Respond in JSON format with:
{
  "isApproved": true,
  "riskLevel": "low", 
  "flags": [],
  "reasoning": "Message appears appropriate",
  "confidence": 0.85
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = this.extractTextFromResponse(response);
      const result = JSON.parse(textContent);
      
      return {
        isApproved: result.isApproved !== false,
        riskLevel: result.riskLevel || 'low',
        flags: result.flags || [],
        reasoning: result.reasoning || '',
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5))
      };
    } catch (error) {
      console.error('Message moderation error:', error);
      return {
        isApproved: true,
        riskLevel: 'medium',
        flags: ['requires_review'],
        reasoning: 'Unable to complete automatic moderation',
        confidence: 0.0
      };
    }
  }

  async moderateProfileContent(username: string, bio?: string, skills?: string[]): Promise<ModerationResult> {
    if (!this.anthropic) {
      return {
        isApproved: true,
        riskLevel: 'low',
        flags: ['moderation_disabled'],
        reasoning: 'Profile moderation not configured',
        confidence: 0.0
      };
    }

    const content = `Username: ${username}
${bio ? `Bio: ${bio}` : ''}
${skills ? `Skills: ${skills.join(', ')}` : ''}`;

    const prompt = `You are a content moderator for BittieTasks user profiles.

Analyze this profile content: ${content}

Respond in JSON format with:
{
  "isApproved": true,
  "riskLevel": "low",
  "flags": [],
  "reasoning": "Profile content is appropriate", 
  "confidence": 0.90
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = this.extractTextFromResponse(response);
      const result = JSON.parse(textContent);
      
      return {
        isApproved: result.isApproved !== false,
        riskLevel: result.riskLevel || 'low',
        flags: result.flags || [],
        reasoning: result.reasoning || '',
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5))
      };
    } catch (error) {
      console.error('Profile moderation error:', error);
      return {
        isApproved: false,
        riskLevel: 'high',
        flags: ['moderation_error'],
        reasoning: 'Unable to verify profile safety',
        confidence: 0.0
      };
    }
  }

  isEnabled(): boolean {
    return !!this.anthropic;
  }
}

export const contentModerationService = new ContentModerationService();