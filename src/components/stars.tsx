import classNames from "classnames";

export const Stars: React.FC<{
  handleClick?: (rating: number) => void;
  rating: number;
}> = ({ rating, handleClick }) => {
  return (
    <div>
      {Array(5)
        .fill(0)
        .map((_, i) => {
          const isFilled = i < rating;
          return (
            <button
              key={i}
              onClick={() => handleClick?.(i)}
              className={classNames(
                {
                  "text-yellow-500": isFilled,
                  "text-gray-500": !isFilled,
                },
                "cursor-pointer text-2xl hover:text-yellow-500"
              )}
            >
              {isFilled ? "★" : "☆"}
            </button>
          );
        })}
    </div>
  );
};
