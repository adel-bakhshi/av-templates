import { TemplateType } from "../enums/template-type";

/**
 * Change file content options.
 */
interface ChangeFileContentArgs {
  filePath: string;
  startContent: string;
  endContent: string;
  templateType: TemplateType;
  xamlNameSpace: string;
  csharpNameSpace: string;
  openFile: boolean;
  isCSharpFile: boolean;
}

export { ChangeFileContentArgs };
