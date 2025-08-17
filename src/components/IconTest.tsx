import React, { useState } from 'react';
import PadlockIcon from './PadlockIcon';
import HeartIcon from './HeartIcon';
import YouTubeIcon from './YouTubeIcon';
import TwitterIcon from './TwitterIcon';
import LinkedInIcon from './LinkedInIcon';

const IconTest: React.FC = () => {
  const [isLocked, setIsLocked] = useState(true);

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Icon Test Page</h2>
        
        {/* Padlock Icon Test */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Padlock Icon (with states)</h3>
          <div className="flex items-center space-x-4">
            <PadlockIcon isLocked={isLocked} />
            <button 
              onClick={() => setIsLocked(!isLocked)}
              className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
            >
              Toggle Lock (Currently: {isLocked ? 'Locked' : 'Unlocked'})
            </button>
          </div>
        </div>

        {/* Heart Icon Test */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Heart Icon</h3>
          <div className="flex items-center space-x-4">
            <div className="bg-red-500 p-2 rounded">
              <HeartIcon />
            </div>
            <HeartIcon size={32} className="text-red-500" />
          </div>
        </div>

        {/* Social Media Icons Test */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Social Media Icons</h3>
          <div className="flex items-center space-x-4 bg-emerald-800 p-4 rounded group">
            <YouTubeIcon />
            <TwitterIcon />
            <LinkedInIcon />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconTest;