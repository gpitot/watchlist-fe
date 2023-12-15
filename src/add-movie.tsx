import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "react-query";

const useAddMovie = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (title: string): Promise<void> => {
      const res = await fetch(
        "https://watchlist-bn4a.onrender.com/api/v1/watchlist",
        {
          method: "POST",
          body: JSON.stringify({ title }),
          headers: {
            "Content-type": "application/json",
          },
        }
      );

      return await res.json();
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
        placeholder="Movie title"
        onChange={handleChange}
        value={title}
      />
      <input
        type="submit"
        value="Submit"
        className="border-2 py-2 px-4 cursor-pointer border-black"
        disabled={isLoading}
      />
    </form>
  );
};

export { AddMovie };
