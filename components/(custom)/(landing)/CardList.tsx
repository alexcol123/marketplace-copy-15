

import { WorkflowCardTypes } from "@/utils/types";
import CardWorkFLow from "./CardWorkflow";


const CardsList = ({ workflows }: { workflows: WorkflowCardTypes[] }) => {

  return (
    <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {workflows.map((workflows) => (
        <CardWorkFLow key={workflows.id} workflows={workflows} />
      ))}
    </section>
  );
};
export default CardsList;
