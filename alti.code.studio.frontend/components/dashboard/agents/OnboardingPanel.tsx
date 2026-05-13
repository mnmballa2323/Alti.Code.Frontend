"use client";

import React from "react";
import { Users, UserPlus, GraduationCap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OnboardingPanel() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="bg-black/40 border-green-900/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-green-500">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" /> The Recruiter
            </div>
            <Badge
              className="border-green-500 text-green-500"
              variant="outline"
            >
              Online
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-200">
                Quick Onboard
              </label>
              <div className="flex gap-2">
                <Input
                  className="bg-green-950/20 border-green-900/50 text-white"
                  placeholder="dev@alti.com"
                />
                <Button className="bg-green-900/50 hover:bg-green-900 text-green-200 border border-green-800">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-green-900/30">
              <Button
                className="w-full border-green-800 text-green-500 hover:bg-green-950"
                variant="outline"
              >
                <GraduationCap className="mr-2 h-4 w-4" /> Generate Training
                Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
