import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Shield, X, CheckCircle, Clock, Camera } from "lucide-react";

export default function SecurityDemo() {
  const [currentDemo, setCurrentDemo] = useState<string | null>(null);

  const fraudAttempts = [
    {
      id: "fake-id",
      title: "Fake ID Document Upload",
      description: "Malicious user uploads a digitally edited driver's license",
      attackMethod: "Used Photoshop to change name and address on real license",
      detectionMethods: [
        "EXIF data shows recent modification timestamp",
        "Digital artifacts detected in altered text areas", 
        "Font inconsistencies in edited sections",
        "Unusual compression patterns around modifications"
      ],
      preventionActions: [
        "Document automatically flagged for manual review",
        "User risk score increased by 50 points",
        "Account temporarily restricted from task creation",
        "Additional verification requirements triggered"
      ],
      outcome: "Document rejected within 30 seconds"
    },
    {
      id: "phone-spoof",
      title: "Virtual Phone Number Verification",
      description: "User tries to verify with a temporary online phone number",
      attackMethod: "Used VoIP service to create disposable phone number",
      detectionMethods: [
        "Phone carrier lookup identifies VoIP provider",
        "Number not registered to a major telecom carrier",
        "Geolocation mismatch with claimed address",
        "Phone number flagged in fraud database"
      ],
      preventionActions: [
        "Verification code sending blocked",
        "User shown educational message about valid numbers",
        "Alternative verification methods offered",
        "Activity logged for pattern analysis"
      ],
      outcome: "Verification attempt blocked immediately"
    },
    {
      id: "stolen-identity",
      title: "Stolen Identity Registration",
      description: "Criminal uses stolen personal information to create account",
      attackMethod: "Data from previous breach used to impersonate real person",
      detectionMethods: [
        "Social Security Number validation fails",
        "Address history doesn't match claimed residence",
        "Credit bureau identity check shows discrepancies",
        "Behavioral patterns don't match demographic profile"
      ],
      preventionActions: [
        "Account creation blocked during registration",
        "Identity theft report filed with authorities",
        "Real identity holder notified if contact info available",
        "Enhanced monitoring for similar attempts"
      ],
      outcome: "Account registration denied before completion"
    },
    {
      id: "coordinated-accounts",
      title: "Fake Account Network",
      description: "Group creates multiple fake accounts for review manipulation",
      attackMethod: "Same device/IP used to create 10+ accounts with fake identities",
      detectionMethods: [
        "Device fingerprinting identifies same hardware",
        "IP address geolocation clustering detected",
        "Similar behavioral patterns across accounts",
        "Coordinated account creation timestamps"
      ],
      preventionActions: [
        "All related accounts automatically suspended",
        "Device permanently banned from platform",
        "Enhanced verification required for IP range",
        "Law enforcement notification for organized fraud"
      ],
      outcome: "Entire network detected and eliminated within 48 hours"
    },
    {
      id: "payment-fraud",
      title: "Stolen Credit Card Usage",
      description: "User adds stolen credit card for payment verification",
      attackMethod: "Card details from dark web marketplace used for verification",
      detectionMethods: [
        "Card ownership verification fails",
        "Billing address doesn't match account address",
        "Card flagged in stolen payment database",
        "Unusual velocity patterns detected"
      ],
      preventionActions: [
        "Payment method immediately blocked",
        "Account suspended pending investigation",
        "Financial institutions notified",
        "User required to provide alternative verification"
      ],
      outcome: "Fraudulent payment blocked, account flagged"
    }
  ];

  const renderDetectionDetails = (attempt: any) => (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{attempt.title}</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCurrentDemo(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Attack Method:</strong> {attempt.attackMethod}
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            How We Detect This
          </h4>
          <ul className="space-y-1">
            {attempt.detectionMethods.map((method: string, index: number) => (
              <li key={index} className="text-sm flex items-start space-x-2">
                <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <span>{method}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Automatic Response
          </h4>
          <ul className="space-y-1">
            {attempt.preventionActions.map((action: string, index: number) => (
              <li key={index} className="text-sm flex items-start space-x-2">
                <div className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-green-50 p-3 rounded-lg">
          <h4 className="font-semibold text-sm mb-1 flex items-center text-green-800">
            <CheckCircle className="h-4 w-4 mr-2" />
            Result
          </h4>
          <p className="text-sm text-green-700">{attempt.outcome}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Security Demo: Fraud Prevention in Action</h1>
        <p className="text-gray-600">
          See how TaskParent's advanced security system detects and prevents malicious users
        </p>
      </div>

      {currentDemo ? (
        <div className="space-y-4">
          {renderDetectionDetails(fraudAttempts.find(a => a.id === currentDemo))}
          
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Real-Time Security Dashboard</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-800">99.2%</div>
                <div className="text-sm text-green-600">Fraud Detection Rate</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-800">2.3s</div>
                <div className="text-sm text-blue-600">Average Detection Time</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-800">$47,892</div>
                <div className="text-sm text-purple-600">Fraud Prevented (Monthly)</div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fraudAttempts.map((attempt) => (
            <Card key={attempt.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{attempt.title}</h3>
                    <p className="text-sm text-gray-600">{attempt.description}</p>
                  </div>
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Blocked
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Attack Vector</div>
                  <p className="text-sm bg-red-50 p-2 rounded border-l-4 border-red-400">
                    {attempt.attackMethod}
                  </p>
                </div>

                <Button 
                  onClick={() => setCurrentDemo(attempt.id)}
                  className="w-full"
                  variant="outline"
                >
                  See How We Detect & Prevent This
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Security Layers Overview */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Multi-Layer Security System</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Camera className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium">Document Analysis</h4>
            <p className="text-xs text-gray-600">AI-powered fraud detection in uploaded documents</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-medium">Behavioral Analysis</h4>
            <p className="text-xs text-gray-600">Real-time monitoring of user activity patterns</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-medium">Identity Verification</h4>
            <p className="text-xs text-gray-600">Multi-source identity confirmation and validation</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <h4 className="font-medium">Real-Time Response</h4>
            <p className="text-xs text-gray-600">Immediate action on detected threats</p>
          </div>
        </div>
      </Card>

      {/* Success Metrics */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Security Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">99.2%</div>
            <div className="text-sm text-gray-600">Fraud Detection Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">4.1%</div>
            <div className="text-sm text-gray-600">False Positive Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">0.08%</div>
            <div className="text-sm text-gray-600">Account Takeover Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">1.2%</div>
            <div className="text-sm text-gray-600">Payment Fraud Rate</div>
          </div>
        </div>
      </Card>
    </div>
  );
}