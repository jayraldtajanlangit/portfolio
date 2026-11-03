param(
    [string]$InputDocx = (Join-Path $PSScriptRoot '../output/docx/Jayrald_Tajanlangit_CV.docx'),
    [string]$OutputPdf = (Join-Path $PSScriptRoot '../output/pdf/Jayrald_Tajanlangit_CV.pdf')
)
$ErrorActionPreference = 'Stop'
$cvSource = (Resolve-Path -LiteralPath $InputDocx).Path
$cvPdf = [System.IO.Path]::GetFullPath($OutputPdf)
$null = New-Item -ItemType Directory -Path ([System.IO.Path]::GetDirectoryName($cvPdf)) -Force
$cvWord = $null
$cvDocument = $null
try {
    # Use Word only as a hidden file renderer, without saving the DOCX again.
    $cvWord = New-Object -ComObject Word.Application
    $cvWord.Visible = $false
    $cvWord.DisplayAlerts = 0
    $cvDocument = $cvWord.Documents.Open($cvSource, $false, $true, $false)
    $cvDocument.ExportAsFixedFormat($cvPdf, 17)
    Write-Output $cvPdf
}
finally {
    if ($null -ne $cvDocument) {
        $cvDocument.Close(0)
        $null = [System.Runtime.InteropServices.Marshal]::ReleaseComObject($cvDocument)
    }
    if ($null -ne $cvWord) {
        $cvWord.Quit(0)
        $null = [System.Runtime.InteropServices.Marshal]::ReleaseComObject($cvWord)
    }
}
