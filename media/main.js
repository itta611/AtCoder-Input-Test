const urlField = document.querySelector('#url-field');
const urlLoadButton = document.querySelector('#url-load-button');
const testcasesList = document.querySelector('#testcases-list');
const testcaseAddTextarea = document.querySelector('#testcase-add-textarea');
const testcaseAddBtn = document.querySelector('#testcase-add-btn');
const vscode = acquireVsCodeApi();

let testCaseCnt = 0;
vscode.postMessage({ type: 'getTestcases' });

urlLoadButton.addEventListener('click', async () => {
  const URL = urlField.value;
  vscode.postMessage({ type: 'fetchTestcases', value: URL });
});

testcaseAddBtn.addEventListener('click', () => {
  if (testcaseAddTextarea.value.trim() != '') {
    const testcase = testcaseAddTextarea.value;
    testcaseAddTextarea.value = '';
    addTestcaseList(testcase);
  }
});

function addTestcaseList(testcase) {
  addTestcaseListDom(testcase);
  vscode.postMessage({
    type: 'addTestcase',
    value: testcase,
    id: testCaseCnt,
  });
  testCaseCnt++;
}

function addTestcaseListDom(testcase, index) {
  const textarea = document.createElement('vscode-text-area');
  textarea.value = testcase;
  textarea.className = 'testcase';
  textarea.dataset.index = index ?? testCaseCnt;
  testcasesList.appendChild(textarea);
  textarea.value = textarea.value.trim() + '\n';
  textarea.addEventListener('change', () => {
    if (textarea.value.trim() == '') {
      testcasesList.removeChild(textarea);
      vscode.postMessage({
        type: 'removeTestcase',
        id: textarea.dataset.index,
      });
    } else {
      textarea.value = textarea.value.trim() + '\n';
      vscode.postMessage({
        type: 'updateTestcase',
        value: textarea.value,
        id: textarea.dataset.index,
      });
    }
  });
}

window.addEventListener('message', (event) => {
  const message = event.data;
  switch (message.type) {
    case 'testcases':
      for (const testcase of message.value) {
        addTestcaseList(testcase);
      }
      break;
    case 'getTestcases':
      testcases = message.value;
      Object.keys(testcases).forEach((key) => {
        addTestcaseListDom(testcases[key], key);
      });
      break;
  }
});
