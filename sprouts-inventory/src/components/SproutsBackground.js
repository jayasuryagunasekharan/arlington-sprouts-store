import React from 'react';

function SproutsBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-green-50 opacity-50"></div>
      <div className="absolute inset-x-0 bottom-0 h-[87%] flex flex-wrap justify-center items-end overflow-hidden">
        {[...Array(50)].map((_, index) => (
          <div
            key={index}
            className="text-green-300 text-6xl transform rotate-45 m-4"
            style={{
              opacity: Math.random() * 0.5 + 0.1,
              transform: `rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.5 + 0.5})`,
            }}
          >
            🌱
          </div>
        ))}
      </div>
    </div>
  );
}

export default SproutsBackground;
