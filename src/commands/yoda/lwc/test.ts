import {core, flags, SfdxCommand} from '@salesforce/command';
import {AnyJson} from '@salesforce/ts-types';

import shellJS = require('shelljs');
import chalk from 'chalk';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('sfdx-yoda-plugin', 'test-jest');

export default class createhierarchy extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [
  `$ sfdx yoda:lwc:jesttest --componentname test --targetdevhubusername devhub@org.com

  `
  ];

  public static args = [{name: 'file'}];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'l', description: messages.getMessage('componentNameDescription')})
  };

  // Comment this out if your command does nocd t require an org username
  protected static requiresUsername = true;

  // Comment this out if your command does not require an org username
  protected static requiresLevels = true;

  // Comment this out if your command does not support a hub org username
  protected static supportsDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {

    //ShellJS example #1 - Works but with no spinner
    this.ux.startSpinner('Checking node version');

    let output = shellJS.exec('node --version', {silent:true}).stdout;

    if ( output == '' || ( parseFloat(output.substr(1, output.length) ) < parseFloat('8.11.2') ) ) {
        this.ux.stopSpinner(chalk.white.bgRedBright('Node version check failed'));
        this.ux.log('Expected a node version > 8.11.2');
        this.ux.log('Please upgrade to latest version by running npm install');
        throw new core.SfdxError('Error sfdx yoda:lwc:test');
    }

    this.ux.stopSpinner(chalk.white.bgGreen('Node version ok'));

    return { orgId: this.org.getOrgId(), output };

  }

}