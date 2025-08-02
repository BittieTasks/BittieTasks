import { Router } from 'express';
import { verifyAge, verifyParentalConsent, coppaComplianceCheck } from '../middleware/ageVerification';
import { initializeBackgroundCheck, checkBackgroundStatus, verifyBackgroundCheck } from '../middleware/backgroundCheck';
import { assessClassification, generateClassificationReport, getContractorAgreementRequirements } from '../middleware/workerClassification';
import { createIncidentReport, getIncidentReport, updateIncidentStatus, getEmergencyContacts } from '../middleware/incidentReporting';
import { calculateInsuranceQuote, TASKPARENT_SAMPLE_QUOTE, INSURANCE_PROVIDER_CONTACTS } from '../compliance/insuranceQuotes';
import { calculateEstimatedTaxLiability, TASKPARENT_TAX_COMPLIANCE, TASKPARENT_SAMPLE_TAX_CALCULATION, TAX_COMPLIANCE_CALENDAR } from '../compliance/taxCompliance';

const router = Router();

// Age Verification & COPPA Compliance
router.post('/age-verification', verifyAge, coppaComplianceCheck, (req, res) => {
  res.json({
    message: 'Age verification completed successfully',
    isMinor: (req as any).isMinor || false,
    ageVerified: true,
    complianceStatus: 'COPPA_COMPLIANT'
  });
});

router.post('/parental-consent', verifyParentalConsent, (req, res) => {
  res.json({
    message: 'Parental consent verified successfully',
    consentVerified: true
  });
});

// Background Check Management
router.post('/background-check', initializeBackgroundCheck);
router.get('/background-check/:checkId', checkBackgroundStatus);
router.get('/background-check-required', verifyBackgroundCheck, (req, res) => {
  res.json({
    message: 'Background check verification successful',
    status: 'verified',
    backgroundCheck: (req as any).backgroundCheck
  });
});

// Worker Classification
router.get('/worker-classification', assessClassification, generateClassificationReport);
router.get('/contractor-requirements', getContractorAgreementRequirements);

// Incident Reporting
router.post('/incident-report', createIncidentReport);
router.get('/incident-report/:incidentId', getIncidentReport);
router.put('/incident-report/:incidentId/status', updateIncidentStatus);
router.get('/emergency-contacts', getEmergencyContacts);

// Legal Documents Access
router.get('/terms-of-service', (req, res) => {
  res.json({
    document: 'terms-of-service',
    version: '1.0',
    effectiveDate: '2025-08-01',
    lastUpdated: '2025-08-01',
    url: '/legal/terms-of-service.md'
  });
});

router.get('/privacy-policy', (req, res) => {
  res.json({
    document: 'privacy-policy', 
    version: '1.0',
    effectiveDate: '2025-08-01',
    lastUpdated: '2025-08-01',
    url: '/legal/privacy-policy.md',
    coppaCompliant: true
  });
});

// Insurance Requirements and Quotes
router.get('/insurance-requirements', (req, res) => {
  res.json({
    sampleQuote: TASKPARENT_SAMPLE_QUOTE,
    providerContacts: INSURANCE_PROVIDER_CONTACTS,
    recommendation: 'Obtain quotes from 3-5 providers for comprehensive coverage comparison'
  });
});

router.post('/insurance-quote', (req, res) => {
  try {
    const quote = calculateInsuranceQuote(req.body);
    res.json(quote);
  } catch (error) {
    res.status(400).json({
      error: 'INVALID_QUOTE_PARAMETERS',
      message: 'Invalid parameters for insurance quote calculation'
    });
  }
});

// Tax Compliance Information
router.get('/tax-compliance', (req, res) => {
  res.json({
    complianceFramework: TASKPARENT_TAX_COMPLIANCE,
    sampleCalculation: TASKPARENT_SAMPLE_TAX_CALCULATION,
    complianceCalendar: TAX_COMPLIANCE_CALENDAR,
    recommendation: 'Engage qualified tax professional for multi-state compliance'
  });
});

router.post('/tax-estimate', (req, res) => {
  try {
    const estimate = calculateEstimatedTaxLiability(req.body);
    res.json({
      estimate,
      disclaimer: 'This is an estimate only. Consult with tax professional for accurate calculations.',
      recommendations: [
        'Set aside 25-30% of profits for tax obligations',
        'Make quarterly estimated tax payments',
        'Maintain detailed records of all business expenses',
        'Consider tax planning strategies to minimize liability'
      ]
    });
  } catch (error) {
    res.status(400).json({
      error: 'INVALID_TAX_PARAMETERS',
      message: 'Invalid parameters for tax calculation'
    });
  }
});

// Compliance Status
router.get('/compliance-status', (req, res) => {
  res.json({
    platform: 'TaskParent',
    complianceDate: new Date().toISOString(),
    status: {
      coppaCompliance: 'IMPLEMENTED',
      backgroundChecks: 'ACTIVE',
      workerClassification: 'COMPLIANT',
      incidentReporting: 'OPERATIONAL',
      privacyProtection: 'ENHANCED',
      dataEncryption: 'ACTIVE',
      insuranceCompliance: 'PENDING_QUOTES',
      taxCompliance: 'FRAMEWORK_READY'
    },
    certifications: [
      'SOC 2 Type II (Pending)',
      'COPPA Compliance Framework',
      'State Privacy Law Compliance'
    ],
    estimatedImplementationCosts: {
      legal: '$300,000-500,000 first year',
      insurance: '$40,000-120,000 annually',
      tax: '$25,000-75,000 annually',
      compliance: '$50,000-100,000 annually'
    },
    lastAudit: '2025-08-01',
    nextAudit: '2025-11-01'
  });
});

export default router;