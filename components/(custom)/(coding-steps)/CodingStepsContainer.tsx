import { processWorkflowForWebsite } from "@/utils/functions/workflowInstructions";
import { JsonObject, JsonValue } from "@prisma/client/runtime/library";
import CodingSteps from "./CodingSteps";
import LangChainSteps from "./LangChainSteps";
import HttpSteps from "./HttpSteps";

interface WorkflowJsonProps {
  workflowJson: string | JsonObject | JsonValue;
}

const CodingStepsContainer = ({ workflowJson }: WorkflowJsonProps) => {
  const workflowData = processWorkflowForWebsite(workflowJson);

  //  console.log("Workflow Data:", workflowData.workflowName);
  const codeSteps = workflowData.data.codeSteps;
  const langchainSteps = workflowData.data.langchainSteps;
  const httpSteps = workflowData.data.httpSteps;
  console.log(workflowData.data);

  return (
    <div>
      <h1>Coding Steps </h1>

      <LangChainSteps workflowJson={langchainSteps} />

      <CodingSteps workflowJson={codeSteps} />

      <HttpSteps workflowJson={httpSteps} />
    </div>
  );
};
export default CodingStepsContainer;
