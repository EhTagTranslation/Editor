import './commands/auto-tagger/index.js';
import './commands/create-release/index.js';
import './commands/parse.js';
import './commands/tag/index.js';
import './commands/github-actions/index.js';
import { program } from 'commander';

async function main(): Promise<void> {
    console.profile();
    await program.parseAsync();
    console.profileEnd();
}

void main();
