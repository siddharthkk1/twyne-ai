
import React from "react";
import { Hang } from "./types";

interface IdealHangsProps {
  hangs: Hang[];
}

export const IdealHangs: React.FC<IdealHangsProps> = ({ hangs }) => {
  const gradients = [
    'from-blue-100 to-indigo-50 border-blue-200',
    'from-purple-100 to-pink-50 border-purple-200',
    'from-green-100 to-teal-50 border-green-200',
    'from-amber-100 to-yellow-50 border-amber-200',
    'from-rose-100 to-red-50 border-rose-200',
    'from-sky-100 to-cyan-50 border-sky-200'
  ];
  
  return (
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-1.5">IDEAL HANGS</h4>
      <div className="grid grid-cols-2 gap-2">
        {hangs.map((hang, i) => (
          <div 
            key={i} 
            className={`bg-gradient-to-br ${gradients[i % gradients.length]} border rounded-lg p-2 flex items-center shadow-sm transition-transform hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-center h-7 w-7 rounded-full bg-white/70 mr-2 flex-shrink-0">
              <span className="text-lg">{hang.emoji}</span>
            </div>
            <span className="text-sm font-medium">{hang.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
