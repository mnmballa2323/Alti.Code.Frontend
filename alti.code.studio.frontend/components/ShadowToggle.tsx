"use client";

import React from "react";
import { Switch } from "@heroui/switch";
import { Chip } from "@heroui/chip";
// Note: using @heroui/react as entry point based on user instruction or check package.json if modular
// If build fails, we switch to specific imports like @heroui/switch
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import { API_URL } from "@/lib/config";
import { RootState } from "@/store";
import { toggleShadowMode } from "@/store/shadowSlice";

export const ShadowToggle = (): React.ReactNode => {
  const dispatch = useDispatch();
  const isShadowEnabled = useSelector(
    (state: RootState) => state.shadow.isEnabled,
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const handleToggle = async (isSelected: boolean) => {
    setIsLoading(true);
    try {
      if (isSelected) {
        // Determine if we need to Initialize Shadow Workspace on toggle ON
        // For now, let's just claim it's ready. In real app, we might call /shadow/init here.
        await axios.post(`${API_URL}/shadow/init`);
      }
      dispatch(toggleShadowMode()); // Only toggle if API call succeeds or we trust it
    } catch (error) {
      console.error("Failed to init shadow mode", error);
      // Optionally show toast error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        className="group"
        color="warning"
        isDisabled={isLoading}
        isSelected={isShadowEnabled}
        size="sm"
        thumbIcon={({ isSelected, className }) =>
          isSelected ? (
            <span className={className}>👻</span>
          ) : (
            <span className={className}>🛡️</span>
          )
        }
        onValueChange={handleToggle}
      >
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-bold tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
            MODE
          </span>
          <span
            className={`text-xs font-mono font-bold ${isShadowEnabled ? "text-yellow-500" : "text-green-500"}`}
          >
            {isShadowEnabled ? "SHADOW" : "LIVE"}
          </span>
        </div>
      </Switch>
      {isShadowEnabled && (
        <Chip
          className="animate-pulse border-yellow-500/50"
          color="warning"
          size="sm"
          variant="dot"
        >
          SANDBOX ACTIVE
        </Chip>
      )}
    </div>
  );
};
