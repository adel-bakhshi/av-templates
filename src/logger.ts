import * as vscode from "vscode";
import { AppLogLevel } from "./enums/app-log-level";

/**
 * Singleton logger class for the extension
 */
export class Logger {
  private static instance: Logger;
  private outputChannel: vscode.OutputChannel;
  private logLevel: AppLogLevel;

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel("Avalonia Templates");
    this.logLevel = this.getLogLevelFromConfig();

    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration(this.onConfigurationChanged.bind(this));
  }

  /**
   * Gets the singleton instance of the logger
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }

    return Logger.instance;
  }

  /**
   * Logs a debug message
   */
  public debug(message: string, ...args: any[]): void {
    if (this.logLevel <= AppLogLevel.DEBUG) {
      this.log("DEBUG", message, args);
    }
  }

  /**
   * Logs an info message
   */
  public info(message: string, ...args: any[]): void {
    if (this.logLevel <= AppLogLevel.INFO) {
      this.log("INFO", message, args);
    }
  }

  /**
   * Logs a warning message
   */
  public warn(message: string, ...args: any[]): void {
    if (this.logLevel <= AppLogLevel.WARN) {
      this.log("WARN", message, args);
    }
  }

  /**
   * Logs an error message
   */
  public error(message: string, error?: Error, ...args: any[]): void {
    if (this.logLevel <= AppLogLevel.ERROR) {
      this.log("ERROR", message, args);
      if (error) {
        this.outputChannel.appendLine(`Stack: ${error.stack}`);
      }
    }
  }

  /**
   * Shows the output channel
   */
  public show(): void {
    this.outputChannel.show();
  }

  /**
   * Hides the output channel
   */
  public hide(): void {
    this.outputChannel.hide();
  }

  /**
   * Disposes the output channel
   */
  public dispose(): void {
    this.outputChannel.dispose();
  }

  /**
   * Gets current log level from configuration
   */
  private getLogLevelFromConfig(): AppLogLevel {
    const config = vscode.workspace.getConfiguration("avaloniaTemplates");
    const level = config.get<string>("logLevel", "info");

    switch (level.toLowerCase()) {
      case "debug":
        return AppLogLevel.DEBUG;

      case "info":
        return AppLogLevel.INFO;

      case "warn":
        return AppLogLevel.WARN;

      case "error":
        return AppLogLevel.ERROR;

      case "none":
        return AppLogLevel.NONE;

      default:
        return AppLogLevel.INFO;
    }
  }

  /**
   * Handles configuration changes
   */
  private onConfigurationChanged(e: vscode.ConfigurationChangeEvent): void {
    if (e.affectsConfiguration("avaloniaTemplates.logLevel")) {
      this.logLevel = this.getLogLevelFromConfig();
      this.info("Log level changed to: " + AppLogLevel[this.logLevel]);
    }
  }

  /**
   * Internal log method
   */
  private log(level: string, message: string, args: any[]): void {
    const timestamp = new Date().toISOString();
    const formattedMessage =
      args.length > 0
        ? `${timestamp} [${level}] ${message} ${args.map((arg) => JSON.stringify(arg)).join(" ")}`
        : `${timestamp} [${level}] ${message}`;

    this.outputChannel.appendLine(formattedMessage);
  }
}

// Convenience functions for easier logging
export const log = {
  debug: (message: string, ...args: any[]) => Logger.getInstance().debug(message, ...args),
  info: (message: string, ...args: any[]) => Logger.getInstance().info(message, ...args),
  warn: (message: string, ...args: any[]) => Logger.getInstance().warn(message, ...args),
  error: (message: string, error?: Error, ...args: any[]) => Logger.getInstance().error(message, error, ...args),
  show: () => Logger.getInstance().show(),
  hide: () => Logger.getInstance().hide(),
};
