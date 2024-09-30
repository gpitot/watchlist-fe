import { useGetMemory } from "api/memories";
import classNames from "classnames";
import { useState } from "react";
import { useParams } from "react-router-dom";

export const ViewMemory: React.FC = () => {
  const { memoryId } = useParams();

  const [revealAnswer, setRevealAnswer] = useState(false);

  if (!memoryId) {
    throw new Error("No memory ID provided");
  }

  const { data, error, isLoading } = useGetMemory(Number(memoryId));

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error</p>;
  }

  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm">Question</label>
        <h1 className="text-xl border-2 p-2 border-gray-600">{data?.memory}</h1>
      </div>
      <div>
        <label className="text-sm">Answer</label>
        <button
          onClick={() => setRevealAnswer(true)}
          className={classNames(
            `text-xl border-2 p-2 border-gray-600 block w-full text-left`,
            {
              "bg-slate-800 text-white": !revealAnswer,
            }
          )}
        >
          {revealAnswer ? data?.answer : "Click to reveal answer"}
        </button>
      </div>
    </div>
  );
};
