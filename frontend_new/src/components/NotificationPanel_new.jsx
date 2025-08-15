import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Bell } from 'lucide-react';

const NotificationPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50">
      <div className="fixed right-4 top-16 w-96 max-h-[80vh] overflow-hidden">
        <Card className="shadow-xl border-0">
          <CardHeader className="border-b bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No notifications yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Join requests and updates will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationPanel;
