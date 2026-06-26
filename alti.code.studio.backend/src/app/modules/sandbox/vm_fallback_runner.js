import fs from 'node:fs';
import vm from 'node:vm';

function main() {
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
  const logs = [];
  const errors = [];

  const sandbox = {
    console: {
      log: (...args) => logs.push(args.join(' ')),
      error: (...args) => errors.push(args.join(' ')),
      warn: (...args) => logs.push(args.join(' ')),
      info: (...args) => logs.push(args.join(' ')),
    },
    global: {},
  };
  sandbox.global = sandbox;

  try {
    vm.runInNewContext(code, sandbox, {
      timeout: 5000,
      displayErrors: true,
    });

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
  }
}

main();
