# Test-InstructionPortability.ps1
# Validates that the enhanced AI instruction system is portable and reusable
#
# PLATFORM REQUIREMENTS:
# - Windows: PowerShell 5.1+ (built-in)
# - Linux/macOS: PowerShell Core 6.0+ (install separately)
# - Alternative: Future versions may include cross-platform variants (.sh, .js)
#
# PURPOSE: Tests instruction system structure and content separation for reusability
# NOTE: The instruction system itself is cross-platform; this test validates its integrity

param(
    [switch]$Verbose,
    [switch]$FixViolations
)

Write-Host "=== ENHANCED AI INSTRUCTION PORTABILITY TEST ===" -ForegroundColor Cyan
Write-Host ""

$script:testResults = @()
$script:violations = @()

function Add-TestResult {
    param($TestName, $Status, $Message, $Details = $null)
    $script:testResults += [PSCustomObject]@{
        Test    = $TestName
        Status  = $Status
        Message = $Message
        Details = $Details
    }
}

function Test-GenericFiles {
    Write-Host "TEST 1: Generic Tech-Specific Files" -ForegroundColor Yellow
    
    $projectTerms = @('drazzan', 'invasion', 'spaceship', 'asteroid', 'enemy', 'boss', 'The_Drazzan_Invasion')
    $violations = @()
    
    if (Test-Path "tech-specific") {
        Get-ChildItem "tech-specific\*.md" | ForEach-Object {
            $content = Get-Content $_.FullName -Raw
            foreach ($term in $projectTerms) {
                if ($content -match $term) {
                    $violations += "$($_.Name): Contains '$term'"
                }
            }
        }
    }
    else {
        $violations += "tech-specific directory not found"
    }
    
    if ($violations.Count -eq 0) {
        Add-TestResult "TechFiles" "PASS" "All tech-specific files are generic"
        Write-Host "PASS: Tech-specific files are portable" -ForegroundColor Green
    }
    else {
        Add-TestResult "TechFiles" "FAIL" "Project-specific terms found" $violations
        Write-Host "FAIL: Project-specific terms found in tech files:" -ForegroundColor Red
        $violations | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
    }
}

function Test-EntryPoint {
    Write-Host "TEST 2: Entry Point Discovery Algorithm" -ForegroundColor Yellow
    
    if (Test-Path "copilot-entry-point.md") {
        $content = Get-Content "copilot-entry-point.md" -Raw
        $hasDiscovery = $content -match 'Discovery'
        $hasInference = $content -match 'inference|detection'
        $hasStructure = $content -match 'tech-specific|project-specific|templates'
        
        if ($hasDiscovery -and $hasInference -and $hasStructure) {
            Add-TestResult "EntryPoint" "PASS" "Complete discovery algorithm found"
            Write-Host "PASS: Discovery algorithm with project inference" -ForegroundColor Green
        }
        else {
            Add-TestResult "EntryPoint" "FAIL" "Missing discovery components"
            Write-Host "FAIL: Missing discovery or inference capabilities" -ForegroundColor Red
        }
    }
    else {
        Add-TestResult "EntryPoint" "FAIL" "No entry point file found"
        Write-Host "FAIL: No entry point file found" -ForegroundColor Red
    }
}

function Test-DiscoveryAlgorithm {
    Write-Host "TEST 3: Discovery Algorithm Completeness" -ForegroundColor Yellow
    
    if (Test-Path "copilot-entry-point.md") {
        $content = Get-Content "copilot-entry-point.md" -Raw
        $hasTechDiscovery = $content -match 'tech-specific'
        $hasProjectDiscovery = $content -match 'project-specific'
        $hasTemplateDiscovery = $content -match 'templates'
        
        if ($hasTechDiscovery -and $hasProjectDiscovery -and $hasTemplateDiscovery) {
            Add-TestResult "Discovery" "PASS" "Complete discovery algorithm"
            Write-Host "PASS: Complete discovery algorithm" -ForegroundColor Green
        }
        else {
            Add-TestResult "Discovery" "FAIL" "Incomplete discovery algorithm"
            Write-Host "FAIL: Incomplete discovery algorithm" -ForegroundColor Red
        }
    }
    else {
        Add-TestResult "Discovery" "FAIL" "No discovery algorithm found"
        Write-Host "FAIL: No discovery algorithm found" -ForegroundColor Red
    }
}

