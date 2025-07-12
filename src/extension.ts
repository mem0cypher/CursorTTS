import * as vscode from 'vscode';
// @ts-ignore
import * as say from 'say';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('cursor-speech.speakText', async () => {
		const editor = vscode.window.activeTextEditor;
		let text = '';
		if (editor) {
			const selection = editor.selection;
			text = editor.document.getText(selection);
		} else {
			await vscode.commands.executeCommand('editor.action.clipboardCopyAction');
			await new Promise(resolve => setTimeout(resolve, 500)); // Wait 0.5s for clipboard to update
			text = await vscode.env.clipboard.readText();
		}
		if (text) {
			const config = vscode.workspace.getConfiguration('cursor-speech');
			const speed = config.get<number>('speed') || undefined;
			await new Promise<void>((resolve, reject) => {
				say.speak(text, undefined, speed, (err: unknown) => {
					if (err) {
						let errorMsg: string;
						if (typeof err === 'string') {
							errorMsg = err;
						} else if (err instanceof Error) {
							errorMsg = err.message;
						} else {
							errorMsg = 'Unknown error';
						}
						vscode.window.showErrorMessage(`Error speaking: ${errorMsg}`);
						reject(err);
					} else {
						resolve();
					}
				});
			});
		} else {
			vscode.window.showInformationMessage('No text selected to speak.');
		}
	});

	let stopDisposable = vscode.commands.registerCommand('cursor-speech.stopSpeaking', () => {
		say.stop();
	});

	context.subscriptions.push(disposable, stopDisposable);
}

export function deactivate() {
	say.stop();
} 