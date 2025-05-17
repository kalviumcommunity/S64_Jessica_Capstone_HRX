import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const FeatureCard = ({ icon, title, description }) => (
  <div>
    <Card className="h-full hover:shadow-lg transition-all duration-300 bg-card text-card-foreground border-border shadow-md relative overflow-visible">
      <CardContent className="p-6 flex flex-col items-center text-center relative z-10">
        <div className="mb-4 relative z-20">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-primary z-20">
          {title}
        </h3>
        <p className="text-muted-foreground z-20">
          {description}
        </p>
      </CardContent>
    </Card>
  </div>
);

export default FeatureCard;
