'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CleanNavigation from '@/components/CleanNavigation'
import CleanLayout from '@/components/CleanLayout'
import { Shield, AlertTriangle, CheckCircle, Users, FileText, Scale } from 'lucide-react'

export default function PoliciesPage() {
  return (
    <CleanLayout>
      <CleanNavigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
            Policies & Guidelines
          </h1>
          <p className="text-lg text-gray-600">
            Community standards, safety guidelines, and platform policies
          </p>
        </div>

        {/* Task Approval Guidelines */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Task Approval Guidelines
            </CardTitle>
            <CardDescription>
              How tasks are reviewed and approved on BittieTasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Approved Task Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Solo Tasks</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Online surveys and market research</li>
                    <li>• Data entry and administrative work</li>
                    <li>• Creative projects (writing, design)</li>
                    <li>• Home organization and decluttering</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Community Tasks</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Adult carpooling and transportation</li>
                    <li>• Group fitness and wellness activities</li>
                    <li>• Meal planning workshops</li>
                    <li>• Neighborhood coordination</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Barter Tasks</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Skill exchanges between adults</li>
                    <li>• Service swaps (cleaning for tutoring)</li>
                    <li>• Tool and equipment sharing</li>
                    <li>• Professional consultation trades</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Self Care Tasks</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Accountability partnerships</li>
                    <li>• Study groups and learning circles</li>
                    <li>• Wellness challenges</li>
                    <li>• Hobby and creative groups</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Approval Process</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-green-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Automated Pre-Screening</p>
                    <p className="text-sm text-gray-600">AI content moderation, category validation, and safety checks</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Risk Assessment</p>
                    <p className="text-sm text-gray-600">Tasks under $50 auto-approve, higher amounts require human review</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-purple-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Community Review</p>
                    <p className="text-sm text-gray-600">User ratings and community feedback influence approval decisions</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prohibited Activities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Prohibited Activities
            </CardTitle>
            <CardDescription>
              Tasks and activities not allowed on BittieTasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Legal & Professional Services</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Childcare and babysitting services</li>
                  <li>• Medical or healthcare services</li>
                  <li>• Legal advice or representation</li>
                  <li>• Financial planning or investment advice</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Safety & Security</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Tasks involving minors unsupervised</li>
                  <li>• Dangerous or illegal activities</li>
                  <li>• Access to private homes without verification</li>
                  <li>• Handling of controlled substances</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Standards */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Safety Standards
            </CardTitle>
            <CardDescription>
              How we keep the BittieTasks community safe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">User Verification</h4>
              <p className="text-sm text-gray-600">Email verification required for all users. Background checks required for recurring community roles involving transportation or home access.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Insurance & Liability</h4>
              <p className="text-sm text-gray-600">Users must maintain appropriate insurance for transportation tasks. BittieTasks facilitates connections but users are responsible for their own safety and liability.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Community Reporting</h4>
              <p className="text-sm text-gray-600">Users can report suspicious activities, inappropriate behavior, or safety concerns. All reports are investigated promptly.</p>
            </div>
          </CardContent>
        </Card>

        {/* Corporate Sponsorship */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-600" />
              Corporate Sponsorship Standards
            </CardTitle>
            <CardDescription>
              How we evaluate and approve corporate sponsors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Ethics Scoring (70-95+ Required)</h4>
              <p className="text-sm text-gray-600">Companies undergo evaluation for ethical business practices, community impact, and alignment with platform values before sponsorship approval.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Premium Payouts</h4>
              <p className="text-sm text-gray-600">Corporate sponsored tasks offer 25-50% higher compensation than standard community tasks, with enhanced vetting for participants.</p>
            </div>
          </CardContent>
        </Card>

        {/* Platform Fees */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              Platform Fees & Payment
            </CardTitle>
            <CardDescription>
              Transparent pricing for all subscription tiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">10%</div>
                <div className="text-sm text-gray-600">Free Plan</div>
                <div className="text-xs text-gray-500">5 tasks/month</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">7%</div>
                <div className="text-sm text-gray-600">Pro Plan - $9.99/mo</div>
                <div className="text-xs text-gray-500">25 tasks/month</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">5%</div>
                <div className="text-sm text-gray-600">Premium Plan - $19.99/mo</div>
                <div className="text-xs text-gray-500">Unlimited tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-gray-600" />
              Legal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Terms of Service</h4>
              <p className="text-sm text-gray-600">By using BittieTasks, users agree to our community standards, safety guidelines, and acceptable use policies. Full terms available in our legal documentation.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Privacy Policy</h4>
              <p className="text-sm text-gray-600">We protect user data and only share information necessary for task coordination. No personal data is sold to third parties.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Dispute Resolution</h4>
              <p className="text-sm text-gray-600">Platform provides mediation for task-related disputes. For high-value transactions, integration with Escrow.com provides additional protection.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </CleanLayout>
  )
}