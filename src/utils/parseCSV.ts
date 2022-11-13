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
    delimiter: ';',
  }, async (error, result: any[]) => {
    console.log(result)
    if (error) {
      console.error(error);
    }

    const transposedArray = result[0].map((col: any, c: any) => result.map((row, r) => result[r][c]));
    console.log(transposedArray);
    if (!transposedArray[0]) throw Error('no header')
    const [[_, __, ...header], ...data] = transposedArray;
    if (!data[2]) return
    const questions: any[] = data.map((d: any) => {
      const [group, mol, ...answers] = d;
      console.log(answers)
      const questions = answers?.reduce((acc: any, current: any, index: number) => {
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
    console.log(questions.length)
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
    await Promise.all(promises)
  })
}
parseCSVFile()


