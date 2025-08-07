import SMSTestInterface from "@/components/SMSTestInterface";

export default function SMSTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            SMS Notification System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Test the Twilio-powered SMS notification system. Send real-time updates 
            for task status, payments, security alerts, and verification codes to keep 
            your users informed wherever they are.
          </p>
        </div>
        
        <SMSTestInterface />
        
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">SMS Integration Benefits</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">Real-Time Updates</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Instant task notifications</li>
                  <li>• Payment confirmations</li>
                  <li>• Security alerts</li>
                  <li>• Account verification</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Smart Features</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Automatic phone formatting</li>
                  <li>• Delivery confirmation</li>
                  <li>• Error handling & retries</li>
                  <li>• Compliance with regulations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}