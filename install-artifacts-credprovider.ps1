<#
.SYNOPSIS
    Executes a versioned installation script of artifacts-credprovider from a GitHub release artifact.

.DESCRIPTION
    This script downloads a file from a GitHub artifacts-credprovider release artifact using the provided
    version string and executes the downloaded script, allowing the install script parameters to be passed.

.PARAMETER Version
    The version string of the release (e.g., "1.4.1").

.EXAMPLE
    .\installcredproviderrelease.ps1 -Version 1.3.0 -AddNetFx -Force"
#>

[CmdletBinding(HelpUri = "https://github.com/microsoft/artifacts-credprovider/blob/master/README.md#setup")]
param(
    [Parameter(Mandatory = $false)]
    [string]$Version,

    [Parameter(Mandatory = $false, ValueFromRemainingArguments = $true)]
    [string]$AdditionalParams
)

$ErrorActionPreference = 'Stop'

function Get-ReleaseUrl {
    # Get the file base URL from the GitHub release
    $releaseUrlBase = "https://api.github.com/repos/microsoft/artifacts-credprovider/releases"
    $versionError = "Unable to find the release version $ReleaseVersion from $releaseUrlBase"
    $releaseId = "latest"
    if (![string]::IsNullOrEmpty($ReleaseVersion)) {
        try {
            $releases = Invoke-WebRequest -UseBasicParsing $releaseUrlBase
            $releaseJson = $releases | ConvertFrom-Json
            $correctReleaseVersion = $releaseJson | ? { $_.name -eq $ReleaseVersion }
            $releaseId = $correctReleaseVersion.id
        }
        catch {
            Write-Error $versionError
            return
        }
    }

    if (!$releaseId) {
        Write-Error $versionError
        return
    }

    $releaseUrl = [System.IO.Path]::Combine($releaseUrlBase, $releaseId)
    return $releaseUrl.Replace("\", "/")
}

# Version parameter validation
if ($Version) {
    if ($Version -match '^[vV]') {
        $Version = $Version.Substring(1) # Remove leading 'v' or 'V'
    }

    if ($Version -notmatch '^\d+\.\d+\.\d+') {
        Write-Error "Invalid version. Please use the format #.#.# to override the release version."
        return
    }
}

if ($Version -and ($Version.StartsWith("0.") -or $Version.StartsWith("1."))) {
    # For versions 0.x and 1.0.x, use the last 1.x release URL for backward compatibility
    $ReleaseVersion = "1.4.1"
    $releaseUrl = Get-ReleaseUrl
}
else {
    $ReleaseVersion = $Version
    $releaseUrl = Get-ReleaseUrl
}

$installScriptName = "installcredprovider.ps1"
try {
    Write-Host "Fetching release metadata from $releaseUrl"
    $release = Invoke-WebRequest -UseBasicParsing $releaseUrl
    if (!$release) {
        throw ("Unable to make Web Request to $releaseUrl")
    }
    $releaseJson = $release.Content | ConvertFrom-Json
    if (!$releaseJson) {
        throw ("Unable to get content from JSON")
    }
    $installAsset = $releaseJson.assets | ? { $_.name -eq $installScriptName }
    if (!$installAsset) {
        throw ("Unable to find asset $installScriptName from release JSON object")
    }
    $installHash = $installAsset.digest
    if ($installHash -and $installHash.StartsWith("sha256:")) {
        $expectedHash = $installHash.Substring(7) # Remove "sha256:" prefix
    }
    else {
        $expectedHash = $null
    }
    $installUrl = $installAsset.browser_download_url
    if (!$installUrl) {
        throw ("Unable to find download url from asset $installAsset")
    }
}
catch {
    Write-Error ("Unable to resolve the browser download url from $releaseUrl `nError: " + $_.Exception.Message)
    return
}

# Build the parameters for the executed install script
$paramString = ""
if ($Version) {
    $paramString += "-Version $Version "
}
if ($AdditionalParams) {
    $paramString += $AdditionalParams
}

try {
    # Fetch the install file content
    Write-Host "Fetching $installScriptName from $installUrl..."
    $tempScriptLocation = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), $installScriptName);
    try {
        $client = New-Object System.Net.WebClient
        $client.DownloadFile($installUrl, $tempScriptLocation)
    }
    catch {
        Write-Error "Unable to download $packageSourceUrl to the location $pluginZip"
    }

    if ($null -ne $expectedHash) {
        $actualHash = (Get-FileHash -Path $tempScriptLocation -Algorithm SHA256).Hash
        if ($actualHash.ToLower() -ne $expectedHash.ToLower()) {
            throw "The downloaded $installScriptName hash does not match. `nExpected: $expectedHash, Actual: $actualHash"
        }
    }

    # Execute the script directly from the URL with additional parameters
    Write-Host "Executing $installScriptName..."
    $execCmd = "& { $($tempScriptLocation) $paramString }"
    Invoke-Expression -Command $execCmd
}
catch {
    Write-Error "Failed to fetch, validate, or execute artifacts-credprovider install. Error message: $_"
}

