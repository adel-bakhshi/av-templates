import * as vscode from "vscode";
import * as childProcess from "child_process";
import * as path from "path";
import * as fs from "fs";
import { TemplateType } from "./enums/template-type";
import { CreateTemplateOptions } from "./types/create-template-options";
import { ChangeFileContentArgs } from "./types/change-file-content-args";
import { TemplateConfig } from "./types/template-config";
import { ChangeNamespaceArgs } from "./types/change-namespace-args";
import { Logger, log } from "./logger";

/**
 * Activates the Avalonia Templates extension
 * @param context - The extension context provided by VSCode
 */
export function activate(context: vscode.ExtensionContext) {
  log.info("Avalonia Templates extension activated");

  // Register all template creation commands
  const commands = [
    vscode.commands.registerCommand("avalonia-templates.createWindow", (args: any) => {
      log.debug("createWindow command triggered", { fsPath: args?.fsPath });
      createTemplate({ templateType: TemplateType.Window, fsPath: args?.fsPath });
    }),
    vscode.commands.registerCommand("avalonia-templates.createUserControl", (args: any) => {
      log.debug("createUserControl command triggered", { fsPath: args?.fsPath });
      createTemplate({ templateType: TemplateType.UserControl, fsPath: args?.fsPath });
    }),
    vscode.commands.registerCommand("avalonia-templates.createTemplatedControl", (args: any) => {
      log.debug("createTemplatedControl command triggered", { fsPath: args?.fsPath });
      createTemplate({ templateType: TemplateType.TemplatedControl, fsPath: args?.fsPath });
    }),
    vscode.commands.registerCommand("avalonia-templates.createStyles", (args: any) => {
      log.debug("createStyles command triggered", { fsPath: args?.fsPath });
      createTemplate({ templateType: TemplateType.Styles, fsPath: args?.fsPath });
    }),
    vscode.commands.registerCommand("avalonia-templates.createResourceDictionary", (args: any) => {
      log.debug("createResourceDictionary command triggered", { fsPath: args?.fsPath });
      createTemplate({ templateType: TemplateType.ResourceDictionary, fsPath: args?.fsPath });
    }),
  ];

  // Add all commands to subscriptions for proper cleanup
  context.subscriptions.push(...commands, Logger.getInstance());
}

/**
 * Deactivates the extension (cleanup if needed)
 */
export function deactivate() {
  log.info("Avalonia Templates extension deactivated");
}

/**
 * Creates an Avalonia template based on user selection
 * @param args - Configuration for template creation
 */
async function createTemplate(args: CreateTemplateOptions) {
  const { templateType, fsPath } = args;
  log.info("Creating template", { templateType, fsPath });

  // Determine template type and check if ViewModel should be created
  const templateConfig = getTemplateConfiguration(templateType);
  const alsoCreateViewModel = templateConfig.supportsViewModel
    ? await promptForViewModelCreation(templateConfig.typeName)
    : false;

  log.debug("Template configuration", { templateConfig, alsoCreateViewModel });

  // Get file name from user input
  const fileName = await vscode.window.showInputBox({
    placeHolder: `Choose a name for your ${templateConfig.typeName}`,
  });

  if (!fileName) {
    log.warn("User cancelled file name input");
    vscode.window.showErrorMessage("File name is not valid. Please try again with a valid name.");
    return;
  }

  log.debug("File name received", { fileName });

  // Determine creation path (right-click location or project root)
  const projectPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath ?? "";
  const createPath = fsPath ?? projectPath;

  if (!createPath) {
    log.error("No suitable creation path found");
    vscode.window.showErrorMessage("Unable to find a suitable location to create the file. Please try again.");
    return;
  }

  log.debug("Creation paths determined", { projectPath, createPath });

  // Execute template creation with progress indicator
  await executeTemplateCreation({
    templateType,
    fileName,
    createPath,
    projectPath,
    alsoCreateViewModel,
    templateConfig,
  });
}

/**
 * Gets configuration for a specific template type
 */
