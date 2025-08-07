import AITaskGenerator from "@/components/AITaskGenerator";

export default function AITaskGeneratorPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI Task Creation Assistant
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Let AI help you create perfect tasks! Generate task suggestions based on your skills 
            and preferences, or enhance your existing task descriptions with AI-powered optimization.
          </p>
        </div>
        
        <AITaskGenerator />
        
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">How AI Task Creation Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">1</span>
                </div>
                <h3 className="font-medium mb-2">Smart Generation</h3>
                <p className="text-sm text-gray-600">
                  AI analyzes your skills, category preferences, and location to generate personalized task suggestions
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h3 className="font-medium mb-2">Task Enhancement</h3>
                <p className="text-sm text-gray-600">
                  Transform basic task ideas into professional, detailed descriptions with optimal pricing and timing
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <h3 className="font-medium mb-2">Safety First</h3>
                <p className="text-sm text-gray-600">
                  All AI-generated content is automatically screened for safety, appropriateness, and community guidelines
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}