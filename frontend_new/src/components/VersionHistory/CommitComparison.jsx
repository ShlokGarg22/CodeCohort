/**
 * Commit Comparison Component
 * Side-by-side view for comparing differences between two commits
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  X, 
  GitCommit, 
  Calendar, 
  Hash, 
  FileText, 
  Plus, 
  Minus, 
  ArrowRight,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  File,
  FilePlus,
  FileMinus,
  FileX
} from 'lucide-react';
import { getCommitAuthorDisplay, getCommitAuthorAvatar, getCommitAuthorInitials, getCommitDate } from '../../utils/commitUtils';
import { format } from 'date-fns';
import { toast } from 'sonner';

/**
 * File change item component
 */
const FileChangeItem = ({ file, isExpanded, onToggle }) => {
  const getFileIcon = (status) => {
    switch (status) {
      case 'added':
        return <FilePlus className="h-4 w-4 text-green-600" />;
      case 'removed':
        return <FileMinus className="h-4 w-4 text-red-600" />;
      case 'modified':
        return <File className="h-4 w-4 text-blue-600" />;
      case 'renamed':
        return <ArrowRight className="h-4 w-4 text-purple-600" />;
      default:
        return <File className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'added':
        return 'bg-green-100 text-green-800';
      case 'removed':
        return 'bg-red-100 text-red-800';
      case 'modified':
        return 'bg-blue-100 text-blue-800';
      case 'renamed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const copyFilename = () => {
    navigator.clipboard.writeText(file.filename);
    toast.success('Filename copied to clipboard');
  };

  return (
    <div className="border rounded-lg">
      {/* File header */}
      <div 
        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {getFileIcon(file.status)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-gray-900 truncate">
                {file.filename}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  copyFilename();
                }}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            {file.previousFilename && file.previousFilename !== file.filename && (
              <div className="text-xs text-gray-600 mt-1">
                Renamed from: <code className="font-mono">{file.previousFilename}</code>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Change stats */}
          <div className="flex items-center gap-2 text-xs">
            {file.additions > 0 && (
              <span className="text-green-600">+{file.additions}</span>
            )}
            {file.deletions > 0 && (
              <span className="text-red-600">-{file.deletions}</span>
            )}
          </div>
          
          {/* Status badge */}
          <Badge className={`text-xs ${getStatusColor(file.status)}`}>
            {file.status}
          </Badge>
          
          {/* Expand/collapse icon */}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </div>

      {/* File diff content */}
      {isExpanded && file.patch && (
        <div className="border-t">
          <div className="p-4 bg-white">
            <pre className="text-xs font-mono whitespace-pre-wrap break-words bg-gray-50 p-3 rounded overflow-x-auto">
              {file.patch}
            </pre>
          </div>
        </div>
      )}
      
      {/* No patch available message */}
      {isExpanded && !file.patch && (
        <div className="border-t p-4 text-center text-sm text-gray-600">
          {file.status === 'added' && 'New file - no diff available'}
          {file.status === 'removed' && 'File deleted - no diff available'}
          {file.status === 'modified' && 'Diff not available'}
          {file.status === 'renamed' && 'File renamed - no content changes'}
        </div>
      )}
    </div>
  );
};

/**
 * Commit info card component
 */
const CommitInfoCard = ({ commit, title }) => {
  const formatDate = (date) => {
    return format(new Date(date), 'MMM d, yyyy \'at\' h:mm a');
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Commit message */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Message</h4>
          <div className="bg-gray-50 rounded p-3 text-sm">
            {commit.message || commit.shortMessage}
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Hash */}
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Commit Hash</h4>
            <div className="flex items-center gap-2">
              <Hash className="h-3 w-3 text-gray-400" />
              <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {commit.sha}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(commit.sha);
                  toast.success('Hash copied to clipboard');
                }}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Date */}
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Date</h4>
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span className="text-gray-700">{formatDate(getCommitDate(commit))}</span>
            </div>
          </div>
        </div>

        {/* Author */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Author</h4>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={getCommitAuthorAvatar(commit)} alt={getCommitAuthorDisplay(commit)} />
              <AvatarFallback>
                {getCommitAuthorInitials(commit)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900">
                {getCommitAuthorDisplay(commit)}
              </div>
              <div className="text-xs text-gray-600">
                {commit.author?.email || 'No email'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Main CommitComparison component
 */
const CommitComparison = ({ comparisonData, onClose }) => {
  const [expandedFiles, setExpandedFiles] = useState(new Set());

  if (!comparisonData) {
    return null;
  }

  const { baseCommit, headCommit, files = [], commits = [], status } = comparisonData;

  /**
   * Toggle file expansion
   */
  const toggleFileExpansion = (filename) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filename)) {
        newSet.delete(filename);
      } else {
        newSet.add(filename);
      }
      return newSet;
    });
  };

  /**
   * Expand all files
   */
  const expandAllFiles = () => {
    setExpandedFiles(new Set(files.map(f => f.filename)));
  };

  /**
   * Collapse all files
   */
  const collapseAllFiles = () => {
    setExpandedFiles(new Set());
  };

  /**
   * Get summary stats
   */
  const getTotalStats = () => {
    return files.reduce(
      (acc, file) => ({
        additions: acc.additions + (file.additions || 0),
        deletions: acc.deletions + (file.deletions || 0),
        changes: acc.changes + (file.changes || 0)
      }),
      { additions: 0, deletions: 0, changes: 0 }
    );
  };

  const totalStats = getTotalStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Commit Comparison
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Comparing {baseCommit.shortSha} with {headCommit.shortSha}
              {commits.length > 0 && ` • ${commits.length} commits between`}
            </p>
          </div>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Comparison overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CommitInfoCard commit={baseCommit} title="Base Commit" />
              <CommitInfoCard commit={headCommit} title="Head Commit" />
            </div>

            {/* Summary stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Changes Summary
                </CardTitle>
                <CardDescription>
                  Overview of all changes between the selected commits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {files.length}
                    </div>
                    <div className="text-sm text-gray-600">Files Changed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      +{totalStats.additions}
                    </div>
                    <div className="text-sm text-gray-600">Additions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      -{totalStats.deletions}
                    </div>
                    <div className="text-sm text-gray-600">Deletions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {commits.length}
                    </div>
                    <div className="text-sm text-gray-600">Commits</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File changes */}
            {files.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        File Changes ({files.length})
                      </CardTitle>
                      <CardDescription>
                        Detailed view of changes in each file
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={expandAllFiles}
                      >
                        Expand All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={collapseAllFiles}
                      >
                        Collapse All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {files.map((file) => (
                    <FileChangeItem
                      key={file.filename}
                      file={file}
                      isExpanded={expandedFiles.has(file.filename)}
                      onToggle={() => toggleFileExpansion(file.filename)}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* No changes */}
            {files.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <FileX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No File Changes
                    </h3>
                    <p className="text-gray-600">
                      {status === 'identical' 
                        ? 'The selected commits are identical.'
                        : 'No file changes found between the selected commits.'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* External link */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => window.open(comparisonData.htmlUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitComparison;