function getTemplateConfiguration(templateType: TemplateType): TemplateConfig {
  log.debug("Getting template configuration", { templateType });

  const configs: Record<TemplateType, TemplateConfig> = {
    [TemplateType.Window]: {
      typeName: "Window",
      dotnetTemplate: "avalonia.window",
      supportsViewModel: true,
      requiresNamespaceUpdate: true,
    },
    [TemplateType.UserControl]: {
      typeName: "UserControl",
      dotnetTemplate: "avalonia.usercontrol",
      supportsViewModel: true,
      requiresNamespaceUpdate: true,
    },
    [TemplateType.TemplatedControl]: {
      typeName: "TemplatedControl",
      dotnetTemplate: "avalonia.templatedcontrol",
      supportsViewModel: false,
      requiresNamespaceUpdate: true,
    },
    [TemplateType.Styles]: {
      typeName: "Styles",
      dotnetTemplate: "avalonia.styles",
      supportsViewModel: false,
      requiresNamespaceUpdate: false,
    },
    [TemplateType.ResourceDictionary]: {
      typeName: "ResourceDictionary",
      dotnetTemplate: "avalonia.resource",
      supportsViewModel: false,
      requiresNamespaceUpdate: false,
    },
  };

  return configs[templateType];
}

/**
 * Executes the template creation process with progress reporting
 */
async function executeTemplateCreation(params: {
  templateType: TemplateType;
  fileName: string;
  createPath: string;
  projectPath: string;
  alsoCreateViewModel: boolean;
  templateConfig: TemplateConfig;
}) {
  const { templateType, fileName, createPath, projectPath, alsoCreateViewModel, templateConfig } = params;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      cancellable: false,
      title: "Avalonia UI Templates",
    },
    async (progress) => {
      try {
        progress.report({ message: "Creating template..." });
        log.info("Starting template creation process", { templateType, fileName, createPath });

        // Execute dotnet template command
        const command = `dotnet new ${templateConfig.dotnetTemplate} -n ${fileName}`;
        log.debug("Executing dotnet command", { command, cwd: createPath });

        try {
          // Try to execute the command without --force option
          childProcess.execSync(command, { cwd: createPath });
          log.info("Template created successfully without --force");
        } catch (error) {
          // Handle the error if the project is not restored
          if (error instanceof Error && error.message.includes("is not restored")) {
            log.warn("Project not restored, using --force option", { error: error.message });
            progress.report({ message: "Project not restored, using --force option..." });
            const forceCommand = `${command} --force`;
            childProcess.execSync(forceCommand, { cwd: createPath });
            log.info("Template created successfully with --force");
          } else {
            // Handle other errors
            log.error("Error executing dotnet command", error as Error, { command });
            throw error;
          }
        }

        // Update namespaces for relevant template types
        if (templateConfig.requiresNamespaceUpdate) {
          log.debug("Updating namespaces for template");
          await updateTemplateNamespaces(templateType, createPath, projectPath, fileName);
        } else {
          // Open the created file for non-code templates
          log.debug("Opening non-code template file");
          await openTextDocument(path.join(createPath, `${fileName}.axaml`));
        }

        // Create ViewModel if requested
        if (alsoCreateViewModel) {
          log.debug("Creating ViewModel as requested");
          await createViewModel(createPath, fileName, projectPath, templateType, progress);
        }

        progress.report({ increment: 100, message: "Template created successfully!" });
        log.info("Template creation completed successfully");
      } catch (error) {
        log.error("Error in template creation process", error as Error, params);
        handleCreationError(error);
      }
    }
  );
}

/**
 * Updates namespaces for created templates
 */
async function updateTemplateNamespaces(
  templateType: TemplateType,
  createPath: string,
  projectPath: string,
  fileName: string
) {
  log.debug("Updating template namespaces", { templateType, createPath, fileName });

  const namespaceArgs: ChangeNamespaceArgs = {
    templateType,
    createPath,
    projectPath,
    fileName,
    frontendModifiedStartContent:
      templateType === TemplateType.TemplatedControl ? `xmlns:controls="using:` : `x:Class="`,
    frontendModifiedEndContent: templateType === TemplateType.TemplatedControl ? `">` : `"`,
    backendModifiedStartContent: `namespace `,
    backendModifiedEndContent: `;`,
  };

  await changeNamespaces(namespaceArgs);
}

/**
 * Handles errors during template creation
 */
function handleCreationError(error: unknown) {
  let errorMessage = "An error occurred while trying to create your files";

  if (error instanceof Error) {
    if (error.message.includes("Solution or project file not found")) {
      errorMessage = "No solution or project file found in workspace. Please open an Avalonia project.";
    } else if (error.message.includes("Namespace not found")) {
      errorMessage = "Could not determine namespace. Please make sure you're working in a valid project structure.";
    } else {
      errorMessage = error.message;
    }
  }

  log.error("Creation error handled", error as Error, { errorMessage });
  vscode.window.showErrorMessage(errorMessage);
  throw new Error(errorMessage);
}

/**
 * Changes namespaces in generated files
 */
