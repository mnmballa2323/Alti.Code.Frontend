"use client";

import { useState, useEffect } from "react";

import {
  getActiveProject,
  onProjectChange,
  type ActiveProject,
} from "@/lib/project";

/**
 * React hook — returns the currently active project and re-renders whenever
 * it changes (whether set from the sidebar or any other page).
 */
export function useActiveProject(): ActiveProject {
  const [project, setProject] = useState<ActiveProject>(() =>
    getActiveProject(),
  );

  useEffect(() => {
    // Sync on mount in case localStorage was updated before hydration
    setProject(getActiveProject());

    // Listen for subsequent changes
    return onProjectChange(setProject);
  }, []);

  return project;
}
