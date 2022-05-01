const vscode = require('vscode');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const got = require('got');

async function fetchTestcase(URL) {
  let response;
  try {
    response = await got(URL);
  } catch (error) {
    vscode.window.showErrorMessage(`Faild to fetch: ${error.message}`);
    return;
  }
  const htmlString = response.body;
  const problemsDom = new JSDOM(htmlString);
  let problems = [
    ...problemsDom.window.document.querySelectorAll(
      '.part:nth-child(n+3):nth-child(odd) .pre'
    ),
  ];
  problems.map((problem) => {
    return problem.innerHTML;
  });
  return problems;
}

function activate(context) {
  const provider = new WebViewProvider(context.extensionUri);

  console.log('eh');
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'atcoder-assistant.testcases',
      provider
    )
  );
}

class WebViewProvider {
  constructor(extensionUri) {
    this._extensionUri = extensionUri;
  }

  resolveWebviewView(webviewView, context, _token) {
    this._view = webviewView;
    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };
    webviewView.webview.html = this._getHtmlForWebview();
  }

  _getHtmlForWebview() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Testcases</title>
    </head>
    <body>
        <div id="root">
            <div id="testcases">
                <div id="testcases-content"></div>
            </div>
        </div>
    </body>
    </html>`;
  }
}
module.exports = {
  activate,
};
