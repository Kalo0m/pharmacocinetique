import * as fs from "fs";
import { parse } from 'csv-parse';
import { PrismaClient, Question } from "@prisma/client";
const prisma =
  new PrismaClient({
    log: ["query", "error", "warn"]
  });

export const parseCSVFile = async () => {
  const category = process.argv.slice(2)[0]
  if (!category) {
    throw Error('No category provided');
  }

  if (process.argv.slice(2)[1] == '--truncate') {
    await prisma.question.deleteMany({ where: { category: category } });
  }

  const fileContent = fs.readFileSync(`./src/utils/${category}.csv`, { encoding: 'utf-8' });
  parse(fileContent, {
    delimiter: ',',
  }, async (error, result: any[]) => {
    console.log(result)
    if (error) {
      console.error(error);
    }

    const transposedArray = result[0].map((col: any, c: any) => result.map((row, r) => result[r][c]));
    console.log(transposedArray);
    if (!transposedArray[0]) throw Error('no header')

    const promises: any[] = transposedArray.map(async (row: any) => {
      const [q, answer, ...otherAnswers] = row;
      if (!q) return
      const question = await prisma.question.create({
        data: {
          molecule: '',
          question: q ?? '',
          category,
          answers: {
            create: otherAnswers.filter((ans: string) => ans !== '').map((a: any) => {
              return {
                answer: a ?? '',
                type: '',
              }
            })
          }
        }
      })
      await prisma.answer.create({
        data: {
          answer: answer ?? '',
          type: '',
          question: {
            connect: {
              id: question.id
            }
          },
        }
      })
    })

    await Promise.all(promises)
  })
}
parseCSVFile()


