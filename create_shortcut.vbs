Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get current script directory
strScriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Create shortcut to launcher_no_uac.bat
strShortcutPath = strScriptDir & "\WinSentinel.lnk"
strBatPath = strScriptDir & "\launcher_no_uac.bat"

' Create the shortcut
Set objShortcut = objShell.CreateShortcut(strShortcutPath)
objShortcut.TargetPath = "cmd.exe"
objShortcut.Arguments = "/c """ & strBatPath & """"
objShortcut.WorkingDirectory = strScriptDir
objShortcut.WindowStyle = 1  ' Normal window
objShortcut.IconLocation = "cmd.exe,0"
objShortcut.Description = "WinSentinel Admin Launcher"
objShortcut.Save

WScript.Echo "Created: " & strShortcutPath
