import { TemplateType } from "../enums/template-type";

/**
 * Configuration for create a template.
 */
interface CreateTemplateOptions {
  templateType: TemplateType;
  fsPath: any;
}

export { CreateTemplateOptions };
