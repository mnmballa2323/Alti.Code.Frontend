{
  "feature": "Notification System",
  "description": "Design a notification system",
  "techStack": [
    "Node.js"
  ],
  "components": [
    {
      "name": "Notification Engine",
      "type": "backend",
      "path": "src/temp_notification.js",
      "description": "Sends notifications"
    }
  ],
  "files": [
    {
      "path": "src/temp_notification.js",
      "instruction": "Write a notification function"
    }
  ],
  "adrs": [
    {
      "title": "Use Redis",
      "context": "For low-latency queueing"
    }
  ]
}