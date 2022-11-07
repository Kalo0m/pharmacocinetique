import { Answer } from "@prisma/client";
import { useMemo, useState } from "react";
import { trpc } from "../utils/trpc";
import useFirework from "./useFirework";

export default function useSurvey(game?: string) {
  const [strike, setStrike] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const { infiniteFirework, runStars, runFirework, runHighSchool } = useMemo(useFirework, []);
  const { data: question, refetch, isLoading, ...others } = trpc.questions.getQuestion.useQuery({ game: game! }, { refetchOnWindowFocus: false, enabled: !!game });
  const mutation = trpc.questions.saveResponse.useMutation();

  const onAnswer = (answer: Answer) => {
    if (!question) return;
    if (showFailure || showSuccess) return;
    if (answer.id === question.question?.answer?.id) {
      setShowSuccess(true);
      if (strike >= 2 && strike < 4) infiniteFirework()
      else if (strike >= 4 && strike <= 6) runStars()
      else if (strike >= 7) {
        runHighSchool()
        runStars()
        infiniteFirework()
      }
      else runFirework()
      setStrike(strike + 1)
    }
    else {
      setShowFailure(true);
      setStrike(0)
    }
    mutation.mutate({ value: answer.id === question.question?.answer?.id, questionId: question.question?.id });

    setTimeout(() => {
      setShowFailure(false);
      setShowSuccess(false);
      refetch()
    }, 4000);

  }
  return { onAnswer, strike, showSuccess, showFailure, question, isLoading, ...others }
}
