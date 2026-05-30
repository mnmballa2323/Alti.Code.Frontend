"use client";
import { SearchIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@heroui/input";
import {
  Calendar,
  Code,
  Database,
  FileText,
  Sheet,
  Shield,
} from "lucide-react";
import { useState } from "react";

// Mock shadcn/ui components (simplified for this demo)
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}
  >
    {children}
  </div>
);

const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 ${className}`}>{children}</div>;

const Badge = ({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    secondary: "bg-blue-100 text-blue-800",
    outline: "border border-gray-300 text-gray-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};


const apps = [
  {
    id: 1,
    name: "Google Calendar",
    icon: <Calendar className="w-8 h-8 text-blue-600" />,
    description:
      "The Google Calendar API is a RESTful API that can be accessed through explicit HTTP calls. The API exposes most of the features available in the Google Calendar Web...",

    authType: "OAUTH2",
    bgColor: "bg-blue-50",
  },
  {
    id: 2,
    name: "AIDBASE",
    icon: <Database className="w-8 h-8 text-indigo-600" />,
    description:
      "Integration with Aidbase API to manage resources and workflows.",

    authType: "API_KEY",
    bgColor: "bg-indigo-50",
  },
  {
    id: 3,
    name: "arXiv",
    icon: <FileText className="w-8 h-8 text-red-600" />,
    description:
      "arXiv is an open-access repository of electronic preprints and postprints approved for posting after moderation, but not peer review. It consists of scientific papers in the fields of...",

    authType: "NO_AUTH",
    bgColor: "bg-red-50",
  },
  {
    id: 4,
    name: "Brave Search",
    icon: <Shield className="w-8 h-8 text-orange-600" />,
    description:
      "Brave Search API is a REST API to query Brave Search and get back search results from the web. It supports web search, summarizer search, image search, video search, news...",

    authType: "API_KEY",
    bgColor: "bg-orange-50",
  },
  {
    id: 5,
    name: "Coda",
    icon: <Code className="w-8 h-8 text-red-500" />,
    description:
      "Coda is a document editor that brings together documents, spreadsheets, and applications into a single flexible platform. It allows teams to collaborate in real-time, create interactive...",

    authType: "API_KEY",
    bgColor: "bg-red-50",
  },
  {
    id: 6,
    name: "Google Sheets",
    icon: <Sheet className="w-8 h-8 text-green-600" />,
    description:
      "The Google Sheets API is a RESTful API that allows programmatic access to spreadsheet data and formatting. It supports CRUD operations, formulas, charts, and...",

    authType: "OAUTH2",
    bgColor: "bg-green-50",
  },
];

export default function ToolsMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [connectedApps, setConnectedApps] = useState<number[]>([1,5]);

  const filteredApps = apps.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClickConnectApp = (app: number) => {
    // remove app if it is already connected and add if not

    if (connectedApps.includes(app)) {
      setConnectedApps(connectedApps.filter((a) => a !== app));
    } else {
      setConnectedApps([...connectedApps, app]);
    }
  };

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Connect your apps
          </h1>
        </div>

        <div className="mb-8">
          <Input
            className="w-[500px]"
            endContent={<SearchIcon className="text-default-400" width={16} />}
            placeholder="Search"
            size="lg"
          />
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <Card
              key={app.id}
              className=" transition-all flex border-none bg-default-100 flex-col flex-1 duration-200 group"
            >
              <CardContent className="flex flex-col flex-1 bg-default-100 border-none">
                <div className="flex flex-col flex-1">
                  {/* App Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${app.bgColor}`}>
                      {app.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {app.name}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {app.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4">
                  <Badge variant="outline" className="text-xs">
                    {app.authType}
                  </Badge>
                  <Button
                    onClick={() => handleClickConnectApp(app.id)}
                    size="sm"
                    className={cn(" transition-colors",
                      connectedApps.includes(app.id)
                        ? "bg-[#90D5FF] text-black hover:bg-[#90D5FF]/60"
                        : "bg-gray-800 hover:bg-gray-700"
                    )}
                  >
                    {
                      connectedApps.includes(app.id) ? "Connected" : "Connect"
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredApps.length === 0 && (
          <div className="text-center py-12">
            <p className="text-default-1000 text-lg">
              No apps found matching your search.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
