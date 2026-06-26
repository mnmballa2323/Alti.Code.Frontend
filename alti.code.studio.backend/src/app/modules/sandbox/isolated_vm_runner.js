import fs from 'node:fs';
import ivm from 'isolated-vm';

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error(
      JSON.stringify({
        success: false,
        exitCode: 1,
        logs: [],
        errors: ['No file path provided'],
      }),
    );
    process.exit(1);
  }

  const code = fs.readFileSync(filePath, 'utf8');

  // Create isolate with memory limit 128MB
  const isolate = new ivm.Isolate({ memoryLimit: 128 });
  const context = await isolate.createContext();
  const jail = context.global;

  // Bind global reference
  await jail.set('global', jail.derefInto());

  const logs = [];
  const errors = [];

  // Setup custom console logger
  await context.evalClosure(
    `
        global.console = {
            log: (...args) => {
                $0.apply(undefined, args.map(String));
            },
            error: (...args) => {
                $1.apply(undefined, args.map(String));
            },
            warn: (...args) => {
                $0.apply(undefined, args.map(String));
            },
            info: (...args) => {
                $0.apply(undefined, args.map(String));
            }
        };
    `,
    [
      new ivm.Reference((...args) => {
        logs.push(args.join(' '));
      }),
      new ivm.Reference((...args) => {
        errors.push(args.join(' '));
      }),
    ],
    { arguments: { reference: true } },
  );

  try {
    const script = await isolate.compileScript(code);
    await script.run(context, { timeout: 5000 });

    console.log(
      JSON.stringify({
        success: true,
        exitCode: 0,
        logs,
        errors,
      }),
    );
  } catch (err) {
    console.log(
      JSON.stringify({
        success: false,
        exitCode: 1,
        logs,
        errors: [...errors, err.message || String(err)],
      }),
    );
  } finally {
    isolate.dispose();
  }
}

main().catch(err => {
  console.log(
    JSON.stringify({
      success: false,
      exitCode: 1,
      logs: [],
      errors: [err.message || String(err)],
    }),
  );
});
