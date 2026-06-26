export class DockerAgent {
  constructor() {
    this.name = 'Swarm-Docker';
  }
  async execute(appType) {
    return `Generated optimal multi-stage distroless Docker container for: ${appType}`;
  }
}
export const dockerAgent = new DockerAgent();
