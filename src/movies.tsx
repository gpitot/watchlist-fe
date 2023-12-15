import classNames from "classnames";
import { useQuery } from "react-query";

import {
  Column,
  Table,
  useReactTable,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

export type MovieDetailsResponse = {
  id: string;
  title: string;
  created_at: string;
  description: string;
  release_date?: string | null;
  production?: string | null;
  movies_genres: {
    genre: string;
  }[];
  movie_credits: {
    name: string;
    role: string;
  }[];
  movie_providers: {
    provider_name: string;
    provider_type: "free" | "rent" | "buy";
  }[];
};

const useMovies = async (): Promise<{ movies: MovieDetailsResponse[] }> => {
  const res = await fetch(
    "https://watchlist-bn4a.onrender.com/api/v1/watchlist"
  );

  return await res.json();
};

// A debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
function Filter({
  column,
}: {
  column: Column<MovieDetailsResponse, unknown>;
  table: Table<MovieDetailsResponse>;
}) {
  const columnFilterValue = column.getFilterValue();
  return (
    <DebouncedInput
      type="text"
      value={(columnFilterValue ?? "") as string}
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
      className="w-36 border shadow rounded"
      list={column.id + "list"}
    />
  );
}
const columnHelper = createColumnHelper<MovieDetailsResponse>();

const TableUI: React.FC<{ data: MovieDetailsResponse[] }> = ({ data }) => {
  const columns = [
    columnHelper.accessor("title", {
      header: "Title",
      enableSorting: false,
    }),
    columnHelper.accessor("description", {
      header: "Description",
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor("release_date", {
      header: "Release Date",
      enableColumnFilter: false,
      cell: (date) => date.getValue()?.slice(0, 10),
      sortDescFirst: true,
      enableSorting: true,
    }),
    columnHelper.accessor("movies_genres", {
      header: "Genres",
      enableColumnFilter: false,
      enableSorting: false,
      cell: (genres) =>
        genres
          .getValue()
          .map((g) => g.genre)
          .join(", "),
    }),
    columnHelper.accessor("production", {
      header: "Production",
      enableSorting: false,
    }),
    columnHelper.accessor("movie_providers", {
      header: "Providers",
      enableColumnFilter: false,
      enableSorting: false,
      cell: (providers) =>
        providers
          .getValue()
          .filter((p) => p.provider_type === "free")
          .map((p) => p.provider_name)
          .join(", "),
    }),
    columnHelper.accessor("movie_credits", {
      header: "Cast",
      enableColumnFilter: false,
      enableSorting: false,
      cell: (credits) =>
        credits
          .getValue()
          .filter((c) => c.role === "cast")
          .map((cast) => cast.name)
          .join(", "),
    }),
    // columnHelper.accessor("movie_credits", {
    //   header: "Crew",
    //   enableColumnFilter: false,
    //   cell: (credits) =>
    //     credits
    //       .getValue()
    //       .filter((c) => c.role === "crew")
    //       .map((cast) => cast.name)
    //       .join(", "),
    // }),
  ];
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headers) => (
          <tr key={headers.id}>
            {headers.headers.map((header) => (
              <th
                key={header.id}
                {...{
                  className: classNames({
                    "cursor-pointer": header.column.getCanSort(),
                  }),
                  onClick: header.column.getToggleSortingHandler(),
                }}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
                {header.column.getCanFilter() ? (
                  <div>
                    <Filter column={header.column} table={table} />
                  </div>
                ) : null}
                {{
                  asc: " 🔼",
                  desc: " 🔽",
                }[header.column.getIsSorted() as string] ?? null}
              </th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody>
        {table.getRowModel().rows.map((row) => {
          const hasFreeProviders = row
            .getValue<MovieDetailsResponse["movie_providers"]>(
              "movie_providers"
            )
            .some((p) => p.provider_type === "free");

          return (
            <tr
              key={row.id}
              className={classNames({ "bg-green-300": hasFreeProviders })}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
export const Movies: React.FC = () => {
  const { isLoading, isError, data } = useQuery("movies", useMovies);

  if (isLoading) return <h1>Loading...</h1>;
  if (isError || !data) return <h1>Error</h1>;

  return <TableUI data={data.movies} />;
};
