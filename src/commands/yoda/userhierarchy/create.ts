import {core, flags, SfdxCommand} from '@salesforce/command';
import {AnyJson} from '@salesforce/ts-types';

import shellJS = require('shelljs');
import chalk from 'chalk';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('sfdx-yoda-plugin', 'userhierarchy-create');

export default class createhierarchy extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [
  `$ sfdx yoda:userhierarchy:create --levels 2 --targetdevhubusername devhub@org.com
  Query for existing default user... User found
  username: test-q4cbpbrtcuqq@example.com
  id: 005O00000066QQQIA2
  alias: test-org2
  Creating manager... Manager created I have not
  `
  ];

  public static args = [{name: 'file'}];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'l', description: messages.getMessage('levelsFlagDescription')})
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Comment this out if your command does not require an org username
  protected static requiresLevels = true;

  // Comment this out if your command does not support a hub org username
  protected static supportsDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {

    //ShellJS example #1 - Works but with no spinner
    this.ux.startSpinner('Query for existing default user');

    let output = shellJS.exec('sfdx force:user:display --json', {silent:true}).stdout;

    let outputJSON = JSON.parse(output);

    if ( outputJSON.status && outputJSON.status != 0  ) {
      this.ux.stopSpinner(chalk.white.bgRedBright('User created I have not'));

      if ( outputJSON.action ) {
        this.ux.log(outputJSON.action);
      }

      throw new core.SfdxError(outputJSON.message);
    }
    this.ux.stopSpinner(chalk.white.bgGreen('User found'));

    this.ux.log('username: ' + outputJSON.result.username);
    this.ux.log('id: ' + outputJSON.result.id);
    this.ux.log('alias: ' + outputJSON.result.alias);

    const originalUser = outputJSON.result.id;

    this.ux.startSpinner('Creating manager');
    let createUser = shellJS.exec('SFDX_JSON_TO_STDOUT=true sfdx force:user:create --json', {silent:true}).stdout;

    let createuserOutputJSON = JSON.parse(createUser);

    if ( createuserOutputJSON.status && createuserOutputJSON.status != 0 ) {
      this.ux.stopSpinner(chalk.white.bgRedBright('Manager created I have not'));

      if ( createuserOutputJSON.action ) {
        this.ux.log(createuserOutputJSON.action);
      }

      throw new core.SfdxError(createuserOutputJSON.message);
    }

    this.ux.stopSpinner(chalk.white.bgGreen('Manager created'));

    this.ux.log('username: ' + createuserOutputJSON.result.fields.username);
    this.ux.log('id: ' + createuserOutputJSON.result.fields.id);

    const mgrLevel1 = createuserOutputJSON.result.fields.id;

    this.ux.startSpinner(`Associate manager (${mgrLevel1}) to default user (${originalUser})`);

    const testcommand = `sfdx force:data:record:update -s User -i ${originalUser}  -v "ManagerId=${mgrLevel1}" --json`;
    let associateMgr = shellJS.exec(testcommand, {silent:true}).stdout;

    let associateMgrOutputJSON = JSON.parse(associateMgr);

    if ( associateMgrOutputJSON.status && associateMgrOutputJSON.status != 0 ) {
      this.ux.stopSpinner(chalk.white.bgRedBright('Manager associated I have not'));

      if ( associateMgrOutputJSON.action ) {
        this.ux.log(associateMgrOutputJSON.action);
      }

      throw new core.SfdxError(associateMgrOutputJSON.message);
    }

    this.ux.stopSpinner(chalk.white.bgGreen('Manager associated'));

    return { orgId: this.org.getOrgId(), createuserOutputJSON };

  }

}