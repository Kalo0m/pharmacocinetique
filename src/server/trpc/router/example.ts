import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { Answer, Question } from "@prisma/client";
import { CallTracker, notEqual } from "assert";

export type QuestionResponse = {
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
  getQuestion: publicProcedure.input(z
    .object({
      game: z.string()
    })).query(async ({ ctx, input: { game } }): Promise<QuestionResponse> => {
      const debut = new Date()
      const productsCount = await ctx.prisma.question.count({
        where: {
          answer: {
            answer: {
              not: '',
            }
          },
          category: {
            equals: game
          }
        },
      });
      const skip = Math.floor(Math.random() * productsCount);
      const question = await ctx.prisma.question.findFirst({
        skip,
        include: {
          answer: true,
          answers: true,
        },
        where: {
          answer: {
            answer: {
              not: '',
            }
          },
          category: {
            equals: game
          }
        },
        orderBy: {
          id: 'desc',
        },
      });
      if (!question) throw new Error('No question found');
      if (!question.answer) throw new Error('No question\'s answer found');
      let answers: Answer[] = question.answers
      console.log(question)
      if (question.answer.type !== '') {
        const answersCount = await ctx.prisma.answer.findMany({
          distinct: ['answer'],
          where: {
            type: {
              equals: question.answer.type
            },
            answer: {
              notIn: ['', question.answer.answer],
            },
            id: {
              not: question.answer.id
            }
          }
        });

        const skip2 = Math.floor(Math.random() * answersCount.length);
        answers = await ctx.prisma.answer.findMany({
          take: 2,
          skip: skip2,
          distinct: ['answer'],
          where: {
            type: {
              equals: question.answer.type

            },
            answer: {
              notIn: ['', question.answer.answer],
            },
            id: {
              not: question.answer.id
            }
          }
        })
      }
      answers = [...answers, question.answer]
      shuffleArray(answers)
      const fin = new Date()
      console.log('FIN FONCTION', (fin.getTime() - debut.getTime()) / 1000)
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
    let ipBis = req.headers['x-forwarded-for']
    if (typeof ipBis !== 'string') { ipBis = ipBis?.[0] ?? '' }

    return prisma.result.create({
      data: {
        ip: ipBis,
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
