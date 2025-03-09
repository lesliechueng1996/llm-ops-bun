import { DuckDuckGoSearch } from '@langchain/community/tools/duckduckgo_search';
import { z } from 'zod';

const duckduckgoSearch = () => {
  return new DuckDuckGoSearch();
};

duckduckgoSearch.argsSchema = z.object({
  input: z.string().describe('需要搜索的查询语句'),
});

export { duckduckgoSearch };
