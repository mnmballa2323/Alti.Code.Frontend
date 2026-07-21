export const history = [
  {
    topic: "React Component Lifecycle Methods",
    chat: [
      {
        from: "user",
        message: "When should I use componentDidMount vs useEffect in React?",
      },
      {
        from: "assistant",
        message:
          "componentDidMount is for class components and runs once after initial render. For functional components, use useEffect with an empty dependency array (useEffect(() => {}, [])) to achieve the same behavior.",
      },
    ],
  },
  {
    topic: "CSS Grid Layout Issues",
    chat: [
      {
        from: "user",
        message: "My grid items aren't respecting the defined column sizes",
      },
      {
        from: "assistant",
        message:
          "Try adding grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) to your grid container. Also check for min-width constraints on child elements that might be overriding your grid layout.",
      },
    ],
  },
  {
    topic: "API Fetch Error Handling",
    chat: [
      {
        from: "user",
        message: "How can I properly handle 404 errors from my API calls?",
      },
      {
        from: "assistant",
        message:
          "Wrap your fetch in a try-catch block and check response.ok. For example: `if (!response.ok) throw new Error('Not found');` Then display appropriate UI in your catch block.",
      },
    ],
  },
  {
    topic: "TypeScript Interface vs Type",
    chat: [
      {
        from: "user",
        message: "When should I use interface versus type in TypeScript?",
      },
      {
        from: "assistant",
        message:
          "Use interfaces for object shapes that may be extended or implemented. Use type for unions, tuples, or complex type compositions. For simple object shapes, either works but interfaces are generally preferred.",
      },
    ],
  },
  {
    topic: "Deploying to Vercel",
    chat: [
      {
        from: "user",
        message: "My Next.js app deployment fails with 'Module not found'",
      },
      {
        from: "assistant",
        message:
          "This typically happens when dependencies aren't properly installed. Try deleting node_modules and package-lock.json, then run 'npm install' before redeploying. Also verify all imports match your package.json.",
      },
    ],
  },
  {
    topic: "JWT Authentication Flow",
    chat: [
      {
        from: "user",
        message: "What's the proper way to store JWT tokens securely?",
      },
      {
        from: "assistant",
        message:
          "Store tokens in httpOnly cookies for web apps to prevent XSS attacks. For mobile/native apps, use secure storage solutions like AsyncStorage (React Native) or Keychain (iOS). Never store in localStorage.",
      },
    ],
  },
  {
    topic: "React Performance Optimization",
    chat: [
      {
        from: "user",
        message: "My React app feels sluggish with large lists",
      },
      {
        from: "assistant",
        message:
          "Implement windowing/virtualization with libraries like react-window. Also memoize components with React.memo, use useCallback for handlers, and consider useMemo for expensive calculations.",
      },
    ],
  },
  {
    topic: "Git Branching Strategy",
    chat: [
      {
        from: "user",
        message: "What's a good git workflow for a small dev team?",
      },
      {
        from: "assistant",
        message:
          "Consider Git Flow or a simplified version: main for production, develop for staging, and feature branches. Small teams might prefer GitHub Flow with just main and feature branches plus PRs.",
      },
    ],
  },
  {
    topic: "Dockerizing a Node Application",
    chat: [
      {
        from: "user",
        message: "How do I reduce my Docker image size for a Node app?",
      },
      {
        from: "assistant",
        message:
          "Use multi-stage builds, alpine-based images, and .dockerignore to exclude node_modules and other unnecessary files. Also leverage layer caching by properly ordering your Dockerfile commands.",
      },
    ],
  },
  {
    topic: "Responsive Design Breakpoints",
    chat: [
      {
        from: "user",
        message: "What are the standard breakpoints for mobile/tablet/desktop?",
      },
      {
        from: "assistant",
        message:
          "Common breakpoints are: mobile (<768px), tablet (768px-1024px), and desktop (>1024px). However, design content-first rather than device-specific. Use CSS media queries with min-width for mobile-first approach.",
      },
    ],
  },
  {
    topic: "MongoDB Schema Design",
    chat: [
      {
        from: "user",
        message: "Should I embed documents or use references in MongoDB?",
      },
      {
        from: "assistant",
        message:
          "Embed for data that's always accessed together and doesn't change independently. Use references when data is shared across documents or might grow large. Consider your read/write patterns carefully.",
      },
    ],
  },
  {
    topic: "Web Accessibility Best Practices",
    chat: [
      {
        from: "user",
        message: "How can I make my React app more accessible?",
      },
      {
        from: "assistant",
        message:
          "Use semantic HTML, manage focus properly, add ARIA attributes where needed, ensure sufficient color contrast, and test with screen readers. The react-aria library provides accessible UI primitives.",
      },
    ],
  },
  {
    topic: "GraphQL vs REST",
    chat: [
      {
        from: "user",
        message: "When should I choose GraphQL over REST for an API?",
      },
      {
        from: "assistant",
        message:
          "Choose GraphQL when you need flexible queries, multiple data sources, or to reduce over-fetching. REST is simpler for straightforward CRUD operations and benefits from HTTP caching.",
      },
    ],
  },
  {
    topic: "CSS-in-JS Performance",
    chat: [
      {
        from: "user",
        message: "Does styled-components impact app performance negatively?",
      },
      {
        from: "assistant",
        message:
          "There's some runtime cost, but it's generally negligible. For optimization, use the babel plugin, avoid dynamic styles in loops, and consider compiling to CSS files in production.",
      },
    ],
  },
  {
    topic: "WebSocket Implementation",
    chat: [
      {
        from: "user",
        message: "How do I implement real-time updates in my React app?",
      },
      {
        from: "assistant",
        message:
          "Use WebSocket API or libraries like Socket.IO. Create a context/provider to manage the connection state, and implement reconnect logic. For simpler cases, consider Server-Sent Events (SSE).",
      },
    ],
  },
];
