import { LAB_COMPONENTS } from "./labRegistry";

type LabWorkspaceProps = {
  labId: string;
};

export default function LabWorkspace({ labId }: LabWorkspaceProps) {
  const LabComponent = LAB_COMPONENTS[labId];

  if (!LabComponent) {
    return (
      <div className="lesson-card" role="alert">
        当前模块没有可用的交互实验工作区。
      </div>
    );
  }

  return <LabComponent />;
}
