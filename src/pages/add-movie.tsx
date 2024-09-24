import { supabase } from "api/database";
import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "react-query";

const useAddMovie = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (title: string): Promise<void> => {
      const { data, error } = await supabase.functions.invoke("add_movie", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      if (error) {
        throw error;
      }
      return data;
    },
    {
      onSuccess: async () => {
        queryClient.invalidateQueries("movies");
      },
    }
  );
};

const AddMovie: React.FC = () => {
  const { mutate, isLoading } = useAddMovie();

  const [title, setTitle] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // form event
    mutate(title);
    setTitle("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  return (
    <form className="flex p-4 space-x-4" onSubmit={handleSubmit}>
      <input
        type="text"
        className="border-2 p-2 w-[400px] border-black"
        placeholder="Add a movie or show to your watchlist"
        onChange={handleChange}
        value={title}
      />
      <input
        type="submit"
        value={`${isLoading ? "Submitting..." : "Submit"}`}
        className="border-2 py-2 px-4 cursor-pointer border-black disabled:bg-gray-400 disabled:text-gray-200"
        disabled={isLoading || title.length === 0}
      />
    </form>
  );
};

export { AddMovie };
