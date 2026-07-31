import { useState } from "react";
import { SexFilter } from "../../ui/SexFilter";
import { type PerfumeSex } from "../../api/perfumesAPI";
import ApproveFilter from "../../ui/ApproveFilter";
import Search from "../../ui/Search";
import { useDebounce } from "../../hooks/useDebounce";

export function Dashboard() {
  const [sex, setSex] = useState<PerfumeSex>();
  const [approved, setApproved] = useState<boolean | undefined>();
  const [search, setSearch] = useState("");

  const debouncedValue = useDebounce(search, 400);
  return (
    <>
      <Search text={search} handleChange={setSearch} />
      <SexFilter sex={sex} handleSelect={setSex} />
      <ApproveFilter approved={approved} handleActive={setApproved} />
    </>
  );
}
