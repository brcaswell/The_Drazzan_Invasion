# Instruction Separation Guide: Generic vs Project-Specific

## Intent & Purpose

This document explains the pattern we developed for separating **reusable AI instruction templates** from **project-specific implementation details**, making GitHub Copilot and AI development assistance both powerful and portable.

## The Problem We Solved

### Initial Issue
AI instruction files became **tightly coupled** to specific projects:
- Hardcoded absolute paths to specific project directories
- Domain-specific terminology in generic architectural patterns
- Project names embedded in reusable framework guidance
- Debug commands tied to specific application mechanics

### Impact
- **Zero Reusability**: Instructions couldn't be copied to other projects
- **Maintenance Burden**: Each project needed complete instruction rewrites
- **Context Pollution**: Generic patterns mixed with domain-specific examples
- **AI Confusion**: Unclear boundaries between framework and application logic

## The Solution: Separation Pattern

### Current File Structure
```
.github/
├── copilot-instructions.md           # Main entry point (legacy)
├── docs-guide.md                     # Documentation organization guide
├── instruction-separation-guide.md   # This guide
├── instructions/                     # Enhanced instruction system
│   ├── copilot-entry-point.md       # New main entry point
│   ├── tech-specific/               # Technology-specific patterns
│   │   ├── javascript.md
│   │   ├── html-web.md
│   │   ├── pwa-webrtc.md
│   │   ├── canvas-wasm.md
│   │   ├── browser-testing.md
│   │   └── ai-documentation.md
│   ├── project-specific/            # Project-specific context
│   │   └── drazzan-invasion.md
│   └── templates/                   # Workflow templates
└── schemas/                         # Validation schemas
```

**File Types**:
- **Legacy Entry Point**: `copilot-instructions.md` - Original AI entry point (being replaced)
- **New Entry Point**: `instructions/copilot-entry-point.md` - Enhanced AI entry with discovery
- **Technology-Specific**: `instructions/tech-specific/*.md` - Reusable patterns organized by technology
- **Project-Specific**: `instructions/project-specific/*.md` - Domain concepts and application details  
- **Guide Documentation**: `*-guide.md` - Educational content for humans (this file)

### Naming Convention
- **Generic Files**: `instructions/tech-specific/[technology].md` (e.g., `html-web.md`)
- **Project-Specific**: `instructions/project-specific/[project-name].md` (manually created based on project)
- **Guide Files**: `[topic]-guide.md` (educational content in `.github/` root)

#### Project Name Inference Guidelines
AI assistants should try these patterns to discover project-specific instructions:
1. **Repository Name Transform**: `The_Project_Name` → `project-name-instructions.md`
2. **Main Folder Name**: Use primary application folder name if different from repo
3. **Pattern Search**: Look for any `*-instructions.md` that isn't a generic technology file
4. **Fallback**: If multiple candidates exist, choose the one with project-specific domain terms

**Example**:
- Repository: `The_Drazzan_Invasion` 
- Expected Patterns: `instructions/project-specific/the-drazzan-invasion.md`, `drazzan-invasion.md`
- Actual File: `instructions/project-specific/drazzan-invasion.md` ✅ (simplified naming)

## What Goes Where

### Generic Instructions (`*-instructions.md`)
✅ **Include**:
- Cross-platform shell commands
- Framework architectural patterns
- Technology-agnostic best practices
- Reusable code templates with placeholders
- Generic file structure patterns
- Universal debugging approaches

❌ **Exclude**:
- Hardcoded file paths
- Domain-specific terminology
- Project-specific asset names
- Application-specific debug commands
- Business logic examples

### Project-Specific Instructions (`[project]-instructions.md`)
✅ **Include**:
- Domain concepts and terminology
- Actual file names and asset references
- Project-specific debug commands
- Application architecture details
- Business logic patterns
- Testing procedures for specific features

❌ **Exclude**:
- Generic framework patterns
- Cross-platform compatibility code
- Technology setup instructions
- Reusable architectural templates

## Reference Pattern

### In Generic Files
```markdown
**Note**: For project-specific details, look for files matching 
`[project-name]-instructions.md` in this directory.
```

### In Project-Specific Files
```markdown
## AI Context Summary
This file contains all **[Project Name]** specific information that should 
be used alongside the generic browser-native application instructions.

### When AI References "Project-Specific Instructions"
Generic instruction files referring to "project-specific instructions" 
mean **this file**.
```

## AI Discovery Pattern

### How AI Assistants Find Project Context
1. **Repository Analysis**: Extract project name from repo URL or folder structure
2. **File Pattern Matching**: Look for `[inferred-name]-instructions.md`
3. **Fallback Search**: Search for files matching `*-instructions.md` pattern
4. **Content Validation**: Verify file contains domain-specific terms (not generic tech patterns)
5. **Context Integration**: Combine generic framework + project-specific domain knowledge

#### Practical Search Strategy
```bash
# List all instruction files
ls .github/*-instructions.md

# Filter out known generic files
exclude: copilot-instructions.md, testing-instructions.md, html-instructions.md, 
         css-instructions.md, javascript-instructions.md, pwa-instructions.md,
         wasm-instructions.md, docs-guide.md, instruction-separation-guide.md

# Result should be project-specific file(s)
```

