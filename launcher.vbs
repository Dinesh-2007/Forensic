' WinSentinel Admin Launcher - VBScript Version
' This handles admin privileges, starts server, opens localhost

Dim objShell, objFSO, strAppPath, strBackendPath, strCmd, objWShell
Dim pythonCmd, browserCmd, logFile

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")
Set objWShell = WScript.CreateObject("WScript.Shell")

' Get current script directory
strAppPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
strBackendPath = strAppPath & "\backend"
logFile = objShell.ExpandEnvironmentStrings("%TEMP%\WinSentinel_Launcher.log")

' Create a simple logging function
Sub LogMessage(msg)
    On Error Resume Next
    Dim objFile
    Set objFile = objFSO.OpenTextFile(logFile, 8, True)
    objFile.WriteLine "[" & Now & "] " & msg
    objFile.Close
    WScript.Echo msg
    On Error Goto 0
End Sub

' Check if running as admin
Function IsAdmin()
    On Error Resume Next
    Dim objShell, result
    Set objShell = CreateObject("Shell.Application")
    result = objShell.IsUserAnAdmin
    If Err.Number <> 0 Then
        IsAdmin = False
    Else
        IsAdmin = result
    End If
    On Error Goto 0
End Function

LogMessage "Launcher started"

' Request admin if not running as admin
If Not IsAdmin() Then
    LogMessage "Requesting admin privileges..."
    
    ' Re-run as admin
    Dim objShell2
    Set objShell2 = CreateObject("Shell.Application")
    objShell2.ShellExecute "cscript.exe", """" & WScript.ScriptFullName & """", "", "runas", 1
    WScript.Quit
End If

LogMessage "Admin privileges confirmed"

' Clear screen effect
WScript.Echo ""
WScript.Echo "========================================"
WScript.Echo "    WinSentinel Admin Launcher"
WScript.Echo "========================================"
WScript.Echo ""
WScript.Echo "Admin Status: CONFIRMED"
WScript.Echo "User: " & objShell.ExpandEnvironmentStrings("%USERNAME%")
WScript.Echo "Working Directory: " & strAppPath
WScript.Echo ""

' Check if backend exists
If Not objFSO.FolderExists(strBackendPath) Then
    WScript.Echo "ERROR: backend folder not found!"
    WScript.Echo "Current location: " & strAppPath
    LogMessage "ERROR: backend folder not found"
    WScript.Echo ""
    WScript.Quit 1
End If

If Not objFSO.FileExists(strBackendPath & "\main.py") Then
    WScript.Echo "ERROR: backend\main.py not found!"
    LogMessage "ERROR: main.py not found"
    WScript.Echo ""
    WScript.Quit 1
End If

' Check Python
WScript.Echo "Checking Python installation..."
On Error Resume Next
objShell.Run "python --version", 0, True
If Err.Number <> 0 Then
    WScript.Echo ""
    WScript.Echo "ERROR: Python not found"
    WScript.Echo "Please install Python from https://python.org"
    LogMessage "ERROR: Python not found"
    WScript.Echo ""
    WScript.Quit 1
End If
On Error Goto 0

WScript.Echo ""
WScript.Echo "Installing dependencies..."
objShell.Run "cmd.exe /c cd /d """ & strBackendPath & """ && python -m pip install -q -r requirements.txt", 0, True

WScript.Echo ""
WScript.Echo "========================================"
WScript.Echo "Starting WinSentinel Server..."
WScript.Echo "========================================"
WScript.Echo ""
WScript.Echo "Server launching on port 5000..."
WScript.Echo "Starting: python -m uvicorn main:app --host 0.0.0.0 --port 5000"
WScript.Echo ""

' Start server in visible window (so we can see errors)
objShell.Run "cmd.exe /k cd /d """ & strBackendPath & """ && python -m uvicorn main:app --host 0.0.0.0 --port 5000", 1, False
LogMessage "Server started"

WScript.Echo ""
WScript.Echo "Waiting 10 seconds for server to initialize..."
WScript.Sleep 10000

WScript.Echo ""
WScript.Echo "========================================"
WScript.Echo "Opening Browser..."
WScript.Echo "========================================"
WScript.Echo ""

' Open browser
objShell.Run "http://localhost:5000", 1, False
LogMessage "Browser launched"

WScript.Sleep 2000

WScript.Echo ""
WScript.Echo "========================================"
WScript.Echo "    SUCCESS! Server is Running"
WScript.Echo "========================================"
WScript.Echo ""
WScript.Echo "Website: http://localhost:5000"
WScript.Echo "Admin Privileges: ACTIVE"
WScript.Echo "Server Process: Running in background"
WScript.Echo ""
WScript.Echo "To stop the server, close the black window"
WScript.Echo ""
WScript.Echo "Launcher will close in 8 seconds..."
LogMessage "Launcher completed successfully"

WScript.Sleep 8000
WScript.Quit 0
