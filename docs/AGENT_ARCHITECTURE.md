# Agent Architecture: Foreman + Crew Pattern

The Inso.Code system utilizes a **Construction Management Pattern** for orchestrating complex AI interactions across cloud providers and deep linguistic systems. This paradigm replaces monolithic single-domain agents with hierarchical routing.

## Overview of the Foreman + Crew Pattern

Instead of having a single "AWS Agent," the platform deploys a strict hierarchy:
1. **Foreman (`isForeman: true`)**: The routing brain. Its only job is to understand the prompt, analyze the required cloud services, and dispatch the workload.
2. **Crew Specialists**: 105 hyper-focused cloud engineers, isolated by provider, possessing deep knowledge of one or two specific services.

### Routing Flow Diagram

```mermaid
graph TD
    User([User Request]) --> Router[Capability Router]
    Router --> |AWS Task| ForemanAWS[AWS Foreman]
    Router --> |GCP Task| ForemanGCP[GCP Foreman]
    Router --> |Python Task| PythonSpec[Python Specialist]
    
    ForemanAWS --> |[ROUTE_TO: s3-expert]| S3[S3 Crew Specialist]
    ForemanAWS --> |[ROUTE_TO: eks-expert]| EKS[EKS Crew Specialist]
    
    ForemanGCP --> |[ROUTE_TO: spanner-expert]| Spanner[Spanner Crew Specialist]
```

## Foreman Roster & Crew (111 Agents)

- **AWS Foreman** (`amazonaws-expert`): Oversees 20 Crew Specialists.
- **GCP Foreman** (`gcp-expert`): Oversees 20 Crew Specialists.
- **Azure Foreman** (`azure-expert`): Oversees 20 Crew Specialists.
- **Alibaba Foreman** (`alibaba-expert`): Oversees 15 Crew Specialists.
- **Oracle Foreman** (`oracle-expert`): Oversees 15 Crew Specialists.
- **IBM Foreman** (`ibm-expert`): Oversees 15 Crew Specialists.

*Note: For the exact breakdown of the 105 specialists across these 6 foremen, please refer to [CLOUD_AGENTS.md](CLOUD_AGENTS.md).*

## Language Specialists (15 Deep Experts)

In addition to cloud infrastructure, the platform includes 15 **Language Specialists**. Modeled after $300K/year senior software engineers, they are equipped with massive 4000-6000 word system prompts detailing APIs, compiler flags, and memory management.

The 15 core languages: **JavaScript, TypeScript, Python, Java, C++, C#, Go, C, PHP, Ruby, Swift, Kotlin, SQL, Bash, Rust**

*See [LANGUAGE_AGENTS.md](LANGUAGE_AGENTS.md) for detailed descriptions.*

## Technical Implementation

### The `AgentDefinitionLoader`

The `AgentDefinitionLoader` is responsible for parsing the `definitions/specialists/` directory on boot. It reads JSON or JS definitions and dynamically builds the in-memory graph. 

Key function: `resolveCrewForForeman(foremanId)` returns the exact sub-roster a foreman is allowed to speak to.

### File Naming and Directories

Specialist definitions live in clearly isolated subdirectories:
- `src/app/modules/definitions/specialists/{cloud}/` for cloud crews
- `src/app/modules/definitions/specialists/languages/` for language agents

### Routing Protocol: `[ROUTE_TO: crew-id]`

Foremen do not execute code. They output a strict semantic routing token:
`[ROUTE_TO: s3-expert]`

The orchestration engine intercepts this token, pauses the Foreman's context, spins up the `s3-expert` Crew member, pipes the user prompt to them, and returns the result to the user. 

### How to Add New Crew Members

1. Create a definition file in the target cloud's directory (e.g., `definitions/specialists/aws/sns-expert.json`).
2. Specify `"cloud": "aws"` and `"foreman": "amazonaws-expert"`.
3. Provide the deep system prompt.
4. Restart the engine. The `AgentDefinitionLoader` will automatically bind the new specialist to the AWS Foreman.

### How to Add New Foremen

1. Create a definition with `"isForeman": true`.
2. Provide a prompt instructing the foreman to output `[ROUTE_TO: ...]` strings.
3. The platform will dynamically inject the names of their bound Crew members into the Foreman's context on boot.
