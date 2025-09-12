# 🎯 Avalonia Templates for VS Code

> **Generate fully-structured Avalonia UI components with one click. No more boilerplate. Just clean, scalable code.**

![Avalonia UI Templates](https://img.shields.io/badge/Avalonia_UI-Templates-512BD4?style=for-the-badge&logo=avalonia&logoColor=white)
![VS Code Extension](https://img.shields.io/badge/VS_Code-Extension-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)
![License](https://img.shields.io/badge/License-AGPL_3.0-512BD4?style=for-the-badge)

A powerful VS Code extension that automates the creation of **Avalonia UI** components — including `Window`, `UserControl`, `TemplatedControl`, `Styles`, and `ResourceDictionary` — with **proper namespace handling**, **directory structure**, **automatic using statements**, and **real-time logging**.

Perfect for developers building cross-platform desktop apps with Avalonia UI in C# and XAML.

---

## 🚀 Features

### ✨ Core Template Generation

| Feature                | Description                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| **Window**             | Creates a complete `Window.axaml` + `WindowViewModel.cs` with proper inheritance from `ViewModelBase`. |
| **UserControl**        | Generates `UserControl.axaml` + matching ViewModel with correct namespace & folder structure.          |
| **TemplatedControl**   | Boilerplate-ready templated control with `TemplatePart` attributes and default style.                  |
| **Styles**             | Auto-generates `Styles.axaml` with theme-aware resource definitions.                                   |
| **ResourceDictionary** | Clean, isolated `ResourceDictionary.axaml` files with optional namespace setup.                        |

### 🔧 Advanced Automation

- **Smart Namespace Detection**: Automatically detects project root and applies correct namespaces based on folder hierarchy.
- **Automatic `using` Statements**: Adds only the necessary `using` directives for Avalonia and your project’s ViewModel base class — no clutter.
- **Folder Structure Preservation**: Creates ViewModels in `/ViewModels/` subfolder, matching your project’s layout.
- **Configurable Logging**: Control verbosity with `avaloniaTemplates.logLevel` (`debug`, `info`, `warn`, `error`, `none`).

### 📊 Real-Time Diagnostics

- Built-in **singleton logger** with color-coded output in VS Code's **Output Panel**.
- Real-time progress tracking during template generation.
- Detailed error messages with actionable suggestions.

> 💡 _No more guessing which namespace to use or where to put the file. The extension knows your project structure._

---

## 🖼️ Preview

> 📹 Watch how it works in action:

### ➤ Creating a `Window`

![Create Window](https://github.com/adel-bakhshi/Avalonia-Templates-VS-Extenion/raw/master/assets/create-window.gif)

### ➤ Creating an `UserControl`

![Create UserControl](https://github.com/adel-bakhshi/Avalonia-Templates-VS-Extenion/raw/master/assets/create-usercontrol.gif)

---

## ⚙️ Configuration

Customize logging behavior via VS Code settings:

```json
{
  "avaloniaTemplates.logLevel": "info"
}
```

Available levels:

- `debug` — All logs (ideal for development)
- `info` — Default — Shows creation steps
- `warn` — Only warnings and errors
- `error` — Critical issues only
- `none` — Silent mode

> 💬 To access settings: `Ctrl+Shift+P` → “Preferences: Open Settings (JSON)”

---

## 🛠️ Installation

1. Open VS Code.
2. Go to **Extensions** (`Ctrl+Shift+X`).
3. Search for **“Avalonia Templates”** by **ADdy2142**.
4. Click **Install**.

✅ **Requirements**:

- VS Code 1.91+
- An existing Avalonia project (with `.axaml` files)
- .NET SDK installed

> 🔍 Extension activates automatically when you open any `.axaml` file or have one in your workspace.

---

## 📂 Generated Structure Example

### 👉 Window Example

When creating a `Window` named `MainWindow` inside `Views/`:

```
MyAvaloniaApp/
├── Views/
│   └── MainWindow.axaml
├── ViewModels/
│   └── MainWindowViewModel.cs ← Auto-generated!
└── ...
```

**MainWindowViewModel.cs** includes:

```csharp
using System;

namespace MyAvaloniaApp.ViewModels; // ✅ Correct namespace!

public class MainWindowViewModel : ViewModelBase // ✅ Inherited!
{
    public MainWindowViewModel()
    {
        // Initialize properties here
    }
}
```

### 👉 UserControl Example

When creating a `UserControl` named `SomeUserControl` inside `Views/UserControls/`:

```
MyAvaloniaApp/
├── Views/
│   └── UserControls/
│       └── SomeUserControl.axaml
├── ViewModels/
│   └── UserControls/
│       └── SomeUserControlViewModel.cs   ← Auto-generated!
└── ...
```

**SomeUserControlViewModel.cs** includes:

```csharp
using System;
using MyAvaloniaApp.ViewModels; // ✅ Auto using statement!

namespace MyAvaloniaApp.ViewModels.UserControls; // ✅ Correct nested namespace!

public class SomeUserControlViewModel : ViewModelBase // ✅ Inherited!
{
    public SomeUserControlViewModel()
    {
        // Initialize properties or commands here
    }
}
```

> 💡 _The extension automatically detects if you're creating a UserControl in a subfolder like `/Views/UserControls/` and mirrors the structure in `/ViewModels/UserControls/` — keeping your MVVM architecture clean and scalable._

---

## 📜 Change Log

See full details in [CHANGELOG.md](CHANGELOG.md)

---

## 🤝 Contributing

Found a bug? Have a feature request?

👉 [Open an Issue on GitHub](https://github.com/adel-bakhshi/Avalonia-Templates-VS-Extenion/issues)  
👨‍💻 Pull requests are welcome!

---

## 📄 License

This project is licensed under the **AGPL-3.0-only** license — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <img src="https://github.com/adel-bakhshi/Avalonia-Templates-VS-Extenion/raw/master/assets/icon.png" width="120" alt="Avalonia Templates Logo" />
  <br/>
  <em>Made with ❤️ for Avalonia Developers</em>
</p>
