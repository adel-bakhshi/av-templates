import { TemplateType } from "../enums/template-type";

/**
 * Changes the namespace of the given file.
 */
interface ChangeNamespaceArgs {
  templateType: TemplateType;
  createPath: string;
  projectPath: string;
  fileName: string;
  frontendModifiedStartContent: string;
  frontendModifiedEndContent: string;
  backendModifiedStartContent: string;
  backendModifiedEndContent: string;
}

export { ChangeNamespaceArgs };
