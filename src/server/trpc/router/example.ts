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


export const questionsRouter = router({
  // hello: publicProcedure
  //   .input(z.object({ text: z.string().nullish() }).nullish())
  //   .query(({ input }) => {
  //     return {
  //       greeting: `Hello ${input?.text ?? "world"}`,
  //     };
  //   }),
  getQuestion: publicProcedure.query(async ({ ctx }): Promise<QuestionResponse> => {
    console.log('get new Question')
    const productsCount = await ctx.prisma.question.count();
    const skip = Math.floor(Math.random() * productsCount);
    const question = await ctx.prisma.question.findFirst({
      skip,
      include: {
        answer: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
    if (!question) throw new Error('No question found');
    if (!question.answer) throw new Error('No question\'s answer found');
    const skip2 = Math.floor(Math.random() * productsCount);

    let answers = await ctx.prisma.answer.findMany({
      take: 2,
      skip: skip2,
      where: {
        type: {
          equals: question.answer.type
        },
        id: {
          not: question.answer.id
        }
      }
    }) ?? []
    answers = [...answers, question.answer]

    shuffleArray(answers)

    return {
      question,
      answers
    }

  }),
});
function shuffleArray(array: unknown[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
