/**
 * GitHub Service for fetching repository data
 * Handles all GitHub API interactions for version history
 */

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Extract owner and repo name from GitHub URL
 * Supports various GitHub URL formats
 */
const parseGitHubUrl = (url) => {
  try {
    // Remove trailing slash and .git extension
    const cleanUrl = url.replace(/\/$/, '').replace(/\.git$/, '');
    
    // Handle different GitHub URL formats
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+)$/,  // https://github.com/owner/repo
      /github\.com\/([^\/]+)\/([^\/]+)\//, // https://github.com/owner/repo/...
    ];
    
    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2]
        };
      }
    }
    
    throw new Error('Invalid GitHub URL format');
  } catch (error) {
    throw new Error('Failed to parse GitHub URL');
  }
};

/**
 * Detect change type from commit message
 * Returns appropriate tag/label for the commit
 */
const detectChangeType = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Define patterns for different change types
  const patterns = {
    'Bug Fix': ['fix', 'bug', 'patch', 'hotfix', 'issue'],
    'Feature': ['feat', 'feature', 'add', 'new', 'implement'],
    'Documentation': ['doc', 'readme', 'comment', 'documentation'],
    'Refactor': ['refactor', 'cleanup', 'improve', 'optimize'],
    'Style': ['style', 'format', 'indent', 'whitespace'],
    'Test': ['test', 'spec', 'coverage'],
    'Build': ['build', 'deploy', 'ci', 'cd'],
    'Performance': ['perf', 'performance', 'speed', 'optimize'],
    'Security': ['security', 'auth', 'permission', 'vulnerability'],
    'Breaking Change': ['breaking', 'major', 'remove', 'deprecated'],
    'Merge': ['merge', 'pull request', 'pr'],
    'Initial': ['initial', 'first', 'setup', 'init']
  };
  
  // Check each pattern
  for (const [type, keywords] of Object.entries(patterns)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return type;
    }
  }
  
  return 'General'; // Default type
};

/**
 * Get color for change type tags
 */
const getChangeTypeColor = (type) => {
  const colors = {
    'Bug Fix': 'bg-red-100 text-red-800',
    'Feature': 'bg-green-100 text-green-800',
    'Documentation': 'bg-blue-100 text-blue-800',
    'Refactor': 'bg-purple-100 text-purple-800',
    'Style': 'bg-pink-100 text-pink-800',
    'Test': 'bg-yellow-100 text-yellow-800',
    'Build': 'bg-orange-100 text-orange-800',
    'Performance': 'bg-indigo-100 text-indigo-800',
    'Security': 'bg-red-200 text-red-900',
    'Breaking Change': 'bg-red-200 text-red-900',
    'Merge': 'bg-gray-100 text-gray-800',
    'Initial': 'bg-emerald-100 text-emerald-800',
    'General': 'bg-gray-100 text-gray-700'
  };
  
  return colors[type] || colors['General'];
};

