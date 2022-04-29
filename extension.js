const vscode = require('vscode');

function atcoderProblemTreeProvider() {
  return {
    getTreeItem: (element) => {
      return element;
    },
    getChildren: () => {
      return [new vscode.TreeItem('Hello')];
    },
  };
}

function activate(context) {
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
            // create tree
            vscode.window.registerTreeDataProvider(
              'atcoder-problems',
              atcoderProblemTreeProvider(contestId)
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
  context.subscriptions.push(startContest);
  context.subscriptions.push(quitContest);
}

module.exports = {
  activate,
};
