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
    if (error) {
      console.error(error);
    }

    const transposedArray = result.map((_: any, colIndex) => result.map(row => row[colIndex]));
    if (!transposedArray[0]) throw Error('no header')
    const [[_, __, ...header], ...data] = transposedArray;
    if (!data[2]) return
    const questions: any[] = data.map((d) => {
      const [group, mol, ...answers] = d;
      const questions = answers?.reduce((acc, current: any, index: number) => {
        return {
          ...acc,
          [header[index]]: current,
        }
      }, {})
      return {
        group,
        mol,
        answers: questions
      }
    })
    const promises: any = questions.flatMap((q) => {
      return Object.entries(q.answers).map(async ([key, value]: any) => {
        const question = await prisma.question.create({
          data: {
            molecule: q.group ? q.group + ' ' + q.mol : q.mol,
            question: key ?? '',
            category
          }
        })
        return prisma.answer.create({
          data: {
            answer: value ?? '',
            type: key ?? '',
            question: {
              connect: {
                id: question.id
              }
            }
          }
        })
      })
    });
    console.log(promises)
    await Promise.all(promises)
  })
}
parseCSVFile()


