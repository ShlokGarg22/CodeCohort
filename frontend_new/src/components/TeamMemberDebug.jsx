import React, { useEffect, useState } from 'react';
import { problemService } from '../services/problemService';

const TeamMemberDebug = ({ projectId }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const result = await problemService.getProblemById(projectId);
        if (result.success) {
          setProject(result.data);
          console.log('Project data:', result.data);
          console.log('Team members:', result.data.teamMembers);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>No project found</div>;

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-2">Team Member Data Debug</h3>
      <pre className="text-xs bg-white p-2 rounded overflow-auto">
        {JSON.stringify(project.teamMembers, null, 2)}
      </pre>
      
      <div className="mt-4">
        <h4 className="font-medium mb-2">Rendered Members:</h4>
        {project.teamMembers?.map((member, index) => {
          const userData = member.user || member;
          return (
            <div key={index} className="text-sm p-2 border-b">
              <strong>Index {index}:</strong> {userData?.fullName || userData?.username || 'Unknown'} (@{userData?.username || 'unknown'})
              <br />
              <span className="text-gray-500">ID: {userData?._id}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamMemberDebug;
