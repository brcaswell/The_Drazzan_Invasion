# AI Instruction System - Portability Testing

## Quick Test Command
```powershell
# Run portability test suite
.\.github\Test-InstructionPortability.ps1

# Run with detailed output
.\.github\Test-InstructionPortability.ps1 -Verbose
```

## What This Tests

### ✅ Portability Requirements
- **Generic files**: No hardcoded project-specific terms or references
- **Discovery algorithm**: Uses inference patterns instead of hardcoded values
- **Schema support**: Enhanced structure elements are properly defined
- **Project isolation**: Domain-specific content is properly separated
- **File structure**: All required directories and files exist
- **Cross-references**: File references match actual files

### 🔍 Validation Patterns
The test suite automatically detects:
- Project-specific terminology in generic files (`drazzan`, `invasion`, `spaceship`, etc.)
- Hardcoded project names instead of inference patterns
- Missing schema support for workflow templates
- Incomplete file structure
- Broken cross-references between instruction files

### 📋 Test Categories

#### File Structure Integrity
- Verifies all required directories exist
- Checks for required core files
- Validates organizational structure

#### Generic Files Portability  
- Scans tech-specific files for project terms
- Validates entry point file is generic
- Ensures template files are reusable

#### Discovery Algorithm Validation
- Confirms inference functions are present
- Checks for placeholder patterns
- Validates dynamic project name resolution

#### Schema Support Validation
- Verifies workflow-template support
- Checks for enhanced structure elements
- Validates schema completeness

#### Project-Specific Content Isolation
- Confirms project-specific directory exists
- Validates domain content is properly contained
- Ensures appropriate content separation

#### Cross-Reference Validation
- Matches file references to actual files
- Identifies missing or extra files
- Validates documentation accuracy

## Expected Output

### ✅ Successful Test Run
```
=== AI INSTRUCTION SYSTEM PORTABILITY TEST SUITE ===

📋 File Structure Integrity
✅ PASS: All required directories exist
✅ PASS: All required files exist

📋 Generic Files Portability
✅ PASS: Tech-specific file 'javascript.md' is generic
✅ PASS: Tech-specific file 'html-web.md' is generic
✅ PASS: Tech-specific file 'pwa-webrtc.md' is generic
✅ PASS: Tech-specific file 'canvas-wasm.md' is generic
✅ PASS: Entry point file 'copilot-entry-point.md' is generic
✅ PASS: Template file 'ai-session-template.md' is generic
✅ PASS: Template file 'feature-branch-template.md' is generic

📋 Discovery Algorithm Validation
✅ PASS: Discovery algorithm uses inference patterns
✅ PASS: Uses placeholder patterns instead of hardcoded names

📋 Schema Support Validation  
✅ PASS: Schema supports all enhanced structure elements

📋 Project-Specific Content Isolation
✅ PASS: Project-specific directory exists with 1 file(s)
✅ PASS: Project file 'drazzan-invasion.md' contains appropriate domain content

📋 Cross-Reference Validation
✅ PASS: Cross-references match actual files

=== TEST RESULTS SUMMARY ===

📊 Total Tests: 12
✅ Passed: 12
❌ Failed: 0

🎉 ALL TESTS PASSED - Instruction system is portable!
```

### ❌ Failed Test Example
```
❌ FAIL: Template file 'ai-session-template.md' contains project-specific terms
   Found 'drazzan'
   Found 'spaceship'

⚠️  PORTABILITY VIOLATIONS DETECTED

🔧 Required Actions:
   • Remove project-specific terms from template files
   • Templates must be generic and reusable across projects
```

## Integration with Development Workflow

### Pre-Commit Validation
Add to your development workflow:
```powershell
# Before committing instruction changes
.\.github\Test-InstructionPortability.ps1
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Fix portability violations before committing" -ForegroundColor Red
    exit 1 
}
```

### Continuous Integration
For automated validation in CI/CD:
```yaml
# .github/workflows/validate-instructions.yml
- name: Test Instruction Portability
  run: .\.github\Test-InstructionPortability.ps1
```

### Manual Validation
Run periodically during development:
- After adding new instruction content
- Before copying instructions to other projects  
- When restructuring instruction files
- As part of code review process

---

**💡 Purpose**: This testing ensures the AI instruction system can be copied to any browser-native project and work immediately with only a single project-specific file addition.