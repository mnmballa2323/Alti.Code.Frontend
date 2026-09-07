import { invoke } from "@tauri-apps/api/core";

/**
 * --------------------------------------------------------------------------
 * Alti Code Studio — Rust IPC Bridge
 * --------------------------------------------------------------------------
 * This module connects the React frontend directly to the Rust binary
 * running in the Tauri host. It enables bare-metal file system access,
 * bypassing Node.js/Electron bottlenecks for parsing 10,000+ files.
 */

// Define standard types for our OS IPC
export type DirectoryEntry = string;

const isTauri =
  typeof window !== "undefined" &&
  (window as any).__TAURI_INTERNALS__ !== undefined;

/**
 * Reads a file directly from the local OS using Rust's fs module.
 * @param path The absolute path to the file
 */
export async function readOsFile(path: string): Promise<string> {
  if (!isTauri) throw new Error("Not running in Tauri desktop environment");
  try {
    const content = await invoke<string>("read_file_native", { path });

    return content;
  } catch (error) {
    console.error(`[Rust IPC] Failed to read file ${path}:`, error);
    throw error;
  }
}

/**
 * Writes content to a file directly on the local OS.
 * @param path The absolute path to write to
 * @param content The string content to write
 */
export async function writeOsFile(
  path: string,
  content: string,
): Promise<void> {
  if (!isTauri) throw new Error("Not running in Tauri desktop environment");
  try {
    await invoke<void>("write_file_native", { path, content });
  } catch (error) {
    console.error(`[Rust IPC] Failed to write file ${path}:`, error);
    throw error;
  }
}

/**
 * Lists the contents of a directory using Rust.
 * @param path The absolute path to the directory
 */
export async function listOsDirectory(path: string): Promise<DirectoryEntry[]> {
  if (!isTauri) throw new Error("Not running in Tauri desktop environment");
  try {
    const entries = await invoke<string[]>("list_directory_native", { path });

    return entries;
  } catch (error) {
    console.error(`[Rust IPC] Failed to list directory ${path}:`, error);
    throw error;
  }
}

/**
 * Triggers a native system command via the Rust bridge.
 * Very powerful - allows the Swarm to run docker, apt-get, brew, etc.
 */
export async function executeOsCommand(
  command: string,
  args: string[],
): Promise<string> {
  if (!isTauri) throw new Error("Not running in Tauri desktop environment");
  try {
    const output = await invoke<string>("execute_os_command", {
      command,
      args,
    });

    return output;
  } catch (error) {
    console.error(`[Rust IPC] Command Execution Failed (${command}):`, error);
    throw error;
  }
}
