import { Answer } from "@prisma/client";
import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import confetti from 'canvas-confetti';

function infiniteFirework() {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: any, max: any) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
  }, 250);
}

function runFirework() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 }
  };

  function fire(particleRatio: any, opts: any) {
    confetti(Object.assign({}, defaults, opts, {
      particleCount: Math.floor(count * particleRatio)
    }));
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });

}
function runHighSchool() {
  const end = Date.now() + (5 * 1000);

  // go Buckeyes!
  const colors = ['#bb0000', '#ffffff'];

  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}
function runStars() {
  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    shapes: ['star'],
    colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8']
  };

  function shoot() {
    const newLocal = 'star';
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: [newLocal]
    });

    confetti({
      ...defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ['circle']
    });
  }

  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
}
const Home: NextPage = () => {
  const { data: question, refetch, isLoading } = trpc.questions.getQuestion.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: categories } = trpc.questions.getCategories.useQuery();
  const mutation = trpc.questions.saveResponse.useMutation();
  const [strike, setStrike] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  // const { data, refetch: refetchSave } = trpc.questions.saveResponse.useQuery({ value:  }, {
  //   refetchOnWindowFocus: false,
  //   enabled: false // disable this query from automatically running
  // });
  const onButtonClick = (answer: Answer) => {


    if (!question) return;
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
    }, 5000);
    return undefined
  }

  if (!question) return <div className="text-white">loading...</div>
  return (
    <>
      <Head>
        <title>Pharmacocinetique</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="mx-auto  flex min-h-screen w-screen flex-col bg-red-50 items-between justify-between p-4">
        {strike > 0 && <p className=" fixed top-5 right-5 text-2xl font-semibold">🔥 Serie en cours : {strike}</p>}
        <div className="flex-grow flex flex-col items-center justify-center">

          <div style={{ animation: showSuccess || showFailure ? `bounce 1s ease` : '' }} className="h-36 mb-10 flex flex-col items-center">
            <p className="text-green-500 text-3xl font-bold">{showSuccess && 'Bravo'}</p>
            <p className="text-red-500 transition-all text-3xl scale-100 h-32 font-bold">{showFailure && 'IMT > Veto'}</p>
            {(showSuccess || showFailure) && <div className="text-lg text-gray-700 h-32 font-semibold text-center">La bonne réponse est <p className="mt-3 text-red-600 font-bold">{question.question?.answer?.answer}</p></div>}
          </div>
          <h1 className="text-5xl font-extrabold leading-normal text-gray-900 md:text-[5rem]">
            <p className="text-center">{question?.question.molecule}</p>
          </h1>
          <h1 className="text-3xl mb-10 font-semibold leading-normal text-gray-900 md:text-[3rem]">
            <p className="text-center">{question?.question.question}</p>
          </h1>
          <div className="lg:flex-row flex flex-col gap-4">
            {question?.answers.map((answer) => (
              <button disabled={showSuccess || showFailure} onClick={() => onButtonClick(answer)} key={answer.id} className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-400 px-4 py-2 text-base font-medium text-white shadow-sm transition-all hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">
                {answer.answer}
              </button>
            ))}
          </div>
        </div>



      </main>
    </>
  );
};

export default Home;

