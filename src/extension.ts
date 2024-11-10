import * as vscode from "vscode";

function formatBatFile(text: string): string {
  // 1. 去除开头和结尾的空白
  text = text.trim();
  // 2. 处理行尾的空格
  text = text.replace(/\s+$/gm, "");
  // 3. 将多个连续空格压缩为两个空格（但忽略引号中的空格）
  text = text.replace(/(".*?")/g, (match) => match.replace(/ {2,}/g, "  ")); // 先暂时保留引号中的空格
  text = text.replace(/ {2,}/g, "  "); // 然后处理引号外的空格

  // 4. 对每个命令进行格式化：
  // 4.1. 去除所有行的缩进
  text = text.replace(/^\s+/gm, ""); // 去除每一行的前导空格
  // 4.2. 处理多行命令（if, for, goto），后续行需要缩进
  text = text.replace(/^(if|for|goto)\s+/gm, "$1 "); // 首行命令缩进
  text = text.replace(/^(\s+)(if|for|goto)\s+/gm, "$1  $2 "); // 后续行缩进

  // 5. 格式化注释（保留注释的原格式）
  text = text.replace(/^rem/gm, "rem");

  // // 6. 将多个连续空行压缩为2个空行
  // text = text.replace(/(\r?\n){3,}/g, "\n\n");

  // 7. 结尾保留一个空行
  text = text + "\n";
  return text;
}

export function activate(context: vscode.ExtensionContext) {
  // 注册文档格式化器
  const disposable = vscode.languages.registerDocumentFormattingEditProvider(
    "batch",
    {
      provideDocumentFormattingEdits(
        document: vscode.TextDocument
      ): vscode.TextEdit[] {
        const edits: vscode.TextEdit[] = [];
        const text = document.getText();

        // 格式化文档文本
        const formattedText = formatBatFile(text);

        // 获取整个文档范围
        const fullTextRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(text.length)
        );

        // 使用格式化后的文本创建文本编辑
        edits.push(vscode.TextEdit.replace(fullTextRange, formattedText));

        return edits;
      },
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
