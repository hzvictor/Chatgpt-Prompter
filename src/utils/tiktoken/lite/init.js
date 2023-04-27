// @ts-expect-error
import * as imports from './tiktoken_bg';
import { history } from 'umi';
let isInitialized = false;
export async function init() {
  if (isInitialized) return imports;
  const domain = window.location;
  const response = await fetch(`${domain.origin}/assets/wasm/tiktoken_bg.wasm`);
  const buffer = await response.arrayBuffer();
  const result = await WebAssembly.instantiate(buffer, {
    './tiktoken_bg.js': imports,
  });
  const instance =
    'instance' in result && result.instance instanceof WebAssembly.Instance
      ? result.instance
      : result instanceof WebAssembly.Instance
      ? result
      : null;
  if (instance == null) throw new Error('Missing instance');
  imports.__wbg_set_wasm(instance.exports);
  isInitialized = true;
  return imports;
}
// @ts-expect-error
export * from './tiktoken_bg';
