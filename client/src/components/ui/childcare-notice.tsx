import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ChildcareProhibitionNotice() {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="font-medium">
        <strong>Important:</strong> TaskParent does not allow any childcare services, babysitting, or child supervision activities. 
        Our platform is exclusively for household tasks between adults (cleaning, cooking, errands, organization).
      </AlertDescription>
    </Alert>
  );
}