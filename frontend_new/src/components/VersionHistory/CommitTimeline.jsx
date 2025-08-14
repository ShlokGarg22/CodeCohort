/**
 * Commit Timeline Component
 * Displays chronological timeline of Git commits with detailed information
 */

import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Clock, 
  User, 
  GitCommit,
  ExternalLink,
  RefreshCw,
  Loader2,
  Calendar,
  Hash,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Plus,
  Minus
} from 'lucide-react';
import { githubService } from '../../services/githubService';
import { getCommitAuthorDisplay, getCommitAuthorAvatar, getCommitAuthorInitials, getCommitDate } from '../../utils/commitUtils';
import { format, formatDistanceToNow } from 'date-fns';

/**
 * Individual commit item component
 */
const CommitItem = ({ 
  commit, 
  isCompareMode = false, 
  isSelected = false, 
  onSelect, 
  isLast = false 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [commitDetails, setCommitDetails] = useState(null);

  /**
   * Load detailed commit information
   */
  const loadCommitDetails = async () => {
    if (commitDetails) {
      setExpanded(!expanded);
      return;
    }

    try {
      setDetailsLoading(true);
      // For demo, we'll just use the existing commit data
      // In real implementation, you might fetch additional details
      setCommitDetails({
        files: [],
        stats: { additions: 0, deletions: 0, total: 0 }
      });
      setExpanded(true);
    } catch (err) {
      console.error('Failed to load commit details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (date) => {
    const commitDate = new Date(date);
    return {
      relative: formatDistanceToNow(commitDate, { addSuffix: true }),
      absolute: format(commitDate, 'MMM d, yyyy \'at\' h:mm a')
    };
  };

  const timestamp = formatTimestamp(getCommitDate(commit));
  const changeTypeColor = githubService.getChangeTypeColor(commit.changeType);

  return (
    <div className="relative">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200 -z-10" />
      )}
      
      <div 
        className={`
          flex gap-4 p-4 rounded-lg transition-all duration-200
          ${isCompareMode ? 'cursor-pointer hover:bg-gray-50' : ''}
          ${isSelected ? 'bg-blue-50 border-2 border-blue-200' : 'bg-white'}
        `}
        onClick={isCompareMode ? () => onSelect?.(commit) : undefined}
      >
        {/* Timeline marker */}
        <div className="flex-shrink-0 relative">
          <div className={`
            w-3 h-3 rounded-full border-2 mt-2
            ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}
          `} />
        </div>

        {/* Commit content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            {/* Left side - commit info */}
            <div className="flex-1 min-w-0">
              {/* Commit message */}
              <div className="flex items-start gap-3 mb-2">
                <GitCommit className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 break-words">
                    {commit.shortMessage}
                  </h3>
                  {commit.messageLines.length > 1 && (
                    <p className="text-xs text-gray-600 mt-1 break-words">
                      {commit.messageLines.slice(1).join(' ').substring(0, 100)}
                      {commit.messageLines.slice(1).join(' ').length > 100 && '...'}
                    </p>
                  )}
                </div>
              </div>

              {/* Metadata row */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                {/* Commit hash */}
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  <code className="font-mono">{commit.shortSha}</code>
                </div>

                {/* Version number */}
                <div className="flex items-center gap-1">
                  <span className="font-medium">{commit.version}</span>
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1" title={timestamp.absolute}>
                  <Clock className="h-3 w-3" />
                  <span>{timestamp.relative}</span>
                </div>
              </div>

              {/* Change type badge */}
              <div className="mb-3">
                <Badge className={`text-xs ${changeTypeColor}`}>
                  {commit.changeType}
                </Badge>
              </div>
            </div>

            {/* Right side - author and actions */}
            <div className="flex items-start gap-3">
              {/* Author */}
              <div className="flex items-center gap-2 text-sm">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={getCommitAuthorAvatar(commit)} alt={getCommitAuthorDisplay(commit)} />
                  <AvatarFallback>
                    {getCommitAuthorInitials(commit)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {getCommitAuthorDisplay(commit)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {/* Additional author info if needed */}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {/* Expand details button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    loadCommitDetails();
                  }}
                  disabled={detailsLoading}
                  className="h-8 w-8 p-0"
                >
                  {detailsLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : expanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>

                {/* View on GitHub */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(commit.htmlUrl, '_blank');
                  }}
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>

                {/* Compare mode selection indicator */}
                {isCompareMode && (
                  <div className="ml-2">
                    {isSelected ? (
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expanded details */}
          {expanded && commitDetails && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {/* Stats */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Changes</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-green-600">
                      <Plus className="h-3 w-3" />
                      <span>{commitDetails.stats.additions} additions</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-600">
                      <Minus className="h-3 w-3" />
                      <span>{commitDetails.stats.deletions} deletions</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="h-3 w-3" />
                      <span>{commitDetails.files.length} files changed</span>
                    </div>
                  </div>
                </div>

                {/* Full commit message */}
                <div className="md:col-span-2 space-y-2">
                  <h4 className="font-medium text-gray-900">Full Message</h4>
                  <div className="bg-gray-50 rounded p-3 text-xs font-mono whitespace-pre-wrap break-words">
                    {commit.message}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Main CommitTimeline component
 */
const CommitTimeline = ({ 
  commits = [], 
  loading = false, 
  hasMore = false, 
  onLoadMore, 
  onRefresh,
  repoData,
  isCompareMode = false,
  selectedCommits = [],
  onCommitSelect
}) => {
  return (
    <div className="space-y-6">
      {/* Timeline header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Commit History
              </h2>
              <p className="text-sm text-gray-600">
                {commits.length} commits loaded
                {isCompareMode && selectedCommits.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    • {selectedCommits.length}/2 selected for comparison
                  </span>
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions for compare mode */}
      {isCompareMode && selectedCommits.length === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-800">
              <strong>Compare Mode:</strong> Click on any two commits to compare their differences.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Commits timeline */}
      {commits.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {commits.map((commit, index) => (
                <CommitItem
                  key={commit.sha}
                  commit={commit}
                  isCompareMode={isCompareMode}
                  isSelected={selectedCommits.some(c => c.sha === commit.sha)}
                  onSelect={onCommitSelect}
                  isLast={index === commits.length - 1}
                />
              ))}
            </div>

            {/* Load more button */}
            {hasMore && (
              <div className="p-4 border-t border-gray-100 text-center">
                <Button
                  variant="outline"
                  onClick={onLoadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  )}
                  Load More Commits
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Empty state
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <GitCommit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No commits found
              </h3>
              <p className="text-gray-600 mb-4">
                {loading ? 'Loading commit history...' : 'This repository has no commits or the repository is not accessible.'}
              </p>
              {!loading && (
                <Button variant="outline" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading indicator */}
      {loading && commits.length === 0 && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading commits...</p>
        </div>
      )}
    </div>
  );
};

export default CommitTimeline;
