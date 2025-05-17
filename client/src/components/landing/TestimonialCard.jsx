import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const TestimonialCard = ({ quote, name, role }) => (
  <div>
    <Card className="h-full hover:shadow-lg transition-all duration-300 bg-card text-card-foreground border-border shadow-md relative overflow-visible">
      <CardContent className="p-6 relative z-10">
        <div className="text-primary mb-4 relative z-20">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"></path>
            <path d="M19 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"></path>
          </svg>
        </div>
        <p className="text-foreground mb-6 italic relative z-20">
          {quote}
        </p>
        <div className="flex items-center relative z-20">
          <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-semibold mr-3 relative overflow-hidden">
            {name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-primary">
              {name}
            </p>
            <p className="text-sm text-muted-foreground">
              {role}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default TestimonialCard;