async function changeNamespaces(args: ChangeNamespaceArgs) {
  log.debug("Changing namespaces", { createPath: args.createPath, fileName: args.fileName });

  const namespaces = findNameSpaces(args.createPath, args.projectPath, args.fileName);
  log.debug("Namespaces found", { namespaces });

  const frontendFilePath = path.join(args.createPath, `${args.fileName}.axaml`);
  const backendFilePath = path.join(args.createPath, `${args.fileName}.axaml.cs`);

  // Update XAML file namespace
  await changeFileContent({
    filePath: frontendFilePath,
    startContent: args.frontendModifiedStartContent,
    endContent: args.frontendModifiedEndContent,
    templateType: args.templateType,
    xamlNameSpace: namespaces.xamlNameSpace,
    csharpNameSpace: namespaces.csharpNameSpace,
    openFile: true,
    isCSharpFile: false,
  });

  // Update C# code-behind file namespace
  await changeFileContent({
    filePath: backendFilePath,
    startContent: args.backendModifiedStartContent,
    endContent: args.backendModifiedEndContent,
    templateType: args.templateType,
    xamlNameSpace: namespaces.xamlNameSpace,
    csharpNameSpace: namespaces.csharpNameSpace,
    openFile: false,
    isCSharpFile: true,
  });
}

/**
 * Finds appropriate namespaces for the generated files
 */
function findNameSpaces(createPath: string, projectPath: string, fileName: string) {
  log.debug("Finding namespaces", { createPath, projectPath, fileName });

  const solutionDir = findSolutionOrProjectDirectory(projectPath);

  if (!solutionDir) {
    log.error("Solution or project directory not found");
    throw new Error("Solution or project file not found in workspace.");
  }

  log.debug("Solution directory found", { solutionDir });

  const { isSolutionDir, projectName } = analyzeSolutionDirectory(solutionDir);
  const namespace = constructNamespace(createPath, solutionDir, fileName, isSolutionDir, projectName);

  if (!namespace) {
    log.error("Namespace could not be constructed");
    throw new Error("Namespace not found.");
  }

  log.debug("Namespace constructed", { namespace });

  return {
    xamlNameSpace: namespace,
    csharpNameSpace: namespace.includes(".") ? namespace.substring(0, namespace.lastIndexOf(".")) : namespace,
  };
}

/**
 * Analyzes the solution directory to determine project structure
 */
function analyzeSolutionDirectory(solutionDir: string) {
  log.debug("Analyzing solution directory", { solutionDir });

  const isSolutionDir = fs.readdirSync(solutionDir).some((file) => file.endsWith(".sln"));
  let projectName = "";

  if (!isSolutionDir) {
    const csprojFile = fs.readdirSync(solutionDir).find((file) => file.endsWith(".csproj"));
    if (csprojFile) {
      projectName = csprojFile.replace(".csproj", "");
    }
  }

  log.debug("Solution analysis result", { isSolutionDir, projectName });
  return { isSolutionDir, projectName };
}

/**
 * Constructs the namespace based on project structure
 */
function constructNamespace(
  createPath: string,
  solutionDir: string,
  fileName: string,
  isSolutionDir: boolean,
  projectName: string
): string {
  const relativePath = path.relative(solutionDir, createPath);
  let namespace = relativePath
    .split(path.sep)
    .filter((part) => part !== "")
    .join(".");

  if (namespace) {
    namespace += `.${fileName}`;
  } else {
    namespace = fileName;
  }

  if (!isSolutionDir && projectName) {
    namespace = `${projectName}.${namespace}`;
  }

  return namespace;
}

/**
 * Finds the directory containing solution or project files
 */
function findSolutionOrProjectDirectory(startDir: string): string | null {
  log.debug("Finding solution or project directory", { startDir });

  if (containsSolutionOrProject(startDir)) {
    log.debug("Solution/project found in start directory", { startDir });
    return startDir;
  }

  const result = findSolutionOrProjectRecursive(startDir);
  log.debug("Recursive search result", { startDir, result });
  return result;
}

/**
 * Checks if a directory contains solution or project files
 */
function containsSolutionOrProject(dir: string): boolean {
  try {
    const files = fs.readdirSync(dir);
    const contains = files.some((file) => file.endsWith(".sln") || file.endsWith(".csproj"));
    log.debug("Directory contains solution/project", { dir, contains });
    return contains;
  } catch (error) {
    log.error("Error checking directory for solution/project", error as Error, { dir });
    return false;
  }
}

/**
 * Recursively searches for solution or project directories
 */
