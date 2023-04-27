export function isEnglish(str) {
    return /^[A-Za-z]+$/.test(str);
}

export function debounce(fn: Function, wait: number) {
    var timeout: any = null;
    return function () {
        if (timeout !== null) clearTimeout(timeout);
        timeout = setTimeout(fn, wait);
    };
}

export function extractFunctions(text: string) {
    const regex = /function\s*\w*\s*\([^)]*\)\s*{[^}]*}/g;
    const matches = text.match(regex);
    return matches || [];
}

// 去除 Python 注释
export function removePythonComments(code) {
    return code.replace(/#.*$/gm, '');
}

// 去除 JavaScript 注释
export function removeJavascriptComments(code) {
    return code.replace(/(\/\*[\s\S]*?\*\/|\/\/.*)/gm, '');
}

export const jsToPythonFunctionWithComments = (jsCode: string) => {
    const re = /(function\s+)(\w+)?\s*\((.*?)\)\s*\{([\s\S]*)\}/g;
    const pythonCode = jsCode.replace(re, 'def $2($3):\n$4');
    return pythonCode;
};

export const pythonToJsFunction = (pythonCode: string) => {
    const re = /(def\s+)(\w+)\s*\((.*?)\):\s*([\s\S]*)/g;
    const jsCode = pythonCode.replace(re, 'function $2($3) {\n$4}');
    return jsCode;
};

export function findPythonFunctionNames(pythonCode: string) {
    const functionRegex = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*:\s*/g;
    const functions = pythonCode.match(functionRegex) || [];
    return functions.map((functionString: any) => {
        return functionString.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)/)[1];
    });
}

export function cns(classes: Array<string | Object>): string {
    return classes.join(' ')
}


