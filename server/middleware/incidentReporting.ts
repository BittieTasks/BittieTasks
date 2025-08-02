import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Incident types and severity levels
export type IncidentType = 
  | 'child_injury'
  | 'child_abuse_suspected'
  | 'property_damage'
  | 'safety_violation'
  | 'inappropriate_behavior'
  | 'emergency_situation'
  | 'background_check_issue'
  | 'platform_misuse'
  | 'other';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface IncidentReport {
  id: string;
  reporterId: string;
  reporterType: 'task_provider' | 'task_requester' | 'platform_admin' | 'anonymous';
  incidentType: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  location: {
    address?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  dateTime: Date;
  involvedParties: {
    userId?: string;
    name?: string;
    role: 'task_provider' | 'task_requester' | 'child' | 'other';
    age?: number;
  }[];
  witnesses?: {
    name: string;
    contact: string;
    statement?: string;
  }[];
  emergencyServices: {
    called: boolean;
    services?: ('police' | 'fire' | 'ambulance' | 'child_services')[];
    reportNumbers?: string[];
  };
  evidence: {
    photos?: string[];
    videos?: string[];
    documents?: string[];
    other?: string[];
  };
  immediateActions: string;
  status: 'reported' | 'investigating' | 'resolved' | 'escalated' | 'closed';
  assignedTo?: string;
  resolution?: string;
  followUpRequired: boolean;
  legalNotification: {
    required: boolean;
    completed: boolean;
    agencies?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Incident report validation schema
const incidentReportSchema = z.object({
  incidentType: z.enum([
    'child_injury',
    'child_abuse_suspected', 
    'property_damage',
    'safety_violation',
    'inappropriate_behavior',
    'emergency_situation',
    'background_check_issue',
    'platform_misuse',
    'other'
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  location: z.object({
    address: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().length(2, 'State must be 2-letter code'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  }),
  dateTime: z.string().transform(str => new Date(str)),
  involvedParties: z.array(z.object({
    userId: z.string().optional(),
    name: z.string().optional(),
    role: z.enum(['task_provider', 'task_requester', 'child', 'other']),
    age: z.number().optional(),
  })).min(1, 'At least one involved party is required'),
  witnesses: z.array(z.object({
    name: z.string().min(1),
    contact: z.string().min(1),
    statement: z.string().optional(),
  })).optional(),
  emergencyServices: z.object({
    called: z.boolean(),
    services: z.array(z.enum(['police', 'fire', 'ambulance', 'child_services'])).optional(),
    reportNumbers: z.array(z.string()).optional(),
  }),
  immediateActions: z.string().min(10, 'Describe immediate actions taken'),
});

// Mock incident storage (use database in production)
const incidentReports = new Map<string, IncidentReport>();

// Critical incidents that require immediate escalation
const CRITICAL_INCIDENT_TYPES: IncidentType[] = [
  'child_injury',
  'child_abuse_suspected',
  'emergency_situation'
];

// Incidents requiring mandatory reporting to authorities
const MANDATORY_REPORTING_TYPES: IncidentType[] = [
  'child_abuse_suspected',
  'child_injury'
];

// Create incident report
export const createIncidentReport = async (req: Request, res: Response) => {
  try {
    const reporterId = (req as any).userId || 'anonymous';
    const reportData = incidentReportSchema.parse(req.body);
    
    // Generate unique incident ID
    const incidentId = generateIncidentId();
    
    // Determine severity if not provided or assess if underestimated
    const assessedSeverity = assessIncidentSeverity(reportData);
    
    // Create incident report
    const incident: IncidentReport = {
      id: incidentId,
      reporterId,
      reporterType: reporterId === 'anonymous' ? 'anonymous' : 'task_provider', // Simplified
      incidentType: reportData.incidentType,
      severity: assessedSeverity,
      title: reportData.title,
      description: reportData.description,
      location: reportData.location,
      dateTime: reportData.dateTime,
      involvedParties: reportData.involvedParties,
      witnesses: reportData.witnesses,
      emergencyServices: reportData.emergencyServices,
      evidence: { photos: [], videos: [], documents: [], other: [] },
      immediateActions: reportData.immediateActions,
      status: 'reported',
      followUpRequired: CRITICAL_INCIDENT_TYPES.includes(reportData.incidentType),
      legalNotification: {
        required: MANDATORY_REPORTING_TYPES.includes(reportData.incidentType),
        completed: false,
        agencies: getMandatoryReportingAgencies(reportData.incidentType, reportData.location.state)
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store incident report
    incidentReports.set(incidentId, incident);
    
    // Handle critical incidents immediately
    if (CRITICAL_INCIDENT_TYPES.includes(reportData.incidentType)) {
      await handleCriticalIncident(incident);
    }
    
    // Handle mandatory reporting
    if (MANDATORY_REPORTING_TYPES.includes(reportData.incidentType)) {
      await initiateMandatoryReporting(incident);
    }
    
    // Log incident for monitoring
    console.log(`Incident ${incidentId} reported: ${reportData.incidentType} - ${assessedSeverity} severity`);
    
    res.status(201).json({
      incidentId,
      status: 'reported',
      severity: assessedSeverity,
      mandatoryReporting: incident.legalNotification.required,
      message: 'Incident report submitted successfully',
      nextSteps: getNextSteps(incident)
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'INVALID_INCIDENT_DATA',
        message: 'Invalid incident report data',
        details: error.errors
      });
    }
    
    console.error('Incident report creation error:', error);
    res.status(500).json({
      error: 'INCIDENT_REPORT_FAILED',
      message: 'Unable to submit incident report'
    });
  }
};

// Get incident report
export const getIncidentReport = async (req: Request, res: Response) => {
  try {
    const { incidentId } = req.params;
    const userId = (req as any).userId;
    
    const incident = incidentReports.get(incidentId);
    
    if (!incident) {
      return res.status(404).json({
        error: 'INCIDENT_NOT_FOUND',
        message: 'Incident report not found'
      });
    }
    
    // Check if user has access to this incident
    const hasAccess = (
      incident.reporterId === userId ||
      incident.involvedParties.some(party => party.userId === userId) ||
      (req as any).isAdmin
    );
    
    if (!hasAccess) {
      return res.status(403).json({
        error: 'ACCESS_DENIED',
        message: 'Access denied to this incident report'
      });
    }
    
    res.json({
      incident: sanitizeIncidentForUser(incident, userId),
      timeline: await getIncidentTimeline(incidentId)
    });
    
  } catch (error) {
    console.error('Get incident report error:', error);
    res.status(500).json({
      error: 'INCIDENT_RETRIEVAL_FAILED',
      message: 'Unable to retrieve incident report'
    });
  }
};

// Update incident report status
export const updateIncidentStatus = async (req: Request, res: Response) => {
  try {
    const { incidentId } = req.params;
    const { status, resolution, assignedTo } = req.body;
    const userId = (req as any).userId;
    
    const incident = incidentReports.get(incidentId);
    
    if (!incident) {
      return res.status(404).json({
        error: 'INCIDENT_NOT_FOUND',
        message: 'Incident report not found'
      });
    }
    
    // Only admins can update incident status
    if (!(req as any).isAdmin) {
      return res.status(403).json({
        error: 'ADMIN_REQUIRED',
        message: 'Only administrators can update incident status'
      });
    }
    
    // Update incident
    incident.status = status;
    incident.resolution = resolution;
    incident.assignedTo = assignedTo;
    incident.updatedAt = new Date();
    
    incidentReports.set(incidentId, incident);
    
    // Log status update
    console.log(`Incident ${incidentId} status updated to ${status} by ${userId}`);
    
    res.json({
      incidentId,
      status: incident.status,
      message: 'Incident status updated successfully'
    });
    
  } catch (error) {
    console.error('Update incident status error:', error);
    res.status(500).json({
      error: 'STATUS_UPDATE_FAILED',
      message: 'Unable to update incident status'
    });
  }
};

// Assess incident severity
function assessIncidentSeverity(reportData: any): IncidentSeverity {
  // Child-related incidents are automatically high/critical
  if (reportData.incidentType === 'child_abuse_suspected') return 'critical';
  if (reportData.incidentType === 'child_injury') {
    return reportData.emergencyServices.called ? 'critical' : 'high';
  }
  
  // Emergency situations are critical
  if (reportData.incidentType === 'emergency_situation') return 'critical';
  
  // Property damage assessment
  if (reportData.incidentType === 'property_damage') {
    if (reportData.description.toLowerCase().includes('extensive') || 
        reportData.description.toLowerCase().includes('major')) {
      return 'high';
    }
    return 'medium';
  }
  
  // Safety violations
  if (reportData.incidentType === 'safety_violation') return 'medium';
  
  // Default to provided severity or medium
  return reportData.severity || 'medium';
}

// Handle critical incidents
async function handleCriticalIncident(incident: IncidentReport): Promise<void> {
  console.log(`CRITICAL INCIDENT ALERT: ${incident.id} - ${incident.incidentType}`);
  
  // Immediate notifications
  const notifications = [
    'Platform safety team notified',
    'Legal team alerted',
    'Insurance company contacted'
  ];
  
  if (incident.incidentType === 'child_abuse_suspected') {
    notifications.push('Child protective services notification initiated');
  }
  
  if (incident.incidentType === 'child_injury' && incident.emergencyServices.called) {
    notifications.push('Emergency services coordination activated');
  }
  
  // In production, send actual notifications
  // await sendCriticalIncidentNotifications(incident);
  
  console.log('Critical incident notifications:', notifications);
}

// Initiate mandatory reporting
async function initiateMandatoryReporting(incident: IncidentReport): Promise<void> {
  const agencies = incident.legalNotification.agencies || [];
  
  console.log(`Initiating mandatory reporting for incident ${incident.id} to:`, agencies);
  
  // In production, integrate with state reporting systems
  // This would include:
  // - Child protective services reporting
  // - Law enforcement notification
  // - State agency reporting systems
  // - Documentation of compliance
  
  // Update incident to mark reporting as initiated
  incident.legalNotification.completed = true;
  incident.updatedAt = new Date();
}

// Get mandatory reporting agencies by state
function getMandatoryReportingAgencies(incidentType: IncidentType, state: string): string[] {
  const agencies: string[] = [];
  
  if (incidentType === 'child_abuse_suspected') {
    agencies.push(`${state} Department of Children and Family Services`);
    agencies.push(`${state} Child Protective Services`);
    agencies.push('Local Law Enforcement');
  }
  
  if (incidentType === 'child_injury') {
    agencies.push(`${state} Child Protective Services`);
  }
  
  return agencies;
}

// Get next steps for incident
function getNextSteps(incident: IncidentReport): string[] {
  const steps: string[] = [];
  
  if (incident.legalNotification.required) {
    steps.push('Mandatory reporting to authorities has been initiated');
    steps.push('You may be contacted by investigators');
  }
  
  if (incident.followUpRequired) {
    steps.push('Platform safety team will conduct investigation');
    steps.push('You will receive updates on the investigation status');
  }
  
  steps.push('Document any additional evidence or witness statements');
  steps.push('Cooperate with any official investigations');
  
  if (incident.severity === 'critical') {
    steps.push('Immediate safety measures may be implemented');
    steps.push('Account access may be temporarily restricted pending investigation');
  }
  
  return steps;
}

// Sanitize incident data for user view
function sanitizeIncidentForUser(incident: IncidentReport, userId: string): Partial<IncidentReport> {
  // Remove sensitive information that users shouldn't see
  const sanitized = { ...incident };
  
  // Remove internal investigation details
  delete (sanitized as any).assignedTo;
  delete (sanitized as any).legalNotification;
  
  // Hide other users' personal information if not admin
  if (incident.reporterId !== userId) {
    sanitized.involvedParties = incident.involvedParties.map(party => ({
      ...party,
      userId: party.userId === userId ? party.userId : undefined
    }));
  }
  
  return sanitized;
}

// Get incident timeline
async function getIncidentTimeline(incidentId: string): Promise<any[]> {
  // In production, retrieve from audit log
  return [
    {
      timestamp: new Date(),
      action: 'Incident reported',
      actor: 'User',
      details: 'Initial incident report submitted'
    }
  ];
}

// Generate unique incident ID
function generateIncidentId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 6);
  return `INC_${timestamp}_${random}`.toUpperCase();
}

// Emergency contact information
export const getEmergencyContacts = (req: Request, res: Response) => {
  res.json({
    emergency: {
      immediate: '911',
      description: 'Call 911 for immediate life-threatening emergencies'
    },
    platformSafety: {
      hotline: '1-800-TASK-911',
      email: 'safety@taskparent.com',
      description: '24/7 platform safety hotline'
    },
    childProtection: {
      national: '1-800-4-A-CHILD (1-800-422-4453)',
      description: 'National Child Abuse Hotline'
    },
    reporting: {
      incidents: 'Use this platform to report incidents',
      anonymous: 'Anonymous reporting available',
      description: 'Report safety concerns through the platform'
    }
  });
};

export default {
  createIncidentReport,
  getIncidentReport,
  updateIncidentStatus,
  getEmergencyContacts,
};