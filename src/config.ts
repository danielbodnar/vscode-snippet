import * as vscode from "vscode";
import { Disposable } from "vscode";

export function getConfig(param: string) {
  return vscode.workspace.getConfiguration("snippet")[param];
}

class LanguageItem implements vscode.QuickPickItem {
  public label: string;

  constructor(label: string) {
    this.label = label;
  }
}

export async function pickLanguage() {
  const languages = await vscode.languages.getLanguages();
  const disposables: Disposable[] = [];

  try {
    return await new Promise<string | undefined>((resolve) => {
      const input = vscode.window.createQuickPick<LanguageItem>();
      input.placeholder = "Select or enter programming language";
      const default_items = [];
      languages.forEach(language => {
        default_items.push(new LanguageItem(language));
      });
      input.items = default_items;

      disposables.push(
        input.onDidChangeValue(v => {
          input.items = [new LanguageItem(v)].concat(default_items);
        }),
        input.onDidAccept(() => {
          resolve(input.value);
        }),
        input.onDidChangeSelection((items: LanguageItem[]) => {
          const item = items[0];
          resolve(item.label);
          input.hide();
        }),
        input.onDidHide(() => {
          resolve(undefined);
          input.dispose();
        })
      );
      input.show();
    });
  } finally {
    disposables.forEach(d => d.dispose());
  }
}

async function getDefaultLanguage() {
  const defaultLanguage: string = getConfig("defaultLanguage");
  if (defaultLanguage && defaultLanguage.trim()) {
    return defaultLanguage;
  }
  return await pickLanguage();
}

export async function getLanguage(): Promise<string> {
  if (vscode.window.visibleTextEditors.length === 0) {
    return getDefaultLanguage();
  }
  const editor = vscode.window.activeTextEditor;
  return editor.document.languageId;
}
