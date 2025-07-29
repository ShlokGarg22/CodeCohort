import React from 'react';

const Teams = () => {
  return (
    <div className="teams-container">
      <h2 className="text-2xl font-bold text-slate-200 mb-4">My Teams</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">E-commerce Analytics Team</h3>
          <p className="text-slate-400 text-sm mb-4">Building a comprehensive analytics dashboard for e-commerce metrics.</p>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-sm">3/5 members</span>
            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">Active</span>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">AI Code Review Team</h3>
          <p className="text-slate-400 text-sm mb-4">Developing an intelligent code review system with ML.</p>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-sm">2/4 members</span>
            <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">Recruiting</span>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Real-time Collaboration</h3>
          <p className="text-slate-400 text-sm mb-4">Creating a real-time collaboration platform for developers.</p>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-sm">1/6 members</span>
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Planning</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teams; 