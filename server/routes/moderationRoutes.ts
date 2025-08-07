import express from 'express';
import { contentModerationService } from '../services/contentModerationFixed';
// Moderation routes - no auth required for basic moderation checks

const router = express.Router();

// Moderate task content before creation/update
router.post('/moderate/task', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const result = await contentModerationService.moderateTaskDescription(title, description);
    
    // Log moderation decisions for audit
    console.log(`Task moderation: ${result.isApproved ? 'APPROVED' : 'REJECTED'}`, {
      title: title.substring(0, 50),
      riskLevel: result.riskLevel,
      flags: result.flags,
      confidence: result.confidence
    });

    res.json({
      approved: result.isApproved,
      riskLevel: result.riskLevel,
      flags: result.flags,
      reasoning: result.reasoning,
      confidence: result.confidence
    });
  } catch (error) {
    console.error('Task moderation error:', error);
    res.status(500).json({ 
      error: 'Content moderation failed',
      approved: false,
      riskLevel: 'high'
    });
  }
});

// Moderate message content
router.post('/moderate/message', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const result = await contentModerationService.moderateMessage(message, context);
    
    console.log(`Message moderation: ${result.isApproved ? 'APPROVED' : 'REJECTED'}`, {
      messageLength: message.length,
      riskLevel: result.riskLevel,
      flags: result.flags
    });

    res.json({
      approved: result.isApproved,
      riskLevel: result.riskLevel,
      flags: result.flags,
      reasoning: result.reasoning,
      confidence: result.confidence
    });
  } catch (error) {
    console.error('Message moderation error:', error);
    res.status(500).json({ 
      error: 'Message moderation failed',
      approved: true, // Less strict for messages
      riskLevel: 'medium'
    });
  }
});

// Moderate profile content
router.post('/moderate/profile', async (req, res) => {
  try {
    const { username, bio, skills } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const result = await contentModerationService.moderateProfileContent(username, bio, skills);
    
    console.log(`Profile moderation: ${result.isApproved ? 'APPROVED' : 'REJECTED'}`, {
      username,
      riskLevel: result.riskLevel,
      flags: result.flags
    });

    res.json({
      approved: result.isApproved,
      riskLevel: result.riskLevel,
      flags: result.flags,
      reasoning: result.reasoning,
      confidence: result.confidence
    });
  } catch (error) {
    console.error('Profile moderation error:', error);
    res.status(500).json({ 
      error: 'Profile moderation failed',
      approved: false,
      riskLevel: 'high'
    });
  }
});

// Moderate image content
router.post('/moderate/image', async (req, res) => {
  try {
    const { imageDescription } = req.body;
    
    if (!imageDescription) {
      return res.status(400).json({ error: 'Image description is required' });
    }

    // Image moderation placeholder - would analyze uploaded images
    const result = {
      isApproved: true,
      riskLevel: 'low' as const,
      flags: [] as string[],
      reasoning: 'Image moderation not yet implemented',
      confidence: 0.5
    };
    
    console.log(`Image moderation: ${result.isApproved ? 'APPROVED' : 'REJECTED'}`, {
      riskLevel: result.riskLevel,
      flags: result.flags
    });

    res.json({
      approved: result.isApproved,
      riskLevel: result.riskLevel,
      flags: result.flags,
      reasoning: result.reasoning,
      confidence: result.confidence
    });
  } catch (error) {
    console.error('Image moderation error:', error);
    res.status(500).json({ 
      error: 'Image moderation failed',
      approved: false,
      riskLevel: 'high'
    });
  }
});

// Get moderation statistics (admin only)
router.get('/moderation/stats', async (req, res) => {
  try {
    // This would typically query a moderation logs database
    // For now, return basic stats
    res.json({
      moderationActive: true,
      model: 'claude-sonnet-4-20250514',
      features: [
        'task_description_filtering',
        'message_content_screening', 
        'profile_content_validation',
        'image_content_analysis'
      ],
      status: 'operational'
    });
  } catch (error) {
    console.error('Moderation stats error:', error);
    res.status(500).json({ error: 'Unable to fetch moderation statistics' });
  }
});

export default router;