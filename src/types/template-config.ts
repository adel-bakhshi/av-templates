/**
 * Configuration for different template types
 */
interface TemplateConfig {
  typeName: string;
  dotnetTemplate: string;
  supportsViewModel: boolean;
  requiresNamespaceUpdate: boolean;
}

export { TemplateConfig };
