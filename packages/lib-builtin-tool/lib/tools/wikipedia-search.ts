import { WikipediaQueryRun } from '@langchain/community/tools/wikipedia_query_run';
import { z } from 'zod';

const wikipediaSearch = () => {
  const tool = new WikipediaQueryRun();

  return tool;
};

wikipediaSearch.argsSchema = z.object({
  input: z.string().describe('query to look up on wikipedia'),
});

export { wikipediaSearch };
