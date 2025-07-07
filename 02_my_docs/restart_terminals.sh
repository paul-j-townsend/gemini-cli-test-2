#!/bin/bash

# Simple terminal setup for current Cursor workspace
echo "🚀 Setting up terminal configuration for current workspace..."

# Create .vscode directory if it doesn't exist
mkdir -p .vscode

# Create a simple launch configuration that sets up terminals
echo "📡 Creating workspace terminal configuration..."
cat > .vscode/settings.json << 'EOF'
{
    "terminal.integrated.tabs.enabled": true,
    "terminal.integrated.tabs.showActions": "always",
    "terminal.integrated.defaultProfile.osx": "zsh",
    "terminal.integrated.profiles.osx": {
        "Gemini Project": {
            "path": "zsh",
            "args": ["-l", "-c", "echo '📡 Gemini project terminal ready' && cd '/Users/paultownsend/Library/CloudStorage/GoogleDrive-paultownsendnew@gmail.com/My Drive/dev/gemini-cli-test-2' && exec zsh"]
        },
        "Claude Terminal": {
            "path": "zsh", 
            "args": ["-l", "-c", "echo '🤖 Claude terminal ready' && exec zsh"]
        },
        "General Terminal": {
            "path": "zsh",
            "args": ["-l", "-c", "echo '📂 General terminal ready' && exec zsh"]
        }
    }
}
EOF

# Create a simple tasks file for manual terminal creation
cat > .vscode/tasks.json << 'EOF'
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Open Terminal Panel",
            "type": "shell",
            "command": "echo",
            "args": ["Use Ctrl+` to open terminal, then use the dropdown to select terminal profiles"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "panel": "shared"
            }
        }
    ]
}
EOF

echo "✅ Workspace configured!"
echo ""
echo "🎯 Terminal setup complete! Now in Cursor:"
echo "   1. Press Ctrl+\` to open terminal"
echo "   2. Click the dropdown arrow next to the + button"
echo "   3. Select from available profiles:"
echo "      • Gemini Project"
echo "      • Claude Terminal" 
echo "      • General Terminal"
echo ""
echo "💡 Each profile will automatically set up the right environment"
echo "🔄 Reload Cursor window (Cmd+R) to ensure settings take effect"