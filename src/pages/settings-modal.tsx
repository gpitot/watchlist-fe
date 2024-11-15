import classNames from "classnames";
import { PropsWithChildren } from "react";

export const SettingsModal: React.FC<
  PropsWithChildren<{
    isOpen: boolean;
    onModalClose: () => void;
  }>
> = ({ isOpen, onModalClose, children }) => {
  return (
    <div
      className={classNames({
        "fixed inset-0 w-full h-full m-0 z-10 backdrop-blur-sm": isOpen,
      })}
      onClick={onModalClose}
    >
      <dialog
        open={isOpen}
        className={`
          fixed 
          inset-0
          p-4 
          rounded-md 
          border-solid 
          border-black 
          border-2 
          h-full
          w-full
          `}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </dialog>
    </div>
  );
};
