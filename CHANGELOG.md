# Change Log

## Version 3.0.0 - 2026-02-10

### Compliance & Branding

- **Renamed extension** from "Avalonia Templates" to **"Templates for Avalonia UI"** to comply with AvaloniaUI trademark guidelines.
- **Updated all internal references** from "Avalonia Templates" to **"AV Templates"** in logs, commands, and user messages.
- **Changed repository name** from `Avalonia-Templates-VS-Extenion` to `av-templates`.
- **Added clear disclaimer** throughout the project indicating this is an **unofficial community extension**.

### Package & Configuration Updates

- **Updated `package.json`**:
  - Changed `name` to `"av-templates"`.
  - Updated `description` to clearly state unofficial status.
  - Revised `keywords` and internal `category` names to avoid trademark implications.
  - Changed configuration setting from `avaloniaTemplates.logLevel` to **`avt.logLevel`**.
- **Removed unauthorized logo** and branding elements.

### Technical Refactoring

- **Updated all command IDs** to use `av-templates.*` prefix.
- **Renamed output channel** from "Avalonia Templates" to **"AV Templates"**.
- **Updated code documentation** to reflect new naming conventions.
- **Fixed repository URLs** in all documentation files.

### Notes

- **All existing functionality remains unchanged** for end users.
- This update resolves the trademark policy issue identified in GitHub #2.
- The extension is now fully compliant with AvaloniaUI's trademark guidelines while maintaining all original features.

## Version 2.0.1 - 2025-09-12

### Bug Fixes

- **Fixed minor issues** in template generation

### Performance Improvements

- **Enhanced performance** and speed of template creation

### Documentation

- **Updated README.md** with comprehensive guides and examples
- **Added troubleshooting tips** for common issues
- **Improved documentation** for configuration and settings

## Version 2.0.0 - 2025-09-12

### Major Features

- **Added comprehensive logging system** with configurable output channel
- **Enhanced ViewModel creation** with proper namespace handling and inheritance
- **Improved error handling** with detailed diagnostics and user feedback

### New Features

- Singleton logger with multiple log levels (debug, info, warn, error, none)
- Automatic using statements for ViewModelBase across different namespaces
- Maintains proper subdirectory structure for ViewModel creation
- Configurable logging through extension settings

### Technical Improvements

- Added output channel for real-time extension diagnostics
- Enhanced progress reporting during template creation
- Better namespace detection and resolution
- Improved error recovery and user notifications

## Version 1.0.1 - 2025-02-25

- Add CHANGELOG file

## Version 1.0.0 - 2025-02-25

- Added the ability to create ViewModels for Window and UserControl

## Version 0.0.15 - 2024-07-28

- Fix some bugs

## Version 0.0.12 - 2024-07-24

- Fix some bugs

## Version 0.0.1 - 2024-07-24

- Initial release
