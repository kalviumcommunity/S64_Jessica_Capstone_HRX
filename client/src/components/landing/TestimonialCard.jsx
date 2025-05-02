
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const TestimonialCard = ({ quote, name, role }) => (
  <Card className="h-full hover:shadow-md transition-shadow duration-300">
    <CardContent className="p-6">
      <div className="text-primary mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"></path>
          <path d="M19 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"></path>
        </svg>
      </div>
      <p className="text-gray-700 mb-6 italic">{quote}</p>
      <div className="flex items-center">
        <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold mr-3">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default TestimonialCard;
