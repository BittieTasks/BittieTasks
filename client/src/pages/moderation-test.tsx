import ContentModerationTest from "@/components/ContentModerationTest";

export default function ModerationTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI Content Moderation System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Test the AI-powered content moderation system that automatically screens 
            task descriptions, messages, and user content for safety and appropriateness.
          </p>
        </div>
        
        <ContentModerationTest />
        
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">System Features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">Content Types</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Task descriptions</li>
                  <li>• User messages</li>
                  <li>• Profile content</li>
                  <li>• Image descriptions</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Safety Checks</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Inappropriate content</li>
                  <li>• Scam detection</li>
                  <li>• Personal info exposure</li>
                  <li>• Family safety</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}