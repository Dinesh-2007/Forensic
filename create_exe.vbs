Set objFSO = CreateObject("Scripting.FileSystemObject")
Set objShell = CreateObject("WScript.Shell")

' Get the directory where this script is located
strScriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Read launcher_with_logging.bat
strBatFile = strScriptDir & "\launcher_with_logging.bat"
strExeFile = strScriptDir & "\launcher.exe"

If Not objFSO.FileExists(strBatFile) Then
    MsgBox "launcher_with_logging.bat not found!", vbCritical, "Error"
    WScript.Quit 1
End If

' Check if launcher.exe already exists
If objFSO.FileExists(strExeFile) Then
    strOverwrite = MsgBox("launcher.exe already exists. Overwrite?", vbYesNo, "Confirm")
    If strOverwrite = vbNo Then
        WScript.Quit 0
    End If
    objFSO.DeleteFile strExeFile, True
End If

MsgBox "launcher_with_logging.bat will be converted to launcher.exe" & vbCrLf & vbCrLf & _
       "You'll need to use one of these tools:" & vbCrLf & _
       "1. Online: https://www.encodeconverter.com/batch-to-exe/" & vbCrLf & _
       "2. Desktop: Batch to EXE Converter (download from web)" & vbCrLf & _
       "3. Advanced: Resource Hacker for manual manifest", vbInformation, "Conversion Instructions"

' Open the batch file location
objShell.Execute "explorer.exe /select, """ & strBatFile & """"
