---
ai_context:
  type: instruction-index
  role: discovery-hub
  scope: meta
  format_version: "2.0"
---

# AI Instruction System

## Quick Discovery Guide

### For AI Assistants
1. **Start Here**: `copilot-entry-point.md` - Main AI guidance entry point
2. **Technology Context**: `tech-specific/[technology].md` - Technology-specific patterns
3. **Project Context**: `project-specific/[project-name].md` - Domain-specific details
4. **Validation**: `../schemas/instruction-schema.json` - Structure validation

### File Organization

```
.github/instructions/
├── README.md                       # This discovery guide
├── copilot-entry-point.md          # AI entry point with frontmatter
├── Test-InstructionPortability.ps1 # Portability validation test
├── tech-specific/                  # Technology-specific instructions
│   ├── javascript.md              # JavaScript patterns and conventions
│   ├── html-web.md                # HTML, CSS, PWA integration
│   ├── pwa-webrtc.md              # PWA and P2P networking patterns
│   ├── canvas-wasm.md             # Canvas graphics and WebAssembly
│   ├── browser-testing.md         # Browser-native testing patterns
│   └── ai-documentation.md        # AI-assisted documentation patterns
├── project-specific/               # Project-specific context
│   └── drazzan-invasion.md        # Game mechanics and debug commands
├── templates/                      # AI workflow templates
│   ├── ai-session-template.md     # Development session structure
│   └── feature-branch-template.md # Branch workflow patterns
└── schemas/                        # Validation and structure
    └── instruction-schema.json     # Structure validation schema
```

## AI Context Discovery Algorithm

### Automatic Project Detection
```javascript
function discoverProjectContext(repositoryPath) {
    // 1. Extract project name from repository
    const projectName = path.basename(repositoryPath)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
    
    // 2. Look for project-specific instructions
    const projectFile = `instructions/project-specific/${projectName}.md`;
    
    // 3. Fallback: search for any project-specific file
    if (!exists(projectFile)) {
        return findProjectSpecificFile();
    }
    
    return projectFile;
}
```

### Content Structure
All instruction files use consistent AI-structured sections:

- `@AI-SECTION: [name]` - Major content sections for AI parsing
- `<!-- AI-CONTEXT: [type] -->` - Context hints for AI tools
- `frontmatter` - Machine-readable metadata
- Structured headers for easy navigation

## Migration from Legacy Structure

### Old Structure (Deprecated)
```
.github/
├── copilot-instructions.md      # Monolithic file
├── testing-instructions.md     # Mixed generic/specific
├── css-instructions.md          # Technology-specific
└── [project]-instructions.md    # Project-specific
```

### New Structure (Enhanced)
```
.github/
├── instructions/
│   ├── copilot-entry-point.md  # AI entry with metadata
│   ├── tech-specific/           # Organized by technology
│   └── project-specific/        # Clear project separation
└── schemas/                     # Validation and structure
```

### Benefits of New Structure
- **Better Organization**: Clear separation of concerns
- **AI Optimization**: Structured sections and metadata for parsing
- **Scalability**: Easy to add new technologies or projects
- **Discovery**: Algorithmic file discovery patterns
- **Validation**: Schema-based structure validation
- **Maintenance**: Modular updates and improvements
- **Template System**: Reusable workflow patterns for AI development
- **Separation Enforcement**: Clear rules preventing content mixing

### Portability Validation
The instruction system includes automated portability testing:

```powershell
# Run from .github/ directory
.\instructions\Test-InstructionPortability.ps1

# Verbose output with detailed results
.\instructions\Test-InstructionPortability.ps1 -Verbose

# Exit codes: 0 = portable, 1 = violations found
```

**Tests Performed**:
- ✅ Generic files contain no project-specific terminology
- ✅ Entry point uses inference patterns instead of hardcoded references  
- ✅ Discovery algorithm properly implemented
- ✅ Workflow templates are reusable across projects
- ✅ Project-specific content is properly isolated
- ✅ Schema supports enhanced structure

### Coverage of Legacy Instructions
The enhanced system covers all aspects of the original instruction system:

#### ✅ Migrated Content
- **Technology Patterns**: All JavaScript, CSS, HTML, PWA patterns preserved and enhanced
- **Project Context**: Game mechanics, debug commands, testing procedures
- **Development Workflows**: AI-assisted development patterns and git workflows
- **Architecture Decisions**: Host-authoritative multiplayer, P2P networking
- **Performance Patterns**: 60 FPS targeting, memory management, optimization
- **Debugging Tools**: Debug console commands, testing procedures, validation

#### ✅ New Enhancements
- **Structured Metadata**: YAML frontmatter for machine-readable context
- **AI Section Markers**: @AI-SECTION: organization for better parsing
- **Template System**: Reusable workflow patterns for development sessions
- **Separation Rules**: Clear enforcement of generic vs project-specific content
- **Validation Schema**: Structure validation for all instruction files
- **Discovery Algorithm**: Automated context loading based on project detection

---

**🤖 AI Usage**: Start with `copilot-entry-point.md` and follow the discovery patterns to find relevant context for your development task.