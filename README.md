# My Commands Launcher

## About

A quick and dirty Electron app to launch custom scripts/commands

## Usage

### Add a command

Commands are stored is a JSON file: `~/.commands.json`.

Add a command by editing this file as per the following example:
```json
[
    {
        "title": "My cool script",
        "command": "zenity --info --text \"Hello ladies and gents!\""
    }
]
```

