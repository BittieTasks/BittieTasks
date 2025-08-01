import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/ui/bottom-navigation";
import type { User, Message } from "@shared/schema";

export default function MessagesPage() {
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user/current"]
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/user", user?.id, "messages"],
    enabled: !!user?.id
  });

  if (userLoading || messagesLoading) {
    return (
      <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen">
        <div className="animate-pulse p-4">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Group messages by conversation
  const conversations = messages.reduce((acc, message) => {
    const otherUserId = message.fromUserId === user?.id ? message.toUserId : message.fromUserId;
    if (!acc[otherUserId || ""]) {
      acc[otherUserId || ""] = [];
    }
    acc[otherUserId || ""].push(message);
    return acc;
  }, {} as Record<string, Message[]>);

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen relative">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center space-x-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
        </div>
      </header>

      <div className="p-4 pb-20">
        {Object.keys(conversations).length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-600 mb-6">
              Start completing tasks to connect with task reviewers and other parents!
            </p>
            <Link href="/">
              <Button>Browse Tasks</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(conversations).map(([userId, userMessages]) => {
              const latestMessage = userMessages.sort(
                (a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
              )[0];
              const unreadCount = userMessages.filter(m => !m.isRead && m.toUserId === user?.id).length;

              return (
                <div
                  key={userId}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">TR</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">Task Reviewer</h4>
                        <span className="text-xs text-gray-500">
                          {new Date(latestMessage.createdAt || "").toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{latestMessage.content}</p>
                      {unreadCount > 0 && (
                        <span className="inline-block mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sample messages for demonstration */}
        {Object.keys(conversations).length === 0 && (
          <div className="space-y-3 mt-8">
            <div className="text-sm text-gray-500 text-center mb-4">Sample conversations:</div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 opacity-50">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">TR</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">Task Reviewer</h4>
                    <span className="text-xs text-gray-500">2m ago</span>
                  </div>
                  <p className="text-sm text-gray-600">Great job on your meal prep video! Approved with 5 stars ⭐</p>
                  <span className="inline-block mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                    1 new
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 opacity-50">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">SP</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">Sarah Parent</h4>
                    <span className="text-xs text-gray-500">1h ago</span>
                  </div>
                  <p className="text-sm text-gray-600">Thanks for the organizing tips! My kids' room looks amazing now 🎉</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation currentPath="/messages" />
    </div>
  );
}
