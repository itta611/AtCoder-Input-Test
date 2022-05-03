const vscode = require('vscode');
const { Uri } = require('vscode');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const got = require('got');

let testcases = {};
let debugCnt = 0;

function activate(context) {
  const provider = new WebViewProvider(context.extensionUri);

  vscode.debug.onDidStartDebugSession(() => {
    let terminal = vscode.window.activeTerminal;
    if (terminal && Object.keys(testcases).length > 0) {
      terminal.show();
      console.log(testcases);
      terminal.sendText(
        testcases[Object.keys(testcases)[debugCnt]].trim() + '\n'
      );
    }
  });

  vscode.debug.onDidTerminateDebugSession(() => {
    if (Object.keys(testcases).length > 0) {
      if (debugCnt == Object.keys(testcases).length - 1) {
        debugCnt = 0;
      } else {
        debugCnt++;
        vscode.debug.startDebugging();
      }
    }
  });

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'atcoder-input-test.testcases',
      provider
    )
  );
}

function addTestcaseList(id, testcase) {
  testcases[id] = testcase;
}

class WebViewProvider {
  constructor(extensionUri) {
    this._extensionUri = extensionUri;
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.type) {
        case 'fetchTestcases':
          this._fetchTestcases(webviewView, message.value);
          break;
        case 'addTestcase':
          addTestcaseList(message.id, message.value);
          console.log('addTestcase');
          console.log({ ...testcases });
          break;
        case 'getTestcases':
          this._view.webview.postMessage({
            type: 'getTestcases',
            value: testcases,
          });
          break;
        case 'removeTestcase':
          delete testcases[message.id];
          break;
        case 'updateTestcase':
          testcases[message.id] = message.value;
          break;
      }
    });
  }

  async _fetchTestcases(webviewView, URL) {
    let response;
    try {
      response = await got(URL);
    } catch (error) {
      vscode.window.showErrorMessage(`Faild to fetch: ${error.message}`);
      return;
    }
    const htmlString = response.body;
    const testcasesDom = new JSDOM(htmlString);
    let testcases = [
      ...testcasesDom.window.document.querySelectorAll(
        '.part:nth-child(n+3) pre'
      ),
    ];
    testcases = testcases.map((testcase) => {
      return testcase.textContent;
    });
    testcases = testcases.filter((testcase, i) => {
      return i % 2 == 0;
    });

    this._view.webview.postMessage({ type: 'testcases', value: testcases });
  }

  _getHtmlForWebview(webview) {
    const toolkitUri = webview.asWebviewUri(
      Uri.joinPath(
        this._extensionUri,
        'node_modules',
        '@vscode',
        'webview-ui-toolkit',
        'dist',
        'toolkit.js' // A toolkit.min.js file is also available
      )
    );
    const stylesheetUri = webview.asWebviewUri(
      Uri.joinPath(this._extensionUri, 'media', 'main.css')
    );

    const scriptUri = webview.asWebviewUri(
      Uri.joinPath(this._extensionUri, 'media', 'main.js')
    );
    const nonce = getNonce();
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script type="module" src="${toolkitUri}" nonce="${nonce}"></script>
        <link rel="stylesheet" href="${stylesheetUri}">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self' 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}'; connect-src *;">
        <title>Testcases</title>
    </head>
    <body>
        <div id="root">
            <div id="testcases">
              <h4>Load from AtCoder URL</h4>
              <vscode-text-field placeholder="Enter a URL" id="url-field">Problem URL</vscode-text-field>
              <vscode-button id="url-load-button">Load</vscode-button>
              <vscode-divider></vscode-divider>
              <h4>Testcases</h4>
              <div id="testcases-list">
              </div>
              <vscode-text-area id="testcase-add-textarea"></vscode-text-area>
              <vscode-button id="testcase-add-btn">Add</vscode-button>
            </div>
        </div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
  }
}

function getNonce() {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

module.exports = {
  activate,
};
