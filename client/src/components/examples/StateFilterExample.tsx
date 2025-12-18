import { StateFilter } from "../StateFilter";

export default function StateFilterExample() {
  return (
    <StateFilter
      onFilterChange={(filters) => console.log("Filters changed:", filters)}
    />
  );
}
