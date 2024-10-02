import classNames from "classnames";

export const Stars: React.FC<{
  handleClick?: (rating: number) => void;
  rating: number;
  size?: "sm" | "md" | "lg";
}> = ({ rating, handleClick, size = "lg" }) => {
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
                {
                  "text-3xl": size === "lg",
                  "text-2xl": size === "md",
                  "text-xl": size === "sm",
                },
                "cursor-pointer hover:text-yellow-500"
              )}
            >
              {isFilled ? "★" : "☆"}
            </button>
          );
        })}
    </div>
  );
};
