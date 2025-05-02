
import React from "react";

const WorkStep = ({ number, icon, title, description }) => (
  <div className="flex flex-col items-center text-center max-w-xs">
    <div className="relative">
      <div className="bg-primary h-16 w-16 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="absolute -top-3 -right-3 bg-white h-8 w-8 rounded-full shadow flex items-center justify-center text-sm font-bold text-primary border border-primary">
        {number}
      </div>
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default WorkStep;
