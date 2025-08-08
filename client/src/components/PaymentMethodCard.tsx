import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Shield, DollarSign, Clock } from "lucide-react";

interface PaymentMethodCardProps {
  method: 'stripe' | 'paypal' | 'escrow';
  amount: number;
  isSelected: boolean;
  isAvailable: boolean;
  onSelect: () => void;
  onClick?: () => void;
}

export default function PaymentMethodCard({ 
  method, 
  amount, 
  isSelected, 
  isAvailable, 
  onSelect,
  onClick 
}: PaymentMethodCardProps) {
  const getMethodInfo = () => {
    switch (method) {
      case 'stripe':
        return {
          icon: CreditCard,
          title: "Credit/Debit Card",
          description: "Instant payment processing",
          badge: "Instant",
          color: "blue"
        };
      case 'paypal':
        return {
          icon: () => <span className="text-xl">💙</span>,
          title: "PayPal",
          description: "Secure PayPal checkout",
          badge: "Secure",
          color: "blue"
        };
      case 'escrow':
        return {
          icon: Shield,
          title: "Escrow Protection",
          description: "Maximum security for high-value transactions",
          badge: "Protected",
          color: "green"
        };
    }
  };

  const info = getMethodInfo();
  const IconComponent = info.icon;

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={isAvailable ? onSelect : undefined}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              info.color === 'blue' ? 'bg-blue-100' : 'bg-green-100'
            }`}>
              <IconComponent className={`h-6 w-6 ${
                info.color === 'blue' ? 'text-blue-600' : 'text-green-600'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold">{info.title}</h3>
              <p className="text-sm text-muted-foreground">{info.description}</p>
              {method === 'escrow' && (
                <p className="text-xs text-green-600 mt-1">
                  For payments $100+
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <Badge 
              variant={isSelected ? "default" : "secondary"}
              className={info.color === 'green' ? 'bg-green-100 text-green-800' : ''}
            >
              {info.badge}
            </Badge>
            {method === 'escrow' && amount >= 100 && (
              <p className="text-xs text-muted-foreground mt-1">
                +2.5% escrow fee
              </p>
            )}
          </div>
        </div>

        {isSelected && onClick && (
          <div className="mt-4 pt-4 border-t">
            <Button 
              onClick={onClick}
              className="w-full"
              size="lg"
            >
              Pay ${amount.toFixed(2)} with {info.title}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}