# SIG # Begin signature block
# MIIoLAYJKoZIhvcNAQcCoIIoHTCCKBkCAQExDzANBglghkgBZQMEAgEFADB5Bgor
# BgEEAYI3AgEEoGswaTA0BgorBgEEAYI3AgEeMCYCAwEAAAQQH8w7YFlLCE63JNLG
# KX7zUQIBAAIBAAIBAAIBAAIBADAxMA0GCWCGSAFlAwQCAQUABCBtb+5vXanaPHqJ
# +3KwxIndSRALuxiI+4SXDMRpdSwswqCCDXYwggX0MIID3KADAgECAhMzAAAEhV6Z
# 7A5ZL83XAAAAAASFMA0GCSqGSIb3DQEBCwUAMH4xCzAJBgNVBAYTAlVTMRMwEQYD
# VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
# b3NvZnQgQ29ycG9yYXRpb24xKDAmBgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25p
# bmcgUENBIDIwMTEwHhcNMjUwNjE5MTgyMTM3WhcNMjYwNjE3MTgyMTM3WjB0MQsw
# CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
# ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMR4wHAYDVQQDExVNaWNy
# b3NvZnQgQ29ycG9yYXRpb24wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB
# AQDASkh1cpvuUqfbqxele7LCSHEamVNBfFE4uY1FkGsAdUF/vnjpE1dnAD9vMOqy
# 5ZO49ILhP4jiP/P2Pn9ao+5TDtKmcQ+pZdzbG7t43yRXJC3nXvTGQroodPi9USQi
# 9rI+0gwuXRKBII7L+k3kMkKLmFrsWUjzgXVCLYa6ZH7BCALAcJWZTwWPoiT4HpqQ
# hJcYLB7pfetAVCeBEVZD8itKQ6QA5/LQR+9X6dlSj4Vxta4JnpxvgSrkjXCz+tlJ
# 67ABZ551lw23RWU1uyfgCfEFhBfiyPR2WSjskPl9ap6qrf8fNQ1sGYun2p4JdXxe
# UAKf1hVa/3TQXjvPTiRXCnJPAgMBAAGjggFzMIIBbzAfBgNVHSUEGDAWBgorBgEE
# AYI3TAgBBggrBgEFBQcDAzAdBgNVHQ4EFgQUuCZyGiCuLYE0aU7j5TFqY05kko0w
# RQYDVR0RBD4wPKQ6MDgxHjAcBgNVBAsTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEW
# MBQGA1UEBRMNMjMwMDEyKzUwNTM1OTAfBgNVHSMEGDAWgBRIbmTlUAXTgqoXNzci
# tW2oynUClTBUBgNVHR8ETTBLMEmgR6BFhkNodHRwOi8vd3d3Lm1pY3Jvc29mdC5j
# b20vcGtpb3BzL2NybC9NaWNDb2RTaWdQQ0EyMDExXzIwMTEtMDctMDguY3JsMGEG
# CCsGAQUFBwEBBFUwUzBRBggrBgEFBQcwAoZFaHR0cDovL3d3dy5taWNyb3NvZnQu
# Y29tL3BraW9wcy9jZXJ0cy9NaWNDb2RTaWdQQ0EyMDExXzIwMTEtMDctMDguY3J0
# MAwGA1UdEwEB/wQCMAAwDQYJKoZIhvcNAQELBQADggIBACjmqAp2Ci4sTHZci+qk
# tEAKsFk5HNVGKyWR2rFGXsd7cggZ04H5U4SV0fAL6fOE9dLvt4I7HBHLhpGdE5Uj
# Ly4NxLTG2bDAkeAVmxmd2uKWVGKym1aarDxXfv3GCN4mRX+Pn4c+py3S/6Kkt5eS
# DAIIsrzKw3Kh2SW1hCwXX/k1v4b+NH1Fjl+i/xPJspXCFuZB4aC5FLT5fgbRKqns
# WeAdn8DsrYQhT3QXLt6Nv3/dMzv7G/Cdpbdcoul8FYl+t3dmXM+SIClC3l2ae0wO
# lNrQ42yQEycuPU5OoqLT85jsZ7+4CaScfFINlO7l7Y7r/xauqHbSPQ1r3oIC+e71
# 5s2G3ClZa3y99aYx2lnXYe1srcrIx8NAXTViiypXVn9ZGmEkfNcfDiqGQwkml5z9
# nm3pWiBZ69adaBBbAFEjyJG4y0a76bel/4sDCVvaZzLM3TFbxVO9BQrjZRtbJZbk
# C3XArpLqZSfx53SuYdddxPX8pvcqFuEu8wcUeD05t9xNbJ4TtdAECJlEi0vvBxlm
# M5tzFXy2qZeqPMXHSQYqPgZ9jvScZ6NwznFD0+33kbzyhOSz/WuGbAu4cHZG8gKn
# lQVT4uA2Diex9DMs2WHiokNknYlLoUeWXW1QrJLpqO82TLyKTbBM/oZHAdIc0kzo
# STro9b3+vjn2809D0+SOOCVZMIIHejCCBWKgAwIBAgIKYQ6Q0gAAAAAAAzANBgkq
# hkiG9w0BAQsFADCBiDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
# EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
# bjEyMDAGA1UEAxMpTWljcm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5
# IDIwMTEwHhcNMTEwNzA4MjA1OTA5WhcNMjYwNzA4MjEwOTA5WjB+MQswCQYDVQQG
# EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
# A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQg
# Q29kZSBTaWduaW5nIFBDQSAyMDExMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIIC
# CgKCAgEAq/D6chAcLq3YbqqCEE00uvK2WCGfQhsqa+laUKq4BjgaBEm6f8MMHt03
# a8YS2AvwOMKZBrDIOdUBFDFC04kNeWSHfpRgJGyvnkmc6Whe0t+bU7IKLMOv2akr
# rnoJr9eWWcpgGgXpZnboMlImEi/nqwhQz7NEt13YxC4Ddato88tt8zpcoRb0Rrrg
# OGSsbmQ1eKagYw8t00CT+OPeBw3VXHmlSSnnDb6gE3e+lD3v++MrWhAfTVYoonpy
# 4BI6t0le2O3tQ5GD2Xuye4Yb2T6xjF3oiU+EGvKhL1nkkDstrjNYxbc+/jLTswM9
# sbKvkjh+0p2ALPVOVpEhNSXDOW5kf1O6nA+tGSOEy/S6A4aN91/w0FK/jJSHvMAh
# dCVfGCi2zCcoOCWYOUo2z3yxkq4cI6epZuxhH2rhKEmdX4jiJV3TIUs+UsS1Vz8k
# A/DRelsv1SPjcF0PUUZ3s/gA4bysAoJf28AVs70b1FVL5zmhD+kjSbwYuER8ReTB
# w3J64HLnJN+/RpnF78IcV9uDjexNSTCnq47f7Fufr/zdsGbiwZeBe+3W7UvnSSmn
# Eyimp31ngOaKYnhfsi+E11ecXL93KCjx7W3DKI8sj0A3T8HhhUSJxAlMxdSlQy90
# lfdu+HggWCwTXWCVmj5PM4TasIgX3p5O9JawvEagbJjS4NaIjAsCAwEAAaOCAe0w
# ggHpMBAGCSsGAQQBgjcVAQQDAgEAMB0GA1UdDgQWBBRIbmTlUAXTgqoXNzcitW2o
# ynUClTAZBgkrBgEEAYI3FAIEDB4KAFMAdQBiAEMAQTALBgNVHQ8EBAMCAYYwDwYD
# VR0TAQH/BAUwAwEB/zAfBgNVHSMEGDAWgBRyLToCMZBDuRQFTuHqp8cx0SOJNDBa
# BgNVHR8EUzBRME+gTaBLhklodHRwOi8vY3JsLm1pY3Jvc29mdC5jb20vcGtpL2Ny
# bC9wcm9kdWN0cy9NaWNSb29DZXJBdXQyMDExXzIwMTFfMDNfMjIuY3JsMF4GCCsG
# AQUFBwEBBFIwUDBOBggrBgEFBQcwAoZCaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
# L3BraS9jZXJ0cy9NaWNSb29DZXJBdXQyMDExXzIwMTFfMDNfMjIuY3J0MIGfBgNV
# HSAEgZcwgZQwgZEGCSsGAQQBgjcuAzCBgzA/BggrBgEFBQcCARYzaHR0cDovL3d3
# dy5taWNyb3NvZnQuY29tL3BraW9wcy9kb2NzL3ByaW1hcnljcHMuaHRtMEAGCCsG
# AQUFBwICMDQeMiAdAEwAZQBnAGEAbABfAHAAbwBsAGkAYwB5AF8AcwB0AGEAdABl
# AG0AZQBuAHQALiAdMA0GCSqGSIb3DQEBCwUAA4ICAQBn8oalmOBUeRou09h0ZyKb
# C5YR4WOSmUKWfdJ5DJDBZV8uLD74w3LRbYP+vj/oCso7v0epo/Np22O/IjWll11l
# hJB9i0ZQVdgMknzSGksc8zxCi1LQsP1r4z4HLimb5j0bpdS1HXeUOeLpZMlEPXh6
# I/MTfaaQdION9MsmAkYqwooQu6SpBQyb7Wj6aC6VoCo/KmtYSWMfCWluWpiW5IP0
# wI/zRive/DvQvTXvbiWu5a8n7dDd8w6vmSiXmE0OPQvyCInWH8MyGOLwxS3OW560
# STkKxgrCxq2u5bLZ2xWIUUVYODJxJxp/sfQn+N4sOiBpmLJZiWhub6e3dMNABQam
# ASooPoI/E01mC8CzTfXhj38cbxV9Rad25UAqZaPDXVJihsMdYzaXht/a8/jyFqGa
# J+HNpZfQ7l1jQeNbB5yHPgZ3BtEGsXUfFL5hYbXw3MYbBL7fQccOKO7eZS/sl/ah
# XJbYANahRr1Z85elCUtIEJmAH9AAKcWxm6U/RXceNcbSoqKfenoi+kiVH6v7RyOA
# 9Z74v2u3S5fi63V4GuzqN5l5GEv/1rMjaHXmr/r8i+sLgOppO6/8MO0ETI7f33Vt
# Y5E90Z1WTk+/gFcioXgRMiF670EKsT/7qMykXcGhiJtXcVZOSEXAQsmbdlsKgEhr
# /Xmfwb1tbWrJUnMTDXpQzTGCGgwwghoIAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMw
# EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
# aWNyb3NvZnQgQ29ycG9yYXRpb24xKDAmBgNVBAMTH01pY3Jvc29mdCBDb2RlIFNp
# Z25pbmcgUENBIDIwMTECEzMAAASFXpnsDlkvzdcAAAAABIUwDQYJYIZIAWUDBAIB
# BQCggbAwGQYJKoZIhvcNAQkDMQwGCisGAQQBgjcCAQQwHAYKKwYBBAGCNwIBCzEO
# MAwGCisGAQQBgjcCARUwLwYJKoZIhvcNAQkEMSIEIB7fMLFD5GdiCKEtu438Yekv
# 29UykLCjuo1I3uxTeyeDMEQGCisGAQQBgjcCAQwxNjA0oBSAEgBNAGkAYwByAG8A
# cwBvAGYAdKEcgBpodHRwczovL3d3dy5taWNyb3NvZnQuY29tIDANBgkqhkiG9w0B
# AQEFAASCAQB2Pk+YZEzs/YtZefbOFDjCJxrod2vPstxzxUwyl9M7zG0fSzCEcQW6
# 9L8ieja5Aaq648BaKOxeWhBtiloHr+T4ymAFhMJk9DW5r8g64oi61o+PzCxqx/TH
# 6duAtPMaTNgkvzkyPfKFOYZTc9OlmwUxgRYzm+jVUtJd8tBrzspAo4stuLpGoB2k
# pef1g/PaauqNA09L/jYYwD/JssWuPT6wNzVio8Xr+6XsZazRLp5eua6vxXMAADht
# 8RdKMBRcvL9jCgqE2t/Uj+sNhEbpTe7wCTldS6CcJZLpLZrfhKSLroFreObmpcxC
# FSJgaeWXKVvnhk0/BBGGmWPy1Lc7JVoroYIXlDCCF5AGCisGAQQBgjcDAwExgheA
# MIIXfAYJKoZIhvcNAQcCoIIXbTCCF2kCAQMxDzANBglghkgBZQMEAgEFADCCAVIG
# CyqGSIb3DQEJEAEEoIIBQQSCAT0wggE5AgEBBgorBgEEAYRZCgMBMDEwDQYJYIZI
# AWUDBAIBBQAEIKt6Tq6zcOEd1xRyjMtiHzS5nLL0mU3iJ8TiopSfCwPrAgZpuGfI
# NusYEzIwMjYwMzE3MTc0OTMyLjg4NFowBIACAfSggdGkgc4wgcsxCzAJBgNVBAYT
# AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
# VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJTAjBgNVBAsTHE1pY3Jvc29mdCBB
# bWVyaWNhIE9wZXJhdGlvbnMxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVTTjo5NjAw
# LTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vydmlj
# ZaCCEeowggcgMIIFCKADAgECAhMzAAACJjW0PmdDk/YfAAEAAAImMA0GCSqGSIb3
# DQEBCwUAMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
# VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
# BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMB4XDTI2MDIxOTE5
# NDAwMloXDTI3MDUxNzE5NDAwMlowgcsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
# YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
# Q29ycG9yYXRpb24xJTAjBgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlv
# bnMxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVTTjo5NjAwLTA1RTAtRDk0NzElMCMG
# A1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZTCCAiIwDQYJKoZIhvcN
# AQEBBQADggIPADCCAgoCggIBAL//D5lkgvlEUWlUjwPdnK427wjNwAQ4PfQ4tiOH
# ffuteNysiU5LOklzhl5TETKWLrHoXrObg1Hx1s9v12IOn+E5TMdYbGIDVndFcoFv
# /gX+iPK83jdIQZapJ9VzcjcGWxhPfl5xUAn2RV/3Rg6/b20WMkEFmRi+tP8PDDJE
# uxw7I/in73+XImMP5QuzdhcGFWt9n4xtAH4FgoupG8EpuP/BH1qQ2szFAg2gZoPm
# Nk783+dKyYbY/XO/9y/iBKgwGdZ5AgGSN3YjnDUN5e6mna9KI2ZHmwDZmQErfKJB
# Zom9HE4OWR+LIeT0yST9OthOOaM8JuF766qEc1HLxSVs69awKrS1G1TKQe/f0OCo
# B8k2sTw5K3zfmsHMOmutwCHCaB+GhWLgAp6rCKRjSdRrjwrRDLzRdPh+IQDcTERk
# 1pEWj02r8bBt+CoqoaZz3GEq5EVyO25rgodm+cC+laAQVI4KSi9ez8FwueQQcz3F
# nyJRqDkLKE2pdhgT/PSlxd1ho0iRDrwRaa68ubuD2ih9Xa86bkZU2iCGeRYbqcY+
# j8nASCYD2hJLQR+8VExY8D+ClK8XeyECsoedoSlVJKLcM1vKK5iISz0qjQiRlzzE
# oV5BFqoZHGsH7av/sHdfzVOmz30qEXCD7APzuh3bYXYxSDXHu3C3eBpWcWTQhkjB
# Q8IbAgMBAAGjggFJMIIBRTAdBgNVHQ4EFgQUXeGf19gk3Zj9n0tVsE8jEDNcexAw
# HwYDVR0jBBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKg
# UIZOaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwvTWljcm9zb2Z0
# JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwGCCsGAQUFBwEBBGAw
# XjBcBggrBgEFBQcwAoZQaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9j
# ZXJ0cy9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5jcnQw
# DAYDVR0TAQH/BAIwADAWBgNVHSUBAf8EDDAKBggrBgEFBQcDCDAOBgNVHQ8BAf8E
# BAMCB4AwDQYJKoZIhvcNAQELBQADggIBADZTHS2v2xgKOyrQVHKJWnHXk66s1e/p
# CTuJf4CtU+XPfDi2qNxM2bV23e1O5rbAkykmE8fyftReGZP3x3kO7jguXhp2ex7h
# JB9WDdAvppGRceclSfzL2J+0H8/Lbaf3GfA8V+PdCUM5KAu4eV673tTSIfZlqW5h
# ptZcmKF2Jikrxw8cWWpk4CKi3T4YPx0/5Ey6+nG38XYuZh6WmhnCuKIU5SaXERRX
# vEkfJlmUOq6yR7K6rTUNO/3U3iozxx88+GX/alzgd4x/+d3Yei6J8lsNAU13hY+E
# vOfRLLe7VmHf5Le2NB2o353LDrRFpX5FcKg4uAVncwCD8agOX5+9vmHL/VrvVy1f
# zARp3U9/p15/amp+XfAVz76GQXwNddNmh8k3hhVo3cifBsAZAMOQ0riWp5wKLHGZ
# IrCJ0/KcZ4Tk6282grWmQuyb+LwXVGMZzNn+RIXZUOSobzrqJD6NVsY5DoO7d7LI
# VwUpmgMngHmYQBL1pPZIqqWUt7Js5ugfqvruyJHkH/Yee7v4pi5hnLQERp20DqeA
# bhydJH0myuSGGwqZvXW6OrCAnI3H3YyygYbA2A3VojRAgPwKyMIXCl+YzOUDjjEc
# pi/eGaPF6oFLi5TmtB6ICdWCkl5pUYqb+XM8O2emkZX7teFGnlvVnFP9ntfFz4js
# fv+MK1ANmhplMIIHcTCCBVmgAwIBAgITMwAAABXF52ueAptJmQAAAAAAFTANBgkq
# hkiG9w0BAQsFADCBiDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
# EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
# bjEyMDAGA1UEAxMpTWljcm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5
# IDIwMTAwHhcNMjEwOTMwMTgyMjI1WhcNMzAwOTMwMTgzMjI1WjB8MQswCQYDVQQG
# EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
# A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
# VGltZS1TdGFtcCBQQ0EgMjAxMDCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
# ggIBAOThpkzntHIhC3miy9ckeb0O1YLT/e6cBwfSqWxOdcjKNVf2AX9sSuDivbk+
# F2Az/1xPx2b3lVNxWuJ+Slr+uDZnhUYjDLWNE893MsAQGOhgfWpSg0S3po5GawcU
# 88V29YZQ3MFEyHFcUTE3oAo4bo3t1w/YJlN8OWECesSq/XJprx2rrPY2vjUmZNqY
# O7oaezOtgFt+jBAcnVL+tuhiJdxqD89d9P6OU8/W7IVWTe/dvI2k45GPsjksUZzp
# cGkNyjYtcI4xyDUoveO0hyTD4MmPfrVUj9z6BVWYbWg7mka97aSueik3rMvrg0Xn
# Rm7KMtXAhjBcTyziYrLNueKNiOSWrAFKu75xqRdbZ2De+JKRHh09/SDPc31BmkZ1
# zcRfNN0Sidb9pSB9fvzZnkXftnIv231fgLrbqn427DZM9ituqBJR6L8FA6PRc6ZN
# N3SUHDSCD/AQ8rdHGO2n6Jl8P0zbr17C89XYcz1DTsEzOUyOArxCaC4Q6oRRRuLR
# vWoYWmEBc8pnol7XKHYC4jMYctenIPDC+hIK12NvDMk2ZItboKaDIV1fMHSRlJTY
# uVD5C4lh8zYGNRiER9vcG9H9stQcxWv2XFJRXRLbJbqvUAV6bMURHXLvjflSxIUX
# k8A8FdsaN8cIFRg/eKtFtvUeh17aj54WcmnGrnu3tz5q4i6tAgMBAAGjggHdMIIB
# 2TASBgkrBgEEAYI3FQEEBQIDAQABMCMGCSsGAQQBgjcVAgQWBBQqp1L+ZMSavoKR
# PEY1Kc8Q/y8E7jAdBgNVHQ4EFgQUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXAYDVR0g
# BFUwUzBRBgwrBgEEAYI3TIN9AQEwQTA/BggrBgEFBQcCARYzaHR0cDovL3d3dy5t
# aWNyb3NvZnQuY29tL3BraW9wcy9Eb2NzL1JlcG9zaXRvcnkuaHRtMBMGA1UdJQQM
# MAoGCCsGAQUFBwMIMBkGCSsGAQQBgjcUAgQMHgoAUwB1AGIAQwBBMAsGA1UdDwQE
# AwIBhjAPBgNVHRMBAf8EBTADAQH/MB8GA1UdIwQYMBaAFNX2VsuP6KJcYmjRPZSQ
# W9fOmhjEMFYGA1UdHwRPME0wS6BJoEeGRWh0dHA6Ly9jcmwubWljcm9zb2Z0LmNv
# bS9wa2kvY3JsL3Byb2R1Y3RzL01pY1Jvb0NlckF1dF8yMDEwLTA2LTIzLmNybDBa
# BggrBgEFBQcBAQROMEwwSgYIKwYBBQUHMAKGPmh0dHA6Ly93d3cubWljcm9zb2Z0
# LmNvbS9wa2kvY2VydHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYtMjMuY3J0MA0GCSqG
# SIb3DQEBCwUAA4ICAQCdVX38Kq3hLB9nATEkW+Geckv8qW/qXBS2Pk5HZHixBpOX
# PTEztTnXwnE2P9pkbHzQdTltuw8x5MKP+2zRoZQYIu7pZmc6U03dmLq2HnjYNi6c
# qYJWAAOwBb6J6Gngugnue99qb74py27YP0h1AdkY3m2CDPVtI1TkeFN1JFe53Z/z
# jj3G82jfZfakVqr3lbYoVSfQJL1AoL8ZthISEV09J+BAljis9/kpicO8F7BUhUKz
# /AyeixmJ5/ALaoHCgRlCGVJ1ijbCHcNhcy4sa3tuPywJeBTpkbKpW99Jo3QMvOyR
# gNI95ko+ZjtPu4b6MhrZlvSP9pEB9s7GdP32THJvEKt1MMU0sHrYUP4KWN1APMdU
# bZ1jdEgssU5HLcEUBHG/ZPkkvnNtyo4JvbMBV0lUZNlz138eW0QBjloZkWsNn6Qo
# 3GcZKCS6OEuabvshVGtqRRFHqfG3rsjoiV5PndLQTHa1V1QJsWkBRH58oWFsc/4K
# u+xBZj1p/cvBQUl+fpO+y/g75LcVv7TOPqUxUYS8vwLBgqJ7Fx0ViY1w/ue10Cga
# iQuPNtq6TPmb/wrpNPgkNWcr4A245oyZ1uEi6vAnQj0llOZ0dFtq0Z4+7X6gMTN9
# vMvpe784cETRkPHIqzqKOghif9lwY1NNje6CbaUFEMFxBmoQtB1VM1izoXBm8qGC
# A00wggI1AgEBMIH5oYHRpIHOMIHLMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
# aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
# cnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQgQW1lcmljYSBPcGVyYXRpb25z
# MScwJQYDVQQLEx5uU2hpZWxkIFRTUyBFU046OTYwMC0wNUUwLUQ5NDcxJTAjBgNV
# BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMV
# AKL98zEW2Sqvtcxd2xHJZTSVIodnoIGDMIGApH4wfDELMAkGA1UEBhMCVVMxEzAR
# BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
# Y3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
# bXAgUENBIDIwMTAwDQYJKoZIhvcNAQELBQACBQDtY47vMCIYDzIwMjYwMzE3MDgy
# NzI3WhgPMjAyNjAzMTgwODI3MjdaMHQwOgYKKwYBBAGEWQoEATEsMCowCgIFAO1j
# ju8CAQAwBwIBAAICKzgwBwIBAAICExIwCgIFAO1k4G8CAQAwNgYKKwYBBAGEWQoE
# AjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDANBgkq
# hkiG9w0BAQsFAAOCAQEAawycs8RlKuBQ6yVlti136e1ixZU0OAu73dxMgtzz7HId
# fxa8Jv/mpQhYyTlHq0Wj5tRIZeCMKR+0PlGgxyxN7Jmg9fmn5uyktffc+eGPz3Bh
# wV/xLedwxMszpptN2AD5XxUvgLnzePRnnFXhLJpJg+RJQen4Ot4UMoD2Kls+dFMz
# FI14UJFKTIm0xG2fM1mq7+SApw4WegXECQSZfdw85zt1Vf7IUgGi62B8uDwaP+ag
# pxZR+dQqnjJA3MWDcf8KyH2wvxOwsTe/S+/PCxOWfOMklML/GGZtckkEoW44tafc
# LF4/U0j7IknqTQQunjrWsTIXQhueQ9+VSF0OVBHgtTGCBA0wggQJAgEBMIGTMHwx
# CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
# b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
# Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAACJjW0PmdDk/YfAAEAAAIm
# MA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQw
# LwYJKoZIhvcNAQkEMSIEINpI17xLt4n/Hh/lLNPZTTfMHjv5rRUj53RDx3PH5wFx
# MIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCBvQQgzDJcYWdM2xlEGuzoY38FtXSi
# Ro0/dUFiosWNSwWduCowgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMK
# V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
# IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
# MjAxMAITMwAAAiY1tD5nQ5P2HwABAAACJjAiBCDFZflgQguJcI+sJcVkxLptcitP
# fxla0KtSkUvNixcnJDANBgkqhkiG9w0BAQsFAASCAgBLBZBHiFxEeFHQDcx3NPxk
# oloJkhuHF0haZ7mw2A79Dx8811/nqa2kULyArGULFdZ7+ekJn2nLxDSePf8Exw48
# qH0GI1I1BAWXBWPvTiQAaeW6WGrChQqJxtpoRO+nsfMLAnbbCz0JKO4nyyURWi3p
# fJ5GmAY5dKyti3E5VQr8/q2b0+6a2LkeWXUrnp/DPRNtRApwT9mjXDWFjvKjlLwc
# 76ROcb70NTxtSgFnJBuABBz8769gYEomaKTES/WrsNd3bHl4r2MCR8a859XBhDD4
# Kq7Yo7NpQguQNJMJfTRMhMdVeLRsPojcRW15OiQgo1GBwHDxDmA3IEwwAUmYP58I
# wVnO5Mwh9xX9iDYg0v/MfEQDTv3VeTPGkPdigHqQ42FSwwOEtrjJb23trIlsAFMN
# S+TAcJWb+psBz1XWKKNaQy3bwXgTBohiNUOU3nA1PZ4CgQ/uGxIuuiExAUozxLWm
# d7dDeNBlJ+wUegO2odunCHLlOoIwzFCNQED5INDsaW/jpLEbZcAK1SN9T5DBMjE+
# T0Q2XxmvKJajtj5tdxuAix0Y3tfwVhyc2We8jgr4pL6tJAdcQb8BVuFgEG4fnlpM
# x6R/OHGHK1I80Nch4B3xOp+ZCGCq7+MRPXRjubBJoaQOUKFjQNDn1/mFraxaFqgM
# Ebra6EYyQhqk66uBzThgvA==
# SIG # End signature block
