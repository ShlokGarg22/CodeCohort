import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Users, ArrowRight } from 'lucide-react';
import { techStackColors, difficultyColors } from '../data/mock';

const ProjectCard = ({ project, onJoinTeam, isJoined }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg hover:border-gray-300 transform hover:-translate-y-1 ${
        isHovered ? 'shadow-lg' : 'shadow-sm'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-900 leading-tight">
            {project.title}
          </h3>
          <Badge 
            variant="outline" 
            className="text-xs font-medium"
            style={{ 
              borderColor: difficultyColors[project.difficulty],
              color: difficultyColors[project.difficulty]
            }}
          >
            {project.difficulty}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {project.description}
        </p>

        {/* Tech Stack */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Tech Stack:
          </p>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        {/* Members and Join Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Users size={16} />
            <span>{project.membersJoined} members joined</span>
          </div>
          
          <Button 
            onClick={() => onJoinTeam(project.id)}
            className={`bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
              isJoined ? 'bg-green-600 hover:bg-green-700' : ''
            }`}
            size="sm"
          >
            <span>{isJoined ? 'Joined' : 'Join Team'}</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;