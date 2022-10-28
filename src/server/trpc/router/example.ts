import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { Answer, Question } from "@prisma/client";
import { notEqual } from "assert";

type QuestionResponse = {
  question: Question & {
    answer: Answer | null;
  }
  answers: Answer[];
};


export const exampleRouter = router({
  // hello: publicProcedure
  //   .input(z.object({ text: z.string().nullish() }).nullish())
  //   .query(({ input }) => {
  //     return {
  //       greeting: `Hello ${input?.text ?? "world"}`,
  //     };
  //   }),
  getQuestion: publicProcedure.query(async ({ ctx }): Promise<QuestionResponse> => {
    const productsCount = await ctx.prisma.question.count();
    const skip = Math.floor(Math.random() * productsCount);
    const question = await ctx.prisma.question.findFirst({
      skip: skip,
      include: {
        answer: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
    if (!question) throw new Error('No question found');
    if (!question.answer) throw new Error('No question\'s answer found');

    const answers = await ctx.prisma.answer.findMany({
      take: 2,
      where: {
        type: {
          equals: question.answer.type
        },
        id: {
          not: question.answer.id
        }
      }

    }) ?? []

    return {
      question,
      answers: [...answers, question.answer]
    }

  }),
});
