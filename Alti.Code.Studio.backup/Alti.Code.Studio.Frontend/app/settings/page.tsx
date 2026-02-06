"use client";

import React, { useEffect, useState } from "react";
import { Switch, Card, CardHeader, CardBody, Divider, Button, Select, SelectItem } from "@heroui/react";
import { toast } from "react-hot-toast";
import { getUserData, updateUserData } from "@/lib/user";
import { useSession } from "next-auth/react"; // Assuming next-auth usage based on package.json, or similar auth hook
import { useSelector } from "react-redux";
// NOTE: Ideally we use a Redux selector for user data if available, but for now we fetch fresh

export default function SettingsPage() {
    const [memoryEnabled, setMemoryEnabled] = useState(true);
    const [theme, setTheme] = useState("system");
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // Quick way to get token/user from localStorage if not fully integrated with Redux yet
    useEffect(() => {
        const storedToken = localStorage.getItem("accessToken");
        if (storedToken) {
            setToken(storedToken);
            getUserData(storedToken).then(res => {
                if (res.data) {
                    setUserId(res.data._id);
                    if (res.data.preferences) {
                        setMemoryEnabled(res.data.preferences.memoryEnabled);
                        setTheme(res.data.preferences.theme);
                    }
                }
            }).catch(err => console.error(err));
        }
    }, []);

    const handleSave = async () => {
        if (!userId || !token) {
            toast.error("You must be logged in to save settings");
            return;
        }

        setLoading(true);
        try {
            await updateUserData(userId, {
                preferences: {
                    memoryEnabled,
                    theme,
                    notifications: true // Default for now
                }
            }, token);

            toast.success("Settings saved successfully");
        } catch (error) {
            toast.error("Failed to save settings");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-4xl px-6 pt-10">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Settings</h1>
            <p className="text-default-500 text-lg mb-8">Manage your preferences and AI memory settings.</p>

            <div className="flex flex-col gap-6">
                {/* AI Memory Section */}
                <Card className="max-w-full">
                    <CardHeader className="flex gap-3">
                        <div className="flex flex-col">
                            <p className="text-md font-bold">AI Memory</p>
                            <p className="text-small text-default-500">Allow the AI to remember details about you and past conversations.</p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-default-700">Enable Long-term Memory</span>
                            <Switch
                                isSelected={memoryEnabled}
                                onValueChange={setMemoryEnabled}
                                color="success"
                            />
                        </div>
                    </CardBody>
                </Card>

                {/* Appearance Section */}
                <Card className="max-w-full">
                    <CardHeader className="flex gap-3">
                        <div className="flex flex-col">
                            <p className="text-md font-bold">Appearance</p>
                            <p className="text-small text-default-500">Customize the look and feel of the application.</p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-default-700">Theme</span>
                            <Select
                                selectedKeys={[theme]}
                                onChange={(e) => setTheme(e.target.value)}
                                className="max-w-xs"
                                aria-label="Select theme"
                            >
                                <SelectItem key="system" value="system">System</SelectItem>
                                <SelectItem key="light" value="light">Light</SelectItem>
                                <SelectItem key="dark" value="dark">Dark</SelectItem>
                            </Select>
                        </div>
                    </CardBody>
                </Card>

                <div className="flex justify-end">
                    <Button color="primary" onPress={handleSave} isLoading={loading}>
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
