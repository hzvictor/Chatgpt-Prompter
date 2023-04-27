import model from '../../../public/assets/json/cl100k_base.json';

import { init, Tiktoken } from './lite/init';

export default async (params: string) => {
  await init();
  const encoding = new Tiktoken(
    model.bpe_ranks,
    model.special_tokens,
    model.pat_str,
  );
  const tokens = encoding.encode(params);
  encoding.free();
  return tokens;
};
