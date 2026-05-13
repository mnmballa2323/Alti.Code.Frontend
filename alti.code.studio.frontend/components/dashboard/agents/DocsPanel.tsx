"use client";

import React from "react";
import { FileText, BookOpen, RefreshCw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DocsPanel() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="bg-black/40 border-yellow-900/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-yellow-500">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> The Scribe
            </div>
            <Badge
              className="border-yellow-500 text-yellow-500"
              variant="outline"
            >
              Ready
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-yellow-200 font-medium">
                Auto-Generation Tasks
              </p>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  className="justify-start text-gray-300 hover:text-yellow-400 hover:bg-yellow-950/30"
                  variant="ghost"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Regenerate JSDoc for
                  modified files
                </Button>
                <Button
                  className="justify-start text-gray-300 hover:text-yellow-400 hover:bg-yellow-950/30"
                  variant="ghost"
                >
                  <BookOpen className="mr-2 h-4 w-4" /> Sync Wiki with latest
                  PRs
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t border-yellow-900/30">
              <p className="text-xs text-gray-500 mb-2">RECENTLY UPDATED</p>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>• Authentication Flow (Wiki)</li>
                <li>• User Service API (JSDoc)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
