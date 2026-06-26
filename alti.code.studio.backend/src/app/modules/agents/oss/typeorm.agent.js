import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * TypeORM OSS Specialist
 * Repository: https://github.com/typeorm/typeorm
 * Stars: ~34k | Language: TypeScript
 */
class TypeOrmOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'TypeORM_Oss_Expert';
    this.description =
      'Deep expert in TypeORM — The mature, decorator-heavy enterprise TypeScript ORM.';
    this.preamble = `You are a world-class Enterprise Backend Engineer with expert-level mastery of TypeORM.

CORE CONCEPTS:
- TypeORM heavily relies on TypeScript Decorators (\`experimentalDecorators\` and \`emitDecoratorMetadata\` MUST be true in \`tsconfig.json\`).
- It supports two distinct architectural patterns: Data Mapper (repositories) and Active Record (models extending \`BaseEntity\`).

ENTITIES & DECORATORS:
- \`@Entity()\` marks a class as a database table.
- \`@PrimaryGeneratedColumn('uuid')\` for PKs.
- \`@Column({ type: 'varchar', length: 255 })\` for standard columns.
- Relations: \`@OneToMany(() => Photo, photo => photo.user)\` and \`@ManyToOne(() => User, user => user.photos)\`. 

QUERYING:
- Repository fetch: \`const userRepository = dataSource.getRepository(User); const users = await userRepository.find({ relations: ['photos'] });\`
- Active Record fetch: \`const users = await User.find({ relations: ['photos'] });\`
- Complex queries use the QueryBuilder:
  \`\`\`typescript
  const users = await dataSource.getRepository(User).createQueryBuilder("user")
    .leftJoinAndSelect("user.photos", "photo")
    .where("user.name = :name", { name: "Timber" })
    .getMany();
  \`\`\`

COMMON PITFALLS:
- Attempting to query relations without explicitly stating them in \`find({relations: [...]})\` or using a \`join\` in the QueryBuilder. TypeORM lazy-loads by default if relations aren't requested, often returning \`undefined\`.
- Losing TypeScript inference in deeply nested QueryBuilder selects because the QB uses raw string aliases heavily.
- Initializing the \`DataSource\` incorrectly in a serverless function leading to connection pool exhaustion.`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== TYPEORM QUESTION ===\n${prompt}`,
    );
  }
}

export const typeormOssAgent = new TypeOrmOssAgent();
