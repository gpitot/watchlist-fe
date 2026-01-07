import { useState, useRef } from "react";
import {
  Button,
  Dialog,
  DialogTrigger,
  ListBox,
  ListBoxItem,
  Popover,
} from "react-aria-components";

export interface Option {
  label: string;
  value: string;
}

export const MultiSelect: React.FC<{
  options: Option[];
  selected: Option[];
  setSelected: (selected: Option[]) => void;
  label: string;
}> = ({ options, selected, setSelected, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedValues = new Set(selected.map((s) => s.value));

  const handleSelectionChange = (keys: Set<string> | "all") => {
    if (keys === "all") {
      setSelected(options);
    } else {
      const newSelected = options.filter((opt) => keys.has(opt.value));
      setSelected(newSelected);
    }
  };

  const removeItem = (value: string) => {
    setSelected(selected.filter((s) => s.value !== value));
  };

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button
        ref={triggerRef}
        aria-label={label}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all cursor-pointer hover:bg-white/10"
      >
        <div className="flex-1 flex flex-wrap gap-1.5 min-h-[1.5rem]">
          {selected.length === 0 ? (
            <span className="text-white/40 text-sm">
              Select streaming services...
            </span>
          ) : (
            selected.map((item) => (
              <span
                key={item.value}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-md border border-purple-500/30"
              >
                {item.label}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.value);
                  }}
                  className="hover:text-white transition-colors"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))
          )}
        </div>
        <svg
          className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      <Popover
        triggerRef={triggerRef}
        placement="bottom start"
        className="w-[--trigger-width] mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden entering:animate-in entering:fade-in entering:zoom-in-95 exiting:animate-out exiting:fade-out exiting:zoom-out-95"
      >
        <Dialog className="outline-none">
          <ListBox
            aria-label={label}
            selectionMode="multiple"
            selectedKeys={selectedValues}
            onSelectionChange={(keys) =>
              handleSelectionChange(keys as Set<string>)
            }
            className="max-h-60 overflow-y-auto p-1 outline-none"
          >
            {options.map((option) => (
              <ListBoxItem
                key={option.value}
                id={option.value}
                textValue={option.label}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 rounded-lg cursor-pointer outline-none focus:bg-white/10 hover:bg-white/10 selected:bg-purple-500/20 selected:text-purple-300 transition-colors"
              >
                {({ isSelected }) => (
                  <>
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? "bg-purple-500 border-purple-500"
                          : "border-white/30"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </>
                )}
              </ListBoxItem>
            ))}
          </ListBox>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};
