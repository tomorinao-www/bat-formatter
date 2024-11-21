import * as vscode from "vscode";

function formatBatFile(text: string): string {
  // 1. 去除开头和结尾的空白
  text = text.trim();
  // 2. 将多个连续空格压缩为2个空格（但保留引号中的空格）
  // 2.1.保留引号内容
  let remain: string[] = [];
  text = text.replace(
    /".*"/g,
    (m, i) => `${remain.push(m) ? "" : ""}__PLACEHOLDER__`
  );
  text = text.replace(/ {3,}/g, "  ");
  // 2.1.恢复引号内容
  let index = 0;
  text = text.replace(/(__PLACEHOLDER__)/g, (m, i) => remain[index++]);

  // 3. 将多个连续空行压缩为2个空行
  text = text.replace(/(\r\n){3,}/g, "\r\n\r\n");
  // 4. 保留 `for`、`if` 等控制结构中的块缩进
  function deal_mul_lines(
    text: string = "",
    indent_nums: number = 2,
    formattedLines: string[] = []
  ): string {
    const lines = text.split("\n");
    let indent_now = 0;
    lines.forEach((srcline) => {
      const line = srcline.trim();
      let indent_tmp = indent_now;
      if (/^\s*(for|if|else|do).*?\(\s*$/.test(line)) {
        // 如果是块起始，增加缩进，但本行不增加缩进
        indent_now += indent_nums;
      } else if (indent_nums > 1 && /^\s*\)\s*$/.test(line)) {
        // 如果是块结束，减少缩进，并且本行也减少缩进
        indent_now -= indent_nums;
        indent_tmp = indent_now;
      }
      formattedLines.push(" ".repeat(indent_tmp) + line);
    });
    return formattedLines.join("\n");
  }
  text = deal_mul_lines(text);

  // 5. 结尾保留一个空行
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
