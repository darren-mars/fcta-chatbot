import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-2 self-stretch px-4">
      <img
        className="h-12 flex-none object-cover"
        src="https://res.cloudinary.com/subframe/image/upload/v1736756333/uploads/5526/hulvdiytqjsxpm9ohnwn.png"
      />
      <div className="flex w-full flex-col justify-center items-center">
        <span className="w-full text-heading-2 font-heading-2 text-white text-center">
          Design Your Perfect Getaway
        </span>
        <span className="w-full text-heading-3 font-heading-3 text-white text-center">
          Tell us about your dream vacation and we&#39;ll craft a personalized luxury itinerary just for you.
        </span>
      </div>
    </div>
  );
};

export default Header;
