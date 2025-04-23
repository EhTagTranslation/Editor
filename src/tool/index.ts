#!/usr/bin/env node

import './commands/create-release/index.js';
import './commands/parse.js';
import './commands/gallery.js';
import './commands/tag/index.js';
import './commands/github-actions/index.js';
import { program } from '@commander-js/extra-typings';

async function main(): Promise<void> {
    console.profile();
    await program.parseAsync();
    console.profileEnd();
}

void main();