export const githubService = {
  /**
   * Validate if a GitHub repository URL is accessible
   */
  async validateRepository(repoUrl) {
    try {
      const { owner, repo } = parseGitHubUrl(repoUrl);
      
      const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found or is private');
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const repoData = await response.json();
      return {
        isValid: true,
        repoData: {
          name: repoData.name,
          fullName: repoData.full_name,
          description: repoData.description,
          language: repoData.language,
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          updatedAt: repoData.updated_at,
          createdAt: repoData.created_at,
          isPrivate: repoData.private,
          owner: {
            login: repoData.owner.login,
            avatar: repoData.owner.avatar_url,
            type: repoData.owner.type
          }
        }
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  },

  /**
   * Fetch commit history for a repository
   * @param {string} repoUrl - GitHub repository URL
   * @param {number} page - Page number for pagination (default: 1)
   * @param {number} perPage - Number of commits per page (default: 30)
   */
  async getCommitHistory(repoUrl, page = 1, perPage = 30) {
    try {
      const { owner, repo } = parseGitHubUrl(repoUrl);
      
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?page=${page}&per_page=${perPage}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found or commits are not accessible');
        }
        throw new Error(`Failed to fetch commits: ${response.status}`);
      }
      
      const commits = await response.json();
      
      // Process commits to add change type detection
      const processedCommits = commits.map((commit, index) => ({
        sha: commit.sha,
        shortSha: commit.sha.substring(0, 7),
        message: commit.commit.message,
        messageLines: commit.commit.message.split('\n').filter(line => line.trim()),
        shortMessage: commit.commit.message.split('\n')[0] || 'No message',
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date,
          avatar: commit.author?.avatar_url || `https://github.com/identicons/${commit.commit.author.email}.png`,
          username: commit.author?.login || commit.commit.author.name,
          profileUrl: commit.author?.html_url
        },
        committer: {
          name: commit.commit.committer.name,
          email: commit.commit.committer.email,
          date: commit.commit.committer.date
        },
        changeType: detectChangeType(commit.commit.message),
        htmlUrl: commit.html_url,
        parentsCount: commit.parents.length,
        parents: commit.parents,
        stats: commit.stats || null, // May not be available in list view
        files: commit.files || null,  // May not be available in list view
        version: `v${commits.length - index}`, // Generate version numbers
        timestamp: new Date(commit.commit.author.date).getTime()
      }));
      
      return {
        commits: processedCommits,
        hasMore: commits.length === perPage, // Simple pagination check
        page: page,
        perPage: perPage
      };
      
    } catch (error) {
      throw new Error(`Failed to fetch commit history: ${error.message}`);
    }
  },

  /**
   * Get detailed information about a specific commit
   * @param {string} repoUrl - GitHub repository URL  
   * @param {string} sha - Commit SHA
   */
  async getCommitDetails(repoUrl, sha) {
    try {
      const { owner, repo } = parseGitHubUrl(repoUrl);
      
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${sha}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch commit details: ${response.status}`);
      }
      
      const commit = await response.json();
      
      return {
        sha: commit.sha,
        shortSha: commit.sha.substring(0, 7),
        message: commit.commit.message,
        messageLines: commit.commit.message.split('\n').filter(line => line.trim()),
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date,
          avatar: commit.author?.avatar_url || `https://github.com/identicons/${commit.commit.author.email}.png`,
          username: commit.author?.login || commit.commit.author.name,
          profileUrl: commit.author?.html_url
        },
        committer: {
          name: commit.commit.committer.name,
          email: commit.commit.committer.email,
          date: commit.commit.committer.date
        },
        changeType: detectChangeType(commit.commit.message),
        htmlUrl: commit.html_url,
        parents: commit.parents,
        stats: {
          total: commit.stats.total,
          additions: commit.stats.additions,
          deletions: commit.stats.deletions
        },
        files: commit.files.map(file => ({
          filename: file.filename,
          status: file.status, // added, removed, modified, renamed
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes,
          patch: file.patch,
          rawUrl: file.raw_url,
          blobUrl: file.blob_url
        }))
      };
      
    } catch (error) {
      throw new Error(`Failed to fetch commit details: ${error.message}`);
    }
  },

  /**
   * Compare two commits
   * @param {string} repoUrl - GitHub repository URL
   * @param {string} base - Base commit SHA
   * @param {string} head - Head commit SHA  
   */
  async compareCommits(repoUrl, base, head) {
    try {
      const { owner, repo } = parseGitHubUrl(repoUrl);
      
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/compare/${base}...${head}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to compare commits: ${response.status}`);
      }
      
      const comparison = await response.json();
      
      return {
        status: comparison.status, // identical, ahead, behind, diverged
        aheadBy: comparison.ahead_by,
        behindBy: comparison.behind_by,
        totalCommits: comparison.total_commits,
        htmlUrl: comparison.html_url,
        permalinkUrl: comparison.permalink_url,
        diffUrl: comparison.diff_url,
        patchUrl: comparison.patch_url,
        baseCommit: {
          sha: comparison.base_commit.sha,
          shortSha: comparison.base_commit.sha.substring(0, 7)
        },
        mergeBaseCommit: {
          sha: comparison.merge_base_commit.sha,
          shortSha: comparison.merge_base_commit.sha.substring(0, 7)
        },
        commits: comparison.commits.map(commit => ({
          sha: commit.sha,
          shortSha: commit.sha.substring(0, 7),
          message: commit.commit.message.split('\n')[0],
          author: commit.commit.author,
          date: commit.commit.author.date
        })),
        files: comparison.files.map(file => ({
          filename: file.filename,
          status: file.status,
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes,
          patch: file.patch,
          rawUrl: file.raw_url,
          blobUrl: file.blob_url,
          contentsUrl: file.contents_url,
          previousFilename: file.previous_filename
        }))
      };
      
    } catch (error) {
      throw new Error(`Failed to compare commits: ${error.message}`);
    }
  },

  /**
   * Helper function to get change type color
   */
  getChangeTypeColor,

  /**
   * Helper function to parse GitHub URL
   */
  parseGitHubUrl
};