function findSolutionOrProjectRecursive(dir: string): string | null {
  log.debug("Recursively searching for solution/project", { dir });

  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      if (item.isDirectory()) {
        const subDir = path.join(dir, item.name);

        if (containsSolutionOrProject(subDir)) {
          log.debug("Solution/project found in subdirectory", { subDir });
          return subDir;
        }

        const result = findSolutionOrProjectRecursive(subDir);
        if (result) {
          log.debug("Solution/project found recursively", { result });
          return result;
        }
      }
    }
  } catch (error) {
    log.error("Error in recursive search", error as Error, { dir });
  }

  log.debug("No solution/project found in directory", { dir });
  return null;
}

/**
 * Opens a text document in the editor
 */
async function openTextDocument(filePath: string) {
  log.debug("Opening text document", { filePath });

  try {
    const document = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(document);
    log.debug("Text document opened successfully", { filePath });
  } catch (error) {
    log.error("Error opening text document", error as Error, { filePath });
    throw error;
  }
}

/**
 * Changes file content with proper namespace
 */
async function changeFileContent(args: ChangeFileContentArgs) {
  log.debug("Changing file content", { filePath: args.filePath, templateType: args.templateType });

  try {
    const fileContent = fs.readFileSync(args.filePath, { encoding: "utf-8" });
    const modifiedStartIndex = fileContent.indexOf(args.startContent) + args.startContent.length;
    const modifiedEndIndex = fileContent.indexOf(args.endContent, modifiedStartIndex);

    const namespaceToUse =
      args.isCSharpFile || args.templateType === TemplateType.TemplatedControl
        ? args.csharpNameSpace
        : args.xamlNameSpace;

    const modifiedData =
      fileContent.substring(0, modifiedStartIndex) + namespaceToUse + fileContent.substring(modifiedEndIndex);

    fs.writeFileSync(args.filePath, modifiedData);
    log.debug("File content changed successfully", { filePath: args.filePath });

    if (args.openFile) {
      await openTextDocument(args.filePath);
    }
  } catch (error) {
    log.error("Error changing file content", error as Error, args);
    throw error;
  }
}

/**
 * Prompts user for ViewModel creation
 */
async function promptForViewModelCreation(templateType: string): Promise<boolean> {
  log.debug("Prompting for ViewModel creation", { templateType });

  const userOption = await vscode.window.showInformationMessage(
    `Would you like to create a ViewModel for your ${templateType} as well?`,
    "Yes",
    "No"
  );

  const result = userOption === "Yes";
  log.debug("User ViewModel creation choice", { templateType, result });
  return result;
}

/**
 * Creates a ViewModel for the generated view
 */
async function createViewModel(
  viewPath: string,
  viewName: string,
  projectPath: string,
  templateType: TemplateType,
  progress: vscode.Progress<{ message: string; increment?: number }>
) {
  log.info("Creating ViewModel", { viewPath, viewName });
  progress.report({ message: "Creating ViewModel..." });

  let directoryPath = viewPath;
  let viewModelsPath = viewPath;

  // Follow MVVM pattern: if view is in Views folder, put ViewModel in ViewModels folder with the same subdirectory structure
  if (directoryPath.toLowerCase().includes("\\views")) {
    const viewsIndex = directoryPath.toLowerCase().indexOf("\\views");
    const basePath = directoryPath.substring(0, viewsIndex);
    viewModelsPath = path.join(basePath, "ViewModels");

    // Extract the subdirectory path after "Views"
    const viewsSubPath = directoryPath.substring(viewsIndex + "\\views".length);

    // Create corresponding ViewModels path
    directoryPath = path.join(viewModelsPath, viewsSubPath);

    // Make sure ViewModels directory and all subdirectories exist
    if (!fs.existsSync(directoryPath)) {
      log.debug("Creating ViewModels directory", { directoryPath });
      fs.mkdirSync(directoryPath, { recursive: true });
    }
  }

  log.debug("ViewModel directory determined", { directoryPath, viewModelsPath });

  // Create ViewModel file name
  const fileName = viewName.toLowerCase().endsWith("view") ? `${viewName}Model` : `${viewName}ViewModel`;
  log.debug("ViewModel file name", { fileName });

  // Define command to create ViewModel
  const command = `dotnet new class -n ${fileName}`;

  try {
    // Try to execute the command without --force option
    log.debug("Executing ViewModel creation command", { command, cwd: directoryPath });
    childProcess.execSync(command, { cwd: directoryPath });
    log.info("ViewModel created successfully without --force");
  } catch (error) {
    // Handle the error if the project is not restored
    if (error instanceof Error && error.message.includes("is not restored")) {
      log.warn("Project not restored for ViewModel, using --force option", { error: error.message });
      progress.report({ message: "Project not restored, using --force option..." });
      const forceCommand = `${command} --force`;
      childProcess.execSync(forceCommand, { cwd: directoryPath });
      log.info("ViewModel created successfully with --force");
    } else {
      // Handle other errors
      log.error("Error creating ViewModel", error as Error, { command, directoryPath });
      throw error;
    }
  }

  // Add namespace to ViewModel file
  const namespaces = findNameSpaces(directoryPath, projectPath, fileName);
  log.debug("ViewModel namespaces", { namespaces });

  const filePath = path.join(directoryPath, `${fileName}.cs`);

  await changeFileContent({
    filePath: filePath,
    isCSharpFile: true,
    startContent: "namespace ",
    endContent: ";",
    xamlNameSpace: namespaces.xamlNameSpace,
    csharpNameSpace: namespaces.csharpNameSpace,
    openFile: false,
    templateType: templateType,
  });

  // Add ViewModelBase inheritance if available
  inheritFromViewModelBaseIfExists(filePath, fileName, viewModelsPath);
}

