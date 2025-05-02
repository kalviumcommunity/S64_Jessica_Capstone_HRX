
import React from "react";
import { Check as CheckIcon } from "lucide-react";

const AccessItem = ({ text }) => (
  <li className="flex items-center">
    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
    <span className="text-gray-700">{text}</span>
  </li>
);

export default AccessItem;