function Test-WorkflowTemplates {
    Write-Host "TEST 4: Workflow Template System" -ForegroundColor Yellow
    
    $hasSessionTemplate = Test-Path "templates\ai-session-template.md"
    $hasBranchTemplate = Test-Path "templates\feature-branch-template.md"
    
    if ($hasSessionTemplate -and $hasBranchTemplate) {
        Add-TestResult "Templates" "PASS" "Complete workflow template system"
        Write-Host "PASS: Complete workflow template system" -ForegroundColor Green
    }
    else {
        Add-TestResult "Templates" "FAIL" "Missing workflow templates"
        Write-Host "FAIL: Missing workflow templates" -ForegroundColor Red
        if (-not $hasSessionTemplate) { Write-Host "   Missing: ai-session-template.md" -ForegroundColor Red }
        if (-not $hasBranchTemplate) { Write-Host "   Missing: feature-branch-template.md" -ForegroundColor Red }
    }
}

function Test-ProjectSpecificIsolation {
    Write-Host "TEST 5: Project-Specific Content Isolation" -ForegroundColor Yellow
    
    if (Test-Path "project-specific") {
        $projectFiles = Get-ChildItem "project-specific\*.md"
        
        if ($projectFiles.Count -gt 0) {
            Add-TestResult "ProjectFile" "PASS" "Project-specific files properly isolated"
            Write-Host "PASS: Project-specific files properly isolated" -ForegroundColor Green
        }
        else {
            Add-TestResult "ProjectFile" "FAIL" "No project-specific files found"
            Write-Host "FAIL: No project-specific files found" -ForegroundColor Red
        }
    }
    else {
        Add-TestResult "ProjectFile" "FAIL" "project-specific directory not found"
        Write-Host "FAIL: project-specific directory not found" -ForegroundColor Red
    }
}

function Test-SchemaSupport {
    Write-Host "TEST 6: Schema Validation Support" -ForegroundColor Yellow
    
    if (Test-Path "../schemas/instruction-schema.json") {
        $schema = Get-Content "../schemas/instruction-schema.json" -Raw
        $hasWorkflowSupport = $schema -match 'workflow-template'
        $hasRoleSupport = $schema -match 'session-structure|branch-workflow'
        
        if ($hasWorkflowSupport -and $hasRoleSupport) {
            Add-TestResult "Schema" "PASS" "Schema supports enhanced structure"
            Write-Host "PASS: Schema supports enhanced structure" -ForegroundColor Green
        }
        else {
            Add-TestResult "Schema" "FAIL" "Schema missing enhanced features"
            Write-Host "FAIL: Schema missing enhanced structure support" -ForegroundColor Red
        }
    }
    else {
        Add-TestResult "Schema" "FAIL" "No schema file found"
        Write-Host "FAIL: No schema file found" -ForegroundColor Red
    }
}

# Main execution
Write-Host "RUNNING ALL PORTABILITY TESTS..." -ForegroundColor Cyan
Write-Host ""

# Change to instructions directory if not already there
$currentDir = Get-Location
if ($currentDir.Path -notlike "*\.github\instructions*") {
    $instructionsDir = Join-Path $PSScriptRoot "."
    if (Test-Path $instructionsDir) {
        Set-Location $instructionsDir
    }
}

# Run all tests
Test-GenericFiles
Test-EntryPoint  
Test-DiscoveryAlgorithm
Test-WorkflowTemplates
Test-ProjectSpecificIsolation
Test-SchemaSupport

# Summary
Write-Host ""
Write-Host "PORTABILITY TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passCount = ($script:testResults | Where-Object Status -eq "PASS").Count
$failCount = ($script:testResults | Where-Object Status -eq "FAIL").Count

$script:testResults | ForEach-Object {
    $color = if ($_.Status -eq "PASS") { "Green" } else { "Red" }
    $icon = if ($_.Status -eq "PASS") { "+" } else { "-" }
    Write-Host "$icon $($_.Status): $($_.Message)" -ForegroundColor $color
    
    if ($_.Details -and $Verbose) {
        $_.Details | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
    }
}

Write-Host ""
Write-Host "Results: $passCount passed, $failCount failed" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Yellow" })

if ($failCount -gt 0) {
    Write-Host ""
    Write-Host "PORTABILITY VIOLATIONS DETECTED!" -ForegroundColor Red
    Write-Host "The instruction system is NOT ready for reuse in other projects." -ForegroundColor Red
    Write-Host "Fix the violations above before copying to other repositories." -ForegroundColor Red
    
    # Restore original directory
    Set-Location $currentDir
    exit 1
}
else {
    Write-Host ""
    Write-Host "PORTABILITY VALIDATED!" -ForegroundColor Green
    Write-Host "The instruction system is ready for reuse in other projects." -ForegroundColor Green
    
    # Restore original directory
    Set-Location $currentDir
    exit 0
}