**PowerShell Example**:
```powershell
Get-ChildItem ".github\*-instructions.md" | Where-Object { 
    $_.Name -notin @("copilot-instructions.md", "testing-instructions.md", 
                     "html-instructions.md", "css-instructions.md", 
                     "javascript-instructions.md", "pwa-instructions.md", 
                     "wasm-instructions.md", "docs-guide.md",
                     "instruction-separation-guide.md") 
}
# Result: project-name-instructions.md
```

### Example AI Workflow
```
Repository: "The_Project_Name"
Step 1: Try "the-project-name-instructions.md" → Not Found
Step 2: Try "project-name-instructions.md" → ✅ Found!  
Step 3: Verify content has domain terms (domain-specific keywords) → ✅ Confirmed
Result: Generic framework + Project-specific domain knowledge
```

## Iteration History: What We Learned

### Phase 1: Initial Cleanup
**Problem**: Hardcoded Windows paths in all instruction files
```markdown
# ❌ Before
d:\specific\project\path\client\index.html

# ✅ After  
project-root/client/index.html
```

### Phase 2: Project Name Generalization
**Problem**: Project names embedded in generic instructions
```markdown
# ❌ Before
[Specific Project Name] uses WebRTC for P2P networking

# ✅ After
Browser-native applications use WebRTC for P2P networking
```

### Phase 3: Domain Concept Extraction
**Problem**: Domain-specific terms in reusable patterns
```markdown
# ❌ Before (in generic CSS instructions)
--domain-entity-color: #00ffff;
--specific-element-color: #ff6b6b;

# ✅ After (in generic CSS instructions)
--primary-entity: #00ffff;
--secondary-entity: #ff6b6b;

# ✅ Moved to project-specific file
--domain-entity-color: #00ffff;    /* Domain-specific element */
--specific-element-color: #ff6b6b;    /* Application-specific component */
```

### Phase 4: Reference Clarity
**Problem**: Vague "project-specific instructions" references
```markdown
# ❌ Before
See project-specific instructions for details

# ✅ After
Look for files matching `[project-name]-instructions.md` in this directory
```

### Phase 5: AI Context Documentation
**Problem**: No guidance for AI assistants on boundary resolution
```markdown
# ✅ Added
### When AI References "Project-Specific Instructions"
Pattern for AI Discovery: Look for files matching `*-instructions.md`
```

## Benefits Achieved

### 🔄 **Reusability**
- Complete `.github/` folder can be copied to any browser-native project
- Only need to create one `[project-name]-instructions.md` file
- All generic patterns work immediately without modification

### 🧠 **AI Clarity**
- Clear separation between framework knowledge and domain knowledge
- Discoverable pattern for project-specific context
- No confusion between generic examples and actual project requirements

### 🛠️ **Maintainability**
- Generic improvements benefit all projects using the framework
- Project-specific changes don't pollute reusable templates
- Clear ownership boundaries for different types of context

### 🚀 **Scalability**
- Pattern works for any domain (games, business apps, utilities)
- Framework grows more valuable with each project that uses it
- Knowledge compounds across project boundaries

## Implementation Checklist

When setting up this pattern for a new project:

- [ ] Copy all generic `*-instructions.md` files to `.github/`
- [ ] Create `[project-name]-instructions.md` with domain-specific content
- [ ] Verify no hardcoded paths in generic files
- [ ] Test AI discovery by asking about "project-specific instructions"
- [ ] Document domain concepts, file names, and debug commands in project file
- [ ] Add AI context summary section to project-specific file

## Success Metrics

A successful separation achieves:
- **Zero** hardcoded references in generic files
- **Complete** domain knowledge in project-specific file  
- **Discoverable** AI pattern for finding project context
- **Portable** generic instructions across projects
- **Maintainable** separation of concerns

## Key Insights From This Iteration

### What We Discovered
1. **AI Context Pollution**: Mixed generic/specific content confused AI assistants about boundaries
2. **Portability Requirements**: Hardcoded paths and project names prevented instruction reuse
3. **Discovery Patterns**: AI assistants need clear, algorithmic ways to find project context
4. **Reference Resolution**: Vague "see project-specific instructions" needed concrete search patterns
5. **Naming Conventions**: Consistent patterns enable reliable automated discovery

### Critical Success Factors
- **Clear Separation**: Never mix framework patterns with domain concepts
- **Discoverable Naming**: Predictable file naming that AI can algorithmically find
- **Complete Context**: Project-specific files must contain ALL domain knowledge
- **Practical Search**: Provide concrete commands/patterns for AI context discovery
- **Meta Documentation**: Document the pattern itself for future maintenance

### Pattern Validation Test
To verify this pattern works in any project:
1. Can you copy `.github/` folder to another browser-native project? ✅
2. Would AI find project context using documented search patterns? ✅  
3. Are generic instructions truly generic (no hardcoded content)? ✅
4. Does project-specific file contain complete domain knowledge? ✅
5. Can new developers understand the separation boundary? ✅

---

This pattern represents a **framework approach to AI-assisted development instructions** - creating reusable knowledge templates while maintaining complete project context through discoverable separation of concerns.