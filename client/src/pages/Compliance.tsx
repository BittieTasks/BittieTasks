import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, CheckCircle, AlertTriangle, Clock, FileText, Users, DollarSign } from "lucide-react";
import { AgeVerificationForm } from "@/components/compliance/AgeVerificationForm";
import { BackgroundCheckForm } from "@/components/compliance/BackgroundCheckForm";
import { IncidentReportForm } from "@/components/compliance/IncidentReportForm";
import { InsuranceQuoteForm } from "@/components/compliance/InsuranceQuoteForm";
import { TaxEstimatorForm } from "@/components/compliance/TaxEstimatorForm";

export default function Compliance() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch compliance status
  const { data: complianceStatus, isLoading } = useQuery({
    queryKey: ["/api/legal/compliance-status"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Clock className="animate-spin h-8 w-8 text-blue-500" />
          <span className="ml-2">Loading compliance status...</span>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IMPLEMENTED':
      case 'ACTIVE':
      case 'COMPLIANT':
      case 'OPERATIONAL':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDING_QUOTES':
      case 'FRAMEWORK_READY':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IMPLEMENTED':
      case 'ACTIVE':
      case 'COMPLIANT':
      case 'OPERATIONAL':
        return <CheckCircle className="h-4 w-4" />;
      case 'PENDING_QUOTES':
      case 'FRAMEWORK_READY':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Legal Compliance Center</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage legal requirements and compliance for TaskParent platform
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="age-verification">Age Verification</TabsTrigger>
          <TabsTrigger value="background-checks">Background Checks</TabsTrigger>
          <TabsTrigger value="incident-reporting">Incident Reports</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="taxes">Tax Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Compliance Status Dashboard</AlertTitle>
            <AlertDescription>
              Monitor the legal compliance status of your TaskParent platform operations.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceStatus?.status && Object.entries(complianceStatus.status).map(([key, status]) => (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </CardTitle>
                    {getStatusIcon(status as string)}
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge className={getStatusColor(status as string)}>
                    {status as string}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Estimated Implementation Costs
              </CardTitle>
              <CardDescription>
                Financial planning for legal compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complianceStatus?.estimatedImplementationCosts && 
                  Object.entries(complianceStatus.estimatedImplementationCosts).map(([category, cost]) => (
                    <div key={category} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="capitalize font-medium">{category}</span>
                      <span className="text-blue-600 font-semibold">{cost}</span>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Certifications & Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {complianceStatus?.certifications?.map((cert: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="age-verification">
          <AgeVerificationForm />
        </TabsContent>

        <TabsContent value="background-checks">
          <BackgroundCheckForm />
        </TabsContent>

        <TabsContent value="incident-reporting">
          <IncidentReportForm />
        </TabsContent>

        <TabsContent value="insurance">
          <InsuranceQuoteForm />
        </TabsContent>

        <TabsContent value="taxes">
          <TaxEstimatorForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}