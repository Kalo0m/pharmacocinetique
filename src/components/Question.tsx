import { Answer } from "@prisma/client";
import { QuestionResponse } from "../server/trpc/router/example";

export default function Question({ question, onAnswer }: { question: QuestionResponse, onAnswer: (answer: Answer) => void }) {
  return <>
    <h1 className="text-4xl lg:text-5xl font-extrabold leading-normal text-gray-900 md:text-[5rem]">
      <p className="text-center">{question?.question.molecule}</p>
    </h1>
    <h1 className="text-2xl lg:text-3xl mb-10 font-semibold leading-normal text-gray-900 md:text-[3rem]">
      <p className="text-center">{question?.question.question}</p>
    </h1>
    <div className="lg:flex-row flex flex-col gap-4 px-4">
      {question?.answers.map((answer) => (
        <button disabled={false} onClick={() => onAnswer(answer)} key={answer.id} className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-400 px-4 py-2 text-base font-medium text-white shadow-sm transition-all hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto sm:text-sm">
          {answer.answer}
        </button>
      ))}
    </div>
  </>


}
