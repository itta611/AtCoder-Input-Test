// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "atcoder-assistant" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  const helloWorld = vscode.commands.registerCommand(
    'atcoder-assistant.helloWorld',
    function () {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      vscode.window.showInformationMessage('You got new AC! 🎉🎉🎉');
    }
  );

  const startContest = vscode.commands.registerCommand(
    'atcoder-assistant.startContest',
    function () {
      vscode.window
        .showInputBox({
          placeHolder: 'Contest ID (e.g. abc123)',
          ignoreFocusOut: true,
          validateInput: (value) => {
            if (!value) {
              return 'Contest ID is required.';
            }
            return null;
          },
        })
        .then((contestId) => {
          if (contestId) {
            vscode.commands.executeCommand(
              'setContext',
              'atcoder-assistant.contest',
              contestId
            );
          }
        });
    }
  );

  const quitContest = vscode.commands.registerCommand(
    'atcoder-assistant.quitContest',
    function () {
      vscode.commands.executeCommand(
        'setContext',
        'atcoder-assistant.contest',
        null
      );
    }
  );

  context.subscriptions.push(helloWorld);
  context.subscriptions.push(startContest);
  context.subscriptions.push(quitContest);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
