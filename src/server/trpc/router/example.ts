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
    const productsCount = await ctx.prisma.question.count();
    const skip = Math.floor(Math.random() * productsCount);
    const question = await ctx.prisma.question.findFirst({
      skip,
      include: {
        answer: true,
      },
      where: {
        answer: {
          answer: {
            not: '',
          }
        }
      },
      orderBy: {
        id: 'desc',
      },
    });
    if (!question) throw new Error('No question found');
    if (!question.answer) throw new Error('No question\'s answer found');
    const answersCount = await ctx.prisma.answer.count({
      where: {
        type: {
          equals: question.answer.type

        },
        answer: {
          not: '',
        },
        id: {
          not: question.answer.id
        }
      }
    });

    const skip2 = Math.floor(Math.random() * answersCount);
    let answers = await ctx.prisma.answer.findMany({
      take: 2,
      skip: skip2,
      where: {
        type: {
          equals: question.answer.type
        },
        answer: {
          not: '',
        },
        id: {
          not: question.answer.id
        }
      }
    })
    answers = [...answers, question.answer]
    shuffleArray(answers)

    return {
      question,
      answers
    }

  }),
  getCategories: publicProcedure.query(async ({ ctx }): Promise<string[]> => {
    const categories = await ctx.prisma.question.findMany({
      select: {
        question: true
      },
      distinct: ['question']
    })
    return categories.map(c => c.question)
  }),
  saveResponse: publicProcedure.input(z.object({ value: z.boolean(), questionId: z.string() })).mutation(async ({ ctx: { prisma, req }, input: { value, questionId } }) => {
    return prisma.result.create({
      data: {
        ip: req['headers']['x-forwarded-for']?.[0] ?? req.connection.remoteAddress ?? '',
        result: value,
        question: {
          connect: {
            id: questionId
          }
        }
      }
    })
  })
});
function shuffleArray(array: unknown[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
