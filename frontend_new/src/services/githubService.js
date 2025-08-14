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
      
      const apiUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;
      
      const response = await fetch(apiUrl, {
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
      console.log(`Repository validation successful: ${repoData.full_name}`);
      
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
          stargazers_count: repoData.stargazers_count,
          forks_count: repoData.forks_count,
          watchers_count: repoData.watchers_count,
          owner: {
            login: repoData.owner.login,
            avatar: repoData.owner.avatar_url,
            type: repoData.owner.type
          }
        }
      };
    } catch (error) {
      console.error('Repository validation failed:', error.message);
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
      
      const apiUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?page=${page}&per_page=${perPage}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found or commits are not accessible');
        }
        throw new Error(`Failed to fetch commits: ${response.status}`);
      }
      
      const commits = await response.json();
      console.log(`Fetched ${commits.length} commits from ${owner}/${repo}`);
      
      // Process commits to add change type detection
      const processedCommits = commits.map((commit, index) => {
        // Ensure author is properly structured
        const authorName = commit.commit?.author?.name || 'Unknown';
        const authorEmail = commit.commit?.author?.email || '';
        const authorDate = commit.commit?.author?.date || new Date().toISOString();
        const authorUsername = commit.author?.login || authorName;
        const authorAvatar = commit.author?.avatar_url || `https://github.com/identicons/${authorEmail}.png`;
        const authorProfile = commit.author?.html_url;

        return {
          sha: commit.sha,
          shortSha: commit.sha.substring(0, 7),
          message: commit.commit.message,
          messageLines: commit.commit.message.split('\n').filter(line => line.trim()),
          shortMessage: commit.commit.message.split('\n')[0] || 'No message',
          author: {
            name: authorName,
            email: authorEmail,
            date: authorDate,
            avatar: authorAvatar,
            username: authorUsername,
            profileUrl: authorProfile
          },
          committer: {
            name: commit.commit.committer?.name || authorName,
            email: commit.commit.committer?.email || authorEmail,
            date: commit.commit.committer?.date || authorDate
          },
          changeType: detectChangeType(commit.commit.message),
          htmlUrl: commit.html_url,
          parentsCount: commit.parents?.length || 0,
          parents: commit.parents || [],
          stats: commit.stats || null, // May not be available in list view
          files: commit.files || null,  // May not be available in list view
          version: `v${commits.length - index}`, // Generate version numbers
          timestamp: new Date(authorDate).getTime()
        };
      });
      
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
      
      // Ensure proper data structure
      const authorName = commit.commit?.author?.name || 'Unknown';
      const authorEmail = commit.commit?.author?.email || '';
      const authorDate = commit.commit?.author?.date || new Date().toISOString();
      const authorUsername = commit.author?.login || authorName;
      const authorAvatar = commit.author?.avatar_url || `https://github.com/identicons/${authorEmail}.png`;
      const authorProfile = commit.author?.html_url;
      
      return {
        sha: commit.sha,
        shortSha: commit.sha.substring(0, 7),
        message: commit.commit.message,
        messageLines: commit.commit.message.split('\n').filter(line => line.trim()),
        author: {
          name: authorName,
          email: authorEmail,
          date: authorDate,
          avatar: authorAvatar,
          username: authorUsername,
          profileUrl: authorProfile
        },
        committer: {
          name: commit.commit.committer?.name || authorName,
          email: commit.commit.committer?.email || authorEmail,
          date: commit.commit.committer?.date || authorDate
        },
        changeType: detectChangeType(commit.commit.message),
        htmlUrl: commit.html_url,
        parents: commit.parents || [],
        stats: {
          total: commit.stats?.total || 0,
          additions: commit.stats?.additions || 0,
          deletions: commit.stats?.deletions || 0
        },
        files: (commit.files || []).map(file => ({
          filename: file.filename,
          status: file.status, // added, removed, modified, renamed
          additions: file.additions || 0,
          deletions: file.deletions || 0,
          changes: file.changes || 0,
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
  parseGitHubUrl,

  /**
   * Get repository contributors
   * @param {string} repoUrl - GitHub repository URL
   */
  async getContributors(repoUrl) {
    try {
      const { owner, repo } = parseGitHubUrl(repoUrl);
      
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=100`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch contributors: ${response.status}`);
      }
      
      const contributors = await response.json();
      
      return contributors.map(contributor => ({
        login: contributor.login,
        id: contributor.id,
        avatar_url: contributor.avatar_url,
        html_url: contributor.html_url,
        contributions: contributor.contributions,
        type: contributor.type
      }));
      
    } catch (error) {
      console.warn(`Could not fetch contributors: ${error.message}`);
      return []; // Return empty array if contributors are not accessible
    }
  },

  /**
   * Get repository branches
   * @param {string} repoUrl - GitHub repository URL
   */
  async getBranches(repoUrl) {
    try {
      const { owner, repo } = parseGitHubUrl(repoUrl);
      
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/branches?per_page=100`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch branches: ${response.status}`);
      }
      
      const branches = await response.json();
      
      return branches.map(branch => ({
        name: branch.name,
        commit: {
          sha: branch.commit.sha,
          url: branch.commit.url
        },
        protected: branch.protected || false
      }));
      
    } catch (error) {
      console.warn(`Could not fetch branches: ${error.message}`);
      return []; // Return empty array if branches are not accessible
    }
  },

  /**
   * Get code frequency data (weekly additions/deletions)
   * @param {string} repoUrl - GitHub repository URL
   */
  async getCodeFrequency(repoUrl) {
    try {
      const { owner, repo } = parseGitHubUrl(repoUrl);
      
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/stats/code_frequency`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch code frequency: ${response.status}`);
      }
      
      const data = await response.json();
      
      // GitHub returns an array of [week_timestamp, additions, deletions]
      return data.map(week => ({
        week: new Date(week[0] * 1000), // Convert Unix timestamp to Date
        additions: week[1],
        deletions: Math.abs(week[2]), // Make deletions positive for display
        net: week[1] + week[2] // Net change (additions - deletions)
      }));
      
    } catch (error) {
      console.warn(`Could not fetch code frequency: ${error.message}`);
      return []; // Return empty array if data is not accessible
    }
  },

  /**
   * Get repository statistics
   * @param {string} repoUrl - GitHub repository URL
   */
  async getRepoStats(repoUrl) {
    try {
      const { owner, repo } = parseGitHubUrl(repoUrl);
      
      // Fetch repository basic info
      const repoResponse = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );
      
      if (!repoResponse.ok) {
        throw new Error(`Failed to fetch repository stats: ${repoResponse.status}`);
      }
      
      const repoData = await repoResponse.json();
      
      // Try to fetch commit activity (may not be available for all repos)
      let commitActivity = null;
      try {
        const activityResponse = await fetch(
          `${GITHUB_API_BASE}/repos/${owner}/${repo}/stats/commit_activity`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
            }
          }
        );
        
        if (activityResponse.ok) {
          commitActivity = await activityResponse.json();
        }
      } catch (error) {
        console.warn('Could not fetch commit activity');
      }
      
      // Calculate total commits from activity if available
      let totalCommits = 0;
      if (commitActivity && Array.isArray(commitActivity)) {
        totalCommits = commitActivity.reduce((sum, week) => sum + week.total, 0);
      }
      
      return {
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        language: repoData.language,
        size: repoData.size, // Size in KB
        stargazers_count: repoData.stargazers_count,
        watchers_count: repoData.watchers_count,
        forks_count: repoData.forks_count,
        open_issues_count: repoData.open_issues_count,
        created_at: repoData.created_at,
        updated_at: repoData.updated_at,
        pushed_at: repoData.pushed_at,
        default_branch: repoData.default_branch,
        topics: repoData.topics || [],
        license: repoData.license?.name || null,
        totalCommits: totalCommits,
        lastUpdated: repoData.updated_at,
        linesOfCode: repoData.size * 1000, // Rough estimation
        isPrivate: repoData.private,
        hasIssues: repoData.has_issues,
        hasWiki: repoData.has_wiki,
        hasPages: repoData.has_pages
      };
      
    } catch (error) {
      console.warn(`Could not fetch repository stats: ${error.message}`);
      return null;
    }
  },

  /**
   * Get pull requests for the repository
   * @param {string} repoUrl - GitHub repository URL
   * @param {string} state - PR state (open, closed, all)
   */
  async getPullRequests(repoUrl, state = 'all') {
    try {
      const { owner, repo } = parseGitHubUrl(repoUrl);
      
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=${state}&per_page=100`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pull requests: ${response.status}`);
      }
      
      const pullRequests = await response.json();
      
      return pullRequests.map(pr => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        user: {
          login: pr.user.login,
          avatar_url: pr.user.avatar_url
        },
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        merged_at: pr.merged_at,
        html_url: pr.html_url,
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files: pr.changed_files
      }));
      
    } catch (error) {
      console.warn(`Could not fetch pull requests: ${error.message}`);
      return [];
    }
  },

  /**
   * Get commit activity statistics
   * @param {string} repoUrl - GitHub repository URL
   */
  async getCommitActivity(repoUrl) {
    try {
      const { owner, repo } = parseGitHubUrl(repoUrl);
      
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/stats/commit_activity`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch commit activity: ${response.status}`);
      }
      
      const activity = await response.json();
      
      return activity.map(week => ({
        week: new Date(week.week * 1000),
        total: week.total,
        days: week.days // Array of commits per day [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
      }));
      
    } catch (error) {
      console.warn(`Could not fetch commit activity: ${error.message}`);
      return [];
    }
  }
};
