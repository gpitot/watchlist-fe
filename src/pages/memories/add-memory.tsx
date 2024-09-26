import { useAddMemory } from "api/memories";
import { useState } from "react";

export const AddMemory: React.FC = () => {
  const { mutate } = useAddMemory();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(e.target.value);
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
  };

  const handleSubmit = () => {
    mutate({ memory: question, answer });
    setQuestion("");
    setAnswer("");
  };

  return (
    <div className="flex flex-col space-y-2 p-4 justify-center w-[400px]">
      <label>
        <span>Question</span>
        <input
          type="text"
          className="border-2 p-2 w-full border-black"
          onChange={handleQuestionChange}
          value={question}
        />
      </label>
      <label>
        <span>Answer</span>
        <input
          type="text"
          className="border-2 p-2 w-full border-black"
          onChange={handleAnswerChange}
          value={answer}
        />
      </label>

      <button
        onClick={handleSubmit}
        disabled={question.length === 0 || answer.length === 0}
        className="border-2 py-2 px-4 cursor-pointer border-black disabled:bg-gray-400 disabled:text-gray-200"
      >
        Submit
      </button>
    </div>
  );
};
