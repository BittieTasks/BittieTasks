'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Info, DollarSign, Users, ArrowLeftRight, Building } from 'lucide-react'

interface FeeTransparencyProps {
  variant?: 'compact' | 'full'
  highlightType?: 'solo' | 'community' | 'barter' | 'corporate'
}

export default function FeeTransparency({ variant = 'compact', highlightType }: FeeTransparencyProps) {
  const feeStructure = [
    {
      type: 'solo',
      name: 'Solo Tasks',
      icon: <DollarSign className="h-4 w-4" />,
      fee: '3%',
      description: 'Processing fee for solo convenience',
      color: 'bg-green-100 text-green-800 border-green-200',
      details: 'Platform-funded tasks with small processing fee for solo completion'
    },
    {
      type: 'community',
      name: 'Community Tasks',
      icon: <Users className="h-4 w-4" />,
      fee: '7%',
      description: 'Platform fee for peer-to-peer coordination',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      details: 'User-to-user payments with platform coordination and messaging'
    },
    {
      type: 'barter',
      name: 'Barter Exchange',
      icon: <ArrowLeftRight className="h-4 w-4" />,
      fee: '0%',
      description: 'No fees for direct value trading',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      details: 'Direct skill, service, and item exchanges with no monetary fees'
    },
    {
      type: 'corporate',
      name: 'Corporate Tasks',
      icon: <Building className="h-4 w-4" />,
      fee: '15%',
      description: 'Platform fee for corporate partnerships',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      details: 'High-value corporate sponsorships with enhanced verification'
    }
  ]

  if (variant === 'compact') {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">Fee Transparency</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {feeStructure.map((item) => (
            <div 
              key={item.type} 
              className={`flex flex-col items-center text-center p-2 rounded-lg border ${
                highlightType === item.type 
                  ? item.color 
                  : 'bg-gray-50 text-gray-600 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                {item.icon}
                <span className="text-xs font-medium">{item.name}</span>
              </div>
              <div className={`text-lg font-bold ${
                highlightType === item.type ? '' : 'text-gray-700'
              }`}>
                {item.fee}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          Complete Fee Transparency
        </CardTitle>
        <CardDescription>
          BittieTasks believes in radical transparency. Here's exactly what you pay for each task type.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {feeStructure.map((item) => (
            <div 
              key={item.type}
              className={`p-4 rounded-lg border-2 ${
                highlightType === item.type 
                  ? item.color + ' ring-2 ring-opacity-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="font-semibold">{item.name}</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-lg px-3 py-1 ${
                    highlightType === item.type ? 'border-current' : 'border-gray-400'
                  }`}
                >
                  {item.fee}
                </Badge>
              </div>
              <p className={`text-sm mb-2 ${
                highlightType === item.type ? 'font-medium' : 'text-gray-600'
              }`}>
                {item.description}
              </p>
              <p className="text-xs text-gray-500">
                {item.details}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Why These Fees?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Solo Tasks (3%):</strong> Small convenience fee for instant, no-coordination tasks</li>
            <li>• <strong>Community Tasks (7%):</strong> Covers coordination, messaging, and payment processing</li>
            <li>• <strong>Barter Exchange (0%):</strong> We believe in fee-free community value trading</li>
            <li>• <strong>Corporate Tasks (15%):</strong> Higher value partnerships fund platform growth</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}