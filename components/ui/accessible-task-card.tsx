import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AccessibleButton } from './accessible-button';
// import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, DollarSign, Users } from 'lucide-react';
import { Link } from 'wouter';
import type { Task } from '@shared/schema';

interface AccessibleTaskCardProps {
  task: Task;
  showActions?: boolean;
  onJoin?: (taskId: number) => void;
  onView?: (taskId: number) => void;
  isJoining?: boolean;
}

export const AccessibleTaskCard: React.FC<AccessibleTaskCardProps> = ({
  task,
  showActions = true,
  onJoin,
  onView,
  isJoining = false
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const taskId = typeof task.id === 'string' ? parseInt(task.id) : task.id;

  return (
    <Card 
      className="hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
      role="article"
      aria-labelledby={`task-title-${taskId}`}
      aria-describedby={`task-description-${taskId}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle 
            id={`task-title-${taskId}`}
            className="text-lg font-semibold text-gray-900 pr-2"
          >
            {task.title}
          </CardTitle>
          <div className="flex flex-col items-end space-y-1">
            <span 
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty || 'medium')}`}
              aria-label={`Difficulty: ${task.difficulty}`}
            >
              {task.difficulty}
            </span>
            <span 
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
              aria-label={`Status: ${task.status}`}
            >
              {task.status}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p 
          id={`task-description-${taskId}`}
          className="text-gray-600 text-sm leading-relaxed"
        >
          {task.description}
        </p>

        {/* Task Details */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-600" aria-hidden="true" />
            <span>
              <span className="sr-only">Payment: </span>
              {formatCurrency(task.payment)}
            </span>
          </div>
          
          {task.scheduledFor && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <span>
                <span className="sr-only">Scheduled for: </span>
                {formatDate(task.scheduledFor)}
              </span>
            </div>
          )}
          
          {task.location && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-red-600" aria-hidden="true" />
              <span>
                <span className="sr-only">Location: </span>
                {task.location}
              </span>
            </div>
          )}
          
          {task.maxParticipants && (
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" aria-hidden="true" />
              <span>
                <span className="sr-only">Maximum participants: </span>
                {task.maxParticipants} max
              </span>
            </div>
          )}
        </div>

        {/* Requirements */}
        {task.requirements && task.requirements.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {task.requirements.map((requirement: string, index: number) => (
                <li key={index}>{requirement}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 pt-2">
            <Link href={`/task/${taskId}`} className="flex-1">
              <AccessibleButton
                variant="outline"
                className="w-full"
                ariaLabel={`View details for ${task.title}`}
                onClick={() => onView?.(taskId)}
              >
                View Details
              </AccessibleButton>
            </Link>
            
            {task.status === 'open' && onJoin && (
              <AccessibleButton
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                isLoading={isJoining}
                loadingText="Joining..."
                ariaLabel={`Join task: ${task.title}`}
                onClick={() => onJoin(taskId)}
              >
                Join Task
              </AccessibleButton>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};