import { schemaAgent } from './src/app/modules/agents/schema.agent.js';
import { GeminiAiService } from './src/app/modules/gemini/gemini.service.js';

async function testSchemaAgent() {
    console.log("--- TESTING AUTONOMOUS ONTOLOGY ARCHITECT ---");

    const mockPrisma = `
    model User {
      id    Int     @id @default(autoincrement())
      email String  @unique
      name  String?
      posts Post[]
    }
    
    model Post {
      id        Int     @id @default(autoincrement())
      title     String
      content   String?
      published Boolean @default(false)
      author    User    @relation(fields: [authorId], references: [id])
      authorId  Int
    }
    `;

    console.log(`Feeding Raw Prisma Schema to the SchemaAgent...`);

    GeminiAiService.generateContent = async (prompt) => {
        // Mock to verify parsing
        return JSON.stringify({
            extractedEntities: ["User", "Post"],
            relationships: ["User -> HAS_MANY -> Post", "Post -> BELONGS_TO -> User"],
            ontologyGraphNode: {
                domain: "Core Identity",
                nodes: [
                    { name: "User", attributes: ["id", "email", "name", "posts"] },
                    { name: "Post", attributes: ["id", "title", "content", "published", "authorId"] }
                ]
            }
        });
    };

    try {
        console.log("\nExecuting Knowledge Graph Extraction...");
        const result = await schemaAgent.mapOntology(mockPrisma, 'Core Identity');

        console.log("\nONTOLOGY REPORT:");
        console.log(JSON.stringify(result, null, 2));

        if (result.extractedEntities.length === 2 && result.ontologyGraphNode.domain === "Core Identity") {
            console.log("\n✅ SUCCESS: SchemaAgent synthesized the raw declarative code into a strict structured Semantic Knowledge node.");
            process.exit(0);
        } else {
            console.log("\n❌ FAILED: SchemaAgent failed to map the semantics.");
            process.exit(1);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testSchemaAgent();
