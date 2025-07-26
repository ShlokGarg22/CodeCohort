const ProblemCard = ({ problem, onJoinTeam }) => {
  return (
    <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-6 hover:shadow-2xl hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-white mb-2">{problem.title}</h3>
        <p className="text-slate-300 text-sm mb-4">{problem.description}</p>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-slate-200 mb-2">Tech Stack:</h4>
        <div className="flex flex-wrap gap-2">
          {problem.techStack.map((tech, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-medium tech-badge cursor-pointer"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-slate-400">
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
            />
          </svg>
          {problem.currentMembers}/{problem.totalMembers} members
        </div>
        <button 
          onClick={onJoinTeam}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium hover-scale"
        >
          Join Team
        </button>
      </div>
    </div>
  )
}

export default ProblemCard
