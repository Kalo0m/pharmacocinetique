// src/server/router/_app.ts
import { router } from "../trpc";

import { questionsRouter } from "./example";

export const appRouter = router({
  questions: questionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
