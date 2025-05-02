
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const FeatureCard = ({ icon, title, description }) => (
  <Card className="h-full hover:shadow-md transition-shadow duration-300">
    <CardContent className="p-6 flex flex-col items-center text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </CardContent>
  </Card>
);

export default FeatureCard;
