export async function GET(request: Request) {
  const host = request.headers.get("host") || "localhost:3000";
  const protocol = request.url.startsWith("https") ? "https" : "http";

  const robots = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
`;

  return new Response(robots, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
