"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
let timers = {};
function nowSeconds() {
    return (Date.now() / 1000) | 0;
}
function closeTab(tab) {
    const closeDirty = vscode.workspace
        .getConfiguration()
        .get("autoclose.closeDirtyEditor");
    if (tab.isDirty && !closeDirty) {
        return;
    }
    vscode.window.tabGroups.close(tab).then(success => {
        if (success) {
            console.log(`successfully closed tab ${tab.label}`);
        }
        else {
            console.error(`issue closing tab ${tab.label}`);
        }
    });
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('context.extensionUri: ' + context.extensionUri);
    for (const tab of vscode.window.tabGroups.all.map(g => g.tabs).flat()) {
        // only close text input tabs
        if (!(tab.input instanceof vscode_1.TabInputText)) {
            continue;
        }
        let key = tab.input.uri.toString();
        console.log(`open Tab: ${key}`);
        if (key && context.workspaceState.keys().includes(key)) {
            let lastModified = context.workspaceState.get(key);
            let remainingSec = nowSeconds() - lastModified;
            console.log(`\t remainingSec: ${remainingSec}`);
            if (remainingSec <= 0) {
                closeTab(tab);
            }
            else {
                // set timer to remaining seconds
                timers[key] = setTimeout(closeTab, remainingSec * 1000, tab);
            }
        }
    }
    context.subscriptions.push(vscode.window.tabGroups.onDidChangeTabs((tabs) => __awaiter(this, void 0, void 0, function* () {
        for (const tab of tabs.changed.filter(tab => tab.input instanceof vscode_1.TabInputText)) {
            resetTimer(context, tab);
        }
    })));
}
exports.activate = activate;
function resetTimer(context, tab) {
    let key = tab.input.uri.toString();
    if (key) {
        // set state to last touched
        context.workspaceState.update(key, nowSeconds()).then(() => console.log('workspaceState updated'), () => console.error('error updating workspaceState'));
        // if there is still a timer runing, clear it
        if (key in timers) {
            console.log(`clearing timer for ${key}`);
            clearTimeout(timers[key]);
        }
        // set new timer to the configured number of seconds from now
        const configTimeout = vscode.workspace
            .getConfiguration()
            .get("autoclose.ageInSeconds");
        timers[key] = setTimeout(closeTab, configTimeout * 1000, tab);
    }
}
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map