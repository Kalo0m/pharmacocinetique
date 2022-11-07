import Question from "../components/Question"
import useSurvey from "../hooks/useSurvey"
import { useRouter } from 'next/router'

export default function Game() {
  const { query: { game } } = useRouter()
  const { onAnswer, question, showFailure, showSuccess, strike, isLoading, error } = useSurvey(game as string | undefined)
  if (error) return <div className="flex justify-center items-center h-screen">No question found 🚫</div>
  if (!question) return <p className="flex justify-center items-center h-screen">Chargement ⏳</p>
  return <>
    {strike > 0 && <p className="fixed top-5 right-5 text-2xl font-semibold">🔥 Serie en cours : {strike}</p>}
    <div className="flex-grow flex flex-col items-center justify-center">
      <div style={{ animation: showSuccess || showFailure ? `bounce 1s ease` : '' }} className=" h-52 mb-10 flex flex-col justify-end items-center">
        <p className="text-green-500 text-3xl font-bold">{showSuccess && 'Bravo'}</p>
        <p className="text-red-500 transition-all text-3xl scale-100 font-bold">{showFailure && 'IMT > Veto'}</p>
        {(showSuccess || showFailure) && <div className="text-lg text-gray-700 font-semibold text-center">La bonne réponse est <p className=" text-red-600 font-bold">{question.question?.answer?.answer}</p></div>}
      </div>
      <Question question={question} onAnswer={onAnswer} />
    </div>
  </>
}
