
import { Command } from 'commander';

const program = new Command();

program
    .version('1.0.0')
    .description('Minimal Commander Test')
    .action(() => {
        console.log('Commander Action Executed!');
    });

program
    .command('status')
    .action(() => {
        console.log('Status Command Executed!');
    });

console.log('Parsing args:', process.argv);
program.parse(process.argv);
