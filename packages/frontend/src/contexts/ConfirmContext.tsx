import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { useTranslation } from "react-i18next";

type ConfirmOptions = {
  title: string;
  message: string;
};

type ConfirmContextType = {
  confirm(options: ConfirmOptions): Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  function confirm(options: ConfirmOptions) {
    setOptions(options);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }

  function handleClose(result: boolean) {
    resolverRef.current?.(result);

    resolverRef.current = null;
    setOptions(null);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <ConfirmDialog
        open={Boolean(options)}
        title={options?.title ?? ""}
        message={options?.message ?? ""}
        onConfirm={() => handleClose(true)}
        onCancel={() => handleClose(false)}
        confirmText={t("perfumes:confirmText")}
        cancelText={t("perfumes:cancelText")}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);

  if (!context)
    throw new Error("useConfirm must be used inside ConfirmProvider");

  return context.confirm;
}
