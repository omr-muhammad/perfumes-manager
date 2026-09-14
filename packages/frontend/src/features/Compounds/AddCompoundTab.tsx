// import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { CompoundForm } from "./CompoundForm";

export function AddCompoundTab() {
  // const { t } = useTranslation();

  async function handleSubmit() {
    toast.success("Form submitted");
  }

  return <CompoundForm onSubmit={handleSubmit} submitting={false} />;
}