/**
 * Adds ViewModelBase inheritance if ViewModelBase class exists
 */
function inheritFromViewModelBaseIfExists(
  viewModelFilePath: string,
  viewModelFileName: string,
  viewModelsPath: string
) {
  log.debug("Checking for ViewModelBase inheritance", { viewModelFilePath, viewModelsPath });

  const viewModelBasePath = path.join(viewModelsPath, "ViewModelBase.cs");

  if (!fs.existsSync(viewModelBasePath)) {
    log.debug("ViewModelBase not found, skipping inheritance");
    return;
  }

  log.debug("ViewModelBase found, adding inheritance");

  // Find namespace of ViewModelBase
  const viewModelBaseNamespace = findViewModelBaseNamespace(viewModelBasePath);
  const viewModelNamespace = findViewModelNamespace(viewModelFilePath);

  log.debug("Namespace comparison", { viewModelBaseNamespace, viewModelNamespace });

  // Read ViewModel file content
  let fileContent = fs.readFileSync(viewModelFilePath, { encoding: "utf-8" });

  // Add using statement if namespaces are different
  if (viewModelBaseNamespace && viewModelNamespace && viewModelBaseNamespace !== viewModelNamespace) {
    const usingStatement = `using ${viewModelBaseNamespace};\r\n\r\n`;
    log.debug("Adding using statement", { usingStatement });

    // Find the namespace line to insert using after it
    const namespaceIndex = fileContent.indexOf("namespace ");
    if (namespaceIndex !== -1) {
      // Insert using statement before namespace
      fileContent = fileContent.substring(0, namespaceIndex) + usingStatement + fileContent.substring(namespaceIndex);
    }
  }

  // Add inheritance
  const startIndex = fileContent.indexOf(` class ${viewModelFileName}`);
  const endIndex = fileContent.indexOf("{", startIndex);

  const modifiedData =
    fileContent.substring(0, startIndex) +
    ` class ${viewModelFileName} : ViewModelBase\r\n` +
    fileContent.substring(endIndex);

  fs.writeFileSync(viewModelFilePath, modifiedData);
  log.info("ViewModelBase inheritance added successfully");
}

/**
 * Finds the namespace of ViewModelBase class
 */
function findViewModelBaseNamespace(viewModelBasePath: string): string | null {
  try {
    const content = fs.readFileSync(viewModelBasePath, { encoding: "utf-8" });
    const namespaceMatch = content.match(/namespace\s+([^\s;]+)/);
    const result = namespaceMatch ? namespaceMatch[1] : null;
    log.debug("ViewModelBase namespace found", { viewModelBasePath, result });
    return result;
  } catch (error) {
    log.error("Error finding ViewModelBase namespace", error as Error, { viewModelBasePath });
    return null;
  }
}

/**
 * Finds the namespace of ViewModel class
 */
function findViewModelNamespace(viewModelFilePath: string): string | null {
  try {
    const content = fs.readFileSync(viewModelFilePath, { encoding: "utf-8" });
    const namespaceMatch = content.match(/namespace\s+([^\s;]+)/);
    const result = namespaceMatch ? namespaceMatch[1] : null;
    log.debug("ViewModel namespace found", { viewModelFilePath, result });
    return result;
  } catch (error) {
    log.error("Error finding ViewModel namespace", error as Error, { viewModelFilePath });
    return null;
  }
}
