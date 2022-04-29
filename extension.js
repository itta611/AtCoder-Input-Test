const vscode = require('vscode');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const got = require('got');

function atcoderProblemTreeProvider(contestId) {
  return {
    getTreeItem: (element) => {
      return element;
    },
    getChildren: async () => {
      let response;
      try {
        response = await got(`https://atcoder.jp/contests/${contestId}/tasks`);
      } catch (error) {
        vscode.window.showErrorMessage(`Faild to fetch: ${error.message}`);
        return [];
      }
      const htmlString = response.body;
      const problemsDom = new JSDOM(htmlString);
      let problems = [
        ...problemsDom.window.document.querySelectorAll(
          'table td:not([class]) > a'
        ),
      ];
      return problems.map((problem) => {
        return new vscode.TreeItem(problem.textContent);
      });
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
