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
  const testcase = testcaseAddTextarea.value;
  testcaseAddTextarea.value = '';
  addTestcaseList(testcase);
});

function addTestcaseList(testcase) {
  addTestcaseListDom(testcase);
  testCaseCnt++;
  vscode.postMessage({
    type: 'addTestcase',
    value: testcase,
    index: testCaseCnt,
  });
}

function addTestcaseListDom(testcase, index) {
  const textarea = document.createElement('vscode-text-area');
  textarea.value = testcase;
  textarea.className = 'testcase';
  textarea.dataset.index = index ?? testCaseCnt;
  testcasesList.appendChild(textarea);
  textarea.value = textarea.value.trim() + '\n';
  textarea.addEventListener('input', () => {
    textarea.value = textarea.value.trim() + '\n';
    vscode.postMessage({
      type: 'updateTestcase',
      value: textarea.value,
      index: textarea.dataset.index,
    });
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
      for (const testcase of message.value) {
        addTestcaseListDom(testcase.value, testcase.index);
      }
      break;
  }
});
