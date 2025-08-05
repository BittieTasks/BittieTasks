import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Heart, Leaf, Users, Award, CheckCircle, AlertTriangle } from "lucide-react";

interface EthicalCriteria {
  hrcScore: number;
  deiLeadership: boolean;
  lgbtqSupport: boolean;
  environmentalScore: number;
  laborPracticesScore: number;
  communityInvestment: boolean;
  controversyScore: number;
  carbonNeutralCommitment: boolean;
  supplierDiversityProgram: boolean;
}

interface PartnershipCandidate {
  companyName: string;
  industry: string;
  proposedTaskType: string;
  proposedPayment: number;
  ethicalCriteria: EthicalCriteria;
  taskDescription: string;
  targetAudience: string;
  expectedParticipants: number;
}

interface PartnershipEvaluation {
  approved: boolean;
  score: number;
  strengths: string[];
  concerns: string[];
  recommendation: string;
}

export default function EthicalPartnerships() {
  const [selectedPartner, setSelectedPartner] = useState<PartnershipCandidate | null>(null);

  const { data: approvedPartners, isLoading: partnersLoading } = useQuery({
    queryKey: ["/api/ethical-partners"],
  });

  const { data: demoEvaluation, isLoading: demoLoading } = useQuery({
    queryKey: ["/api/ethical-partners/demo-evaluation"],
  });

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 85) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };

  const EthicalCriteriaDisplay = ({ criteria }: { criteria: EthicalCriteria }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">HRC Equality Index</span>
          <Badge variant={criteria.hrcScore >= 80 ? "default" : "destructive"}>
            {criteria.hrcScore}/100
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-pink-600" />
          <span className="text-sm font-medium">LGBTQ+ Support</span>
          {criteria.lgbtqSupport ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium">DEI Leadership</span>
          {criteria.deiLeadership ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">Environmental Score</span>
          <Badge variant={criteria.environmentalScore >= 60 ? "default" : "secondary"}>
            {criteria.environmentalScore}/100
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium">Labor Practices</span>
          <Badge variant={criteria.laborPracticesScore >= 70 ? "default" : "secondary"}>
            {criteria.laborPracticesScore}/100
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium">Community Investment</span>
          {criteria.communityInvestment ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">Carbon Neutral Commitment</span>
          {criteria.carbonNeutralCommitment ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <span className="text-sm text-gray-500">Not committed</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">Supplier Diversity</span>
          {criteria.supplierDiversityProgram ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <span className="text-sm text-gray-500">No program</span>
          )}
        </div>
      </div>
    </div>
  );

  if (partnersLoading || demoLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Ethical Partnership Matching</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          BittieTasks partners only with companies that demonstrate strong commitments to diversity, 
          equity, inclusion, LGBTQ+ rights, and responsible business practices.
        </p>
      </div>

      <Tabs defaultValue="approved" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="approved">Approved Partners</TabsTrigger>
          <TabsTrigger value="evaluation">Partnership Evaluation</TabsTrigger>
        </TabsList>

        <TabsContent value="approved" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedPartners?.map((partner: PartnershipCandidate, index: number) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedPartner(partner)}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {partner.companyName}
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Approved
                    </Badge>
                  </CardTitle>
                  <CardDescription>{partner.industry}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">{partner.taskDescription}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Payment:</span>
                      <span className="text-lg font-bold text-green-600">
                        ${partner.proposedPayment}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">HRC Score:</span>
                      <Badge variant={partner.ethicalCriteria.hrcScore >= 80 ? "default" : "secondary"}>
                        {partner.ethicalCriteria.hrcScore}/100
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedPartner && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{selectedPartner.companyName} - Detailed View</CardTitle>
                <CardDescription>{selectedPartner.proposedTaskType}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{selectedPartner.taskDescription}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Industry:</span>
                    <p>{selectedPartner.industry}</p>
                  </div>
                  <div>
                    <span className="font-medium">Payment:</span>
                    <p className="text-green-600 font-bold">${selectedPartner.proposedPayment}</p>
                  </div>
                  <div>
                    <span className="font-medium">Target Audience:</span>
                    <p>{selectedPartner.targetAudience}</p>
                  </div>
                  <div>
                    <span className="font-medium">Expected Participants:</span>
                    <p>{selectedPartner.expectedParticipants}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Ethical Criteria</h4>
                  <EthicalCriteriaDisplay criteria={selectedPartner.ethicalCriteria} />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-6">
          {demoEvaluation && (
            <Card>
              <CardHeader>
                <CardTitle>Example Partnership Evaluation</CardTitle>
                <CardDescription>
                  See how our ethical matching algorithm evaluates potential corporate partners
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Company Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Company:</span> {demoEvaluation.candidate.companyName}</div>
                      <div><span className="font-medium">Industry:</span> {demoEvaluation.candidate.industry}</div>
                      <div><span className="font-medium">Proposed Task:</span> {demoEvaluation.candidate.proposedTaskType}</div>
                      <div><span className="font-medium">Payment:</span> ${demoEvaluation.candidate.proposedPayment}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Evaluation Results</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Ethical Score:</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getScoreColor(demoEvaluation.evaluation.score)}`}>
                            {demoEvaluation.evaluation.score}/100
                          </span>
                          <Badge variant={getScoreBadgeVariant(demoEvaluation.evaluation.score)}>
                            {demoEvaluation.evaluation.approved ? "Approved" : "Rejected"}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={demoEvaluation.evaluation.score} className="h-2" />
                      <p className="text-sm text-gray-600">{demoEvaluation.evaluation.recommendation}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 text-green-600">Strengths</h4>
                    <ul className="space-y-1 text-sm">
                      {demoEvaluation.evaluation.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {demoEvaluation.evaluation.concerns.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 text-orange-600">Areas for Improvement</h4>
                      <ul className="space-y-1 text-sm">
                        {demoEvaluation.evaluation.concerns.map((concern: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-3">Ethical Criteria Analysis</h4>
                  <EthicalCriteriaDisplay criteria={demoEvaluation.candidate.ethicalCriteria} />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}