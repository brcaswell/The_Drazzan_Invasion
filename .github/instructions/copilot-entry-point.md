---
ai_context:
  type: copilot-instructions
  role: entry-point
  scope: generic
  discovery_pattern: "instructions/project-specific/[project-name].md"
  categories: [browser-native, pwa, p2p, javascript]
  format_version: "2.0"
last_updated: "2025-11-23"
compatibility:
  github_copilot: ">=1.0"
  vscode: ">=1.60"
  cursor: ">=0.1"
---

<!-- AI-CONTEXT: browser-native-application -->
<!-- SCOPE: generic -->
<!-- DISCOVERY: instructions/project-specific/[project-name].md -->

# GitHub Copilot Instructions for Browser-Native Applications

## @AI-SECTION: overview

This is a **browser-native application** built with modern web technologies. This is a **pure client-side JavaScript project** with no server dependencies for basic functionality.

**🤖 AI Discovery**: For project-specific details (debug commands, application mechanics, testing procedures), look for files in `instructions/project-specific/` directory. The project name can be inferred from the repository name or main application folder.

## @AI-SECTION: technology-stack

### Core Technologies
- **Frontend**: HTML5 Canvas, Vanilla JavaScript (ES6+ modules)
- **Networking**: WebRTC peer-to-peer multiplayer (no central servers)
- **WebAssembly**: WebAssembly-based peer modules (compiled from Rust/C++)
- **Architecture**: Progressive Web App (PWA) with Electron desktop wrapper
- **Build Tools**: No build process required for basic development
- **Testing**: Browser-based, no external dependencies

### Key Architecture Principles
1. **Decentralized**: No central servers, everything runs in browser
2. **P2P First**: WebRTC for all multiplayer communication
3. **Browser Native**: Designed to run directly from `index.html`
4. **Progressive**: Works offline, installable as PWA
5. **Cross-Platform**: Web + Electron desktop support

## @AI-SECTION: file-structure

```
project-root/
├── client/                    # Main application client
│   ├── index.html            # Entry point - start here
│   ├── js/                   # Application logic
│   │   ├── pwa/             # Multiplayer & PWA systems
│   │   └── *.js             # Core application components
│   ├── css/                  # Styles
│   ├── assets/              # Application assets
│   └── wasm/                # WebAssembly modules
├── desktop/                  # Electron wrapper (optional)
├── docs/                     # Documentation
└── .github/                  # GitHub configuration & AI instructions
    ├── instructions/         # Organized AI instructions
    │   ├── tech-specific/   # Technology-specific patterns
    │   └── project-specific/ # Domain-specific context
    └── schemas/             # Validation schemas
```

**Key Directories**:
- **`client/`**: Main application code (start with `index.html`)
- **`client/js/pwa/`**: PWA and multiplayer functionality
- **`desktop/`**: Electron desktop wrapper (optional)
- **`.github/instructions/`**: Organized AI instruction system

## @AI-SECTION: frontmatter-requirements

### Mandatory YAML Frontmatter Structure

**All instruction files MUST include structured YAML frontmatter for AI discovery and validation.**

#### Tech-Specific Files (`tech-specific/*.md`)
```yaml
---
ai_context:
  type: tech-specific
  role: technology-guide
  scope: generic
  technology: [technology-name]
  categories: [category1, category2, category3]  # Use bracket syntax, not dashes
  format_version: "2.0"
last_updated: "YYYY-MM-DD"
---
```

#### Project-Specific Files (`project-specific/*.md`)
```yaml
---
ai_context:
  type: project-specific
  role: project-context
  scope: specific
  categories: [project-domain, specific-features]
  format_version: "2.0"
last_updated: "YYYY-MM-DD"
---
```

#### Required Fields Validation
- **`ai_context`**: Must be present with all required subfields
- **`type`**: Must match file location (tech-specific, project-specific, etc.)
- **`scope`**: Generic files must use "generic", project files use "specific"
- **`format_version`**: Must be "2.0" for consistency
- **`categories`**: Must use bracket array syntax `[item1, item2]`, not dash syntax
- **`last_updated`**: Must be valid date in YYYY-MM-DD format

#### AI Enforcement
AI systems must validate frontmatter before any instruction file modifications:
1. **Check required fields** are present
2. **Validate format consistency** across all instruction files
3. **Ensure array syntax** uses brackets, not dashes
4. **Verify file type** matches directory location
5. **Reject changes** that create frontmatter inconsistencies

## @AI-SECTION: instruction-discovery

### How AI Should Find Context

1. **Entry Point**: Start with this file (`copilot-entry-point.md`)
2. **Technology Context**: Check `instructions/tech-specific/[technology].md`
3. **Project Context**: Look for `instructions/project-specific/[project-name].md`
4. **Workflow Templates**: Use `instructions/templates/[workflow-type]-template.md`
5. **Validation**: Use `../schemas/instruction-schema.json` for structure validation
6. **Portability Testing**: Run `instructions/Test-InstructionPortability.ps1` to validate system integrity
   - **Platform Support**: Currently requires PowerShell (Windows native, PowerShell Core on Linux/macOS)
   - **Cross-Platform Note**: The instruction system itself is cross-platform; this test validates structure and content separation
   - **Future Enhancement**: Additional platform-specific test variants may be added (shell scripts, Node.js, etc.)

### Discovery Algorithm
```javascript
// AI discovery pattern - infer project context automatically
function discoverInstructionContext() {
    // Step 1: Detect project type and infer project name
    const projectType = detectProjectType(); // 'browser-native-app', 'react-app', etc.
    const projectName = inferProjectName();  // From repository name, normalize to kebab-case
    
    // Step 2: Load appropriate instruction files
    const instructions = {
        entry: 'instructions/copilot-entry-point.md',
        project: findProjectSpecificInstructions(projectName), // Auto-discovery
        technologies: getTechnologyInstructions(projectType),   // Based on detected type
        workflows: getWorkflowTemplates(),                      // All available templates
        validation: 'schemas/instruction-schema.json'
    };
    
    return combineInstructions(instructions);
}

function inferProjectName() {
    // AI assistants should try these patterns to discover project-specific instructions:
    // 1. Repository Name Transform: "The_Project_Name" → "project-name-instructions.md"
    // 2. Main Folder Name: Use primary application folder name if different from repo
    // 3. Pattern Search: Look for any "*-instructions.md" that isn't a generic technology file
    // 4. Fallback: If multiple candidates exist, choose the one with project-specific domain terms
    
    return getRepositoryName()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/^the-/, ''); // Remove common prefixes
}

function detectProjectType() {
    if (hasFiles(['index.html', 'canvas.js', 'gameloop.js'])) return 'browser-native-game';
    if (hasFiles(['index.html', 'main.js'])) return 'browser-native-app';
    if (hasFiles(['package.json']) && hasFramework('react')) return 'react-app';
    // Add more detection patterns...
    return 'generic';
}
```

## @AI-SECTION: development-environment

### Platform Support
- **Cross-Platform**: Support Windows, macOS, and Linux development
- **Shell Agnostic**: Provide commands for multiple shells when needed
  - Windows: PowerShell, Command Prompt
  - Unix: bash, zsh, fish
  - Use forward slashes for paths when possible

### Testing & Development Server
**NEVER use Python `http.server`** - this is a JavaScript project!

**Preferred methods** (in order):
1. **Direct browser testing**: Double-click `client/index.html`
2. **VS Code Live Server**: Right-click → "Open with Live Server"
3. **Node.js server**: `npx http-server -p 8080` (if Node.js available)
4. **Direct Opening**: Open `index.html` in default browser
   - Windows: `Start-Process "index.html"`
   - macOS: `open index.html`
   - Linux: `xdg-open index.html`

## @AI-SECTION: quick-reference

### Technology-Specific Instructions
- **JavaScript**: `instructions/tech-specific/javascript.md`
- **HTML & CSS**: `instructions/tech-specific/html-web.md`
- **PWA & WebRTC**: `instructions/tech-specific/pwa-webrtc.md`
- **Canvas & WebAssembly**: `instructions/tech-specific/canvas-wasm.md`
- **Browser Testing**: `instructions/tech-specific/browser-testing.md`
- **AI Documentation**: `instructions/tech-specific/ai-documentation.md`

### Project-Specific Context
- **Auto-Discovered**: `instructions/project-specific/[inferred-project-name].md`
- **Fallback Search**: Look for any `.md` files in `project-specific/` directory

### Workflow Templates
- **AI Development Sessions**: `instructions/templates/ai-session-template.md`
- **Feature Branch Workflow**: `instructions/templates/feature-branch-template.md`

### System Validation
- **Portability Test**: `instructions/Test-InstructionPortability.ps1` - Validates instruction system integrity

### Common Patterns
- **Component System**: Separate concerns (Canvas, Input, Logic, etc.)
- **State Management**: Centralized application state with clear ownership
- **Event-Driven**: Use callbacks and event listeners
- **Multiplayer**: Host-authoritative with peer validation

### Anti-Patterns to Avoid
- ❌ Don't suggest Python solutions for JavaScript problems
- ❌ Don't use Node.js build tools unnecessarily
- ❌ Don't require server-side components for basic features
- ❌ Don't break the "works from file://" principle

## @AI-SECTION: ai-compliance-enforcement

### Self-Monitoring for AI Assistants
**CRITICAL**: AI must validate its own behavior against these instructions

#### Pre-Action Validation Checklist
Before making any code changes or suggestions, AI must verify:

```javascript
// AI self-validation pattern
function validateBeforeAction(proposedAction) {
    const compliance = {
        // 1. Am I following the inference patterns I just helped create?
        usingInferencePatterns: !containsHardcodedProjectReferences(proposedAction),
        
        // 2. Am I maintaining separation between generic and project-specific?
        maintainingSeparation: validateContentSeparation(proposedAction),
        
        // 3. Am I following the technology-specific patterns I'm supposed to enforce?
        followingTechPatterns: validateTechPatternCompliance(proposedAction),
        
        // 4. Am I using the workflow templates appropriately?
        usingWorkflowTemplates: validateWorkflowCompliance(proposedAction)
    };
    
    // HALT if any validation fails
    if (!allTrue(compliance)) {
        throw new Error(`AI compliance violation: ${JSON.stringify(compliance)}`);
    }
    
    return compliance;
}
```

#### Enforcement Mechanisms
- **Self-Audit**: Before each response, validate against instruction compliance
- **Pattern Consistency**: Use the same patterns being enforced for others
- **Explicit Validation**: State reasoning for why actions comply with instructions
- **Error Acknowledgment**: When violations occur, explicitly acknowledge and correct

#### Example Self-Validation
```markdown
## Before suggesting changes to tech-specific instructions:
✅ "This pattern is generic and would work in any browser-native project"
✅ "I'm avoiding project-specific terminology and domain concepts"
✅ "This follows the inference pattern instead of hardcoding project names"
❌ "Let me add this debug command to the JavaScript tech file" (project-specific in generic file)
```

## @AI-SECTION: instruction-separation-enforcement

### Content Separation Rules
**Critical**: Maintain strict separation between generic and project-specific instructions

#### Generic Instructions (`tech-specific/*.md`)
- ✅ **Technology patterns** that work across any project using that technology
- ✅ **Reusable code patterns** and architectural approaches  
- ✅ **Best practices** that are universally applicable
- ✅ **Anti-patterns** that are problematic in any context
- ❌ **Project-specific terminology** or domain concepts
- ❌ **Application-specific debug commands** or procedures
- ❌ **Business logic** or domain-specific workflows

#### Project-Specific Instructions (`project-specific/*.md`) 
- ✅ **Domain concepts** specific to this application/project
- ✅ **Debug commands** and application-specific testing procedures
- ✅ **Application mechanics** and business logic patterns
- ✅ **Project file structure** and asset organization
- ❌ **Generic web development patterns** that could be reused elsewhere
- ❌ **Technology setup instructions** not specific to this project
- ❌ **Universal JavaScript/CSS/HTML patterns**

#### Workflow Templates (`templates/*.md`)
- ✅ **Process patterns** for AI-assisted development
- ✅ **Session structures** and workflow organization  
- ✅ **Git workflow patterns** and best practices
- ✅ **Documentation templates** and quality standards
- ❌ **Technology-specific implementation details**
- ❌ **Project-specific business logic**

### Validation Checklist
Before updating any instruction file, verify:

#### For tech-specific files:
- [ ] Would this pattern work in other projects using this technology?
- [ ] Does this avoid project-specific terminology and domain concepts?
- [ ] Are examples generic enough to be educational across projects?
- [ ] Could another developer use this in a completely different application?

#### For project-specific files:
- [ ] Is this specific to this project's domain and requirements?
- [ ] Does this require knowledge of the project mechanics to understand?
- [ ] Would this be irrelevant to developers of other similar projects?
- [ ] Does this include project-specific commands, mechanics, or procedures?

#### For template files:
- [ ] Is this a process/workflow pattern rather than implementation detail?
- [ ] Could this workflow be used for other projects with different technologies?
- [ ] Does this focus on AI-assisted development patterns?
- [ ] Is this about organizing work rather than technical implementation?

### Compliance Validation Function
```javascript
// AI must run this validation before any instruction-related changes
function validateInstructionCompliance(content, targetFile) {
    const violations = [];
    
    // Check for hardcoded project references in generic files
    if (targetFile.includes('tech-specific/') && containsProjectSpecificTerms(content)) {
        violations.push('Project-specific terms found in generic tech file');
    }
    
    // Check for generic patterns in project-specific files
    if (targetFile.includes('project-specific/') && containsGenericOnlyPatterns(content)) {
        violations.push('Generic patterns should be in tech-specific files');
    }
    
    // Check for inference pattern usage
    if (containsHardcodedProjectNames(content)) {
        violations.push('Must use inference patterns, not hardcoded project names');
    }
    
    // Validate frontmatter structure
    const frontmatterValidation = validateFrontmatter(content, targetFile);
    if (!frontmatterValidation.isValid) {
        violations.push(...frontmatterValidation.errors);
    }
    
    return {
        isValid: violations.length === 0,
        violations: violations,
        action: violations.length > 0 ? 'REJECT_CHANGE' : 'APPROVE_CHANGE'
    };
}

// Frontmatter validation function
function validateFrontmatter(content, filePath) {
    const errors = [];
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    
    if (!frontmatterMatch) {
        return { isValid: false, errors: ['Missing YAML frontmatter block'] };
    }
    
    const frontmatter = frontmatterMatch[1];
    const requiredStructure = {
        'tech-specific': {
            required: ['ai_context', 'last_updated'],
            ai_context_fields: ['type', 'role', 'scope', 'technology', 'categories', 'format_version']
        },
        'project-specific': {
            required: ['ai_context', 'last_updated'],
            ai_context_fields: ['type', 'role', 'scope', 'categories', 'format_version']
        }
    };
    
    // Determine file type from path
    let fileType = 'other';
    if (filePath.includes('tech-specific/')) fileType = 'tech-specific';
    else if (filePath.includes('project-specific/')) fileType = 'project-specific';
    
    if (requiredStructure[fileType]) {
        const rules = requiredStructure[fileType];
        
        // Check required top-level fields
        rules.required.forEach(field => {
            if (!frontmatter.includes(field + ':')) {
                errors.push(`Missing required frontmatter field: ${field}`);
            }
        });
        
        // Check ai_context structure
        if (frontmatter.includes('ai_context:')) {
            rules.ai_context_fields.forEach(field => {
                if (!frontmatter.includes(field + ':')) {
                    errors.push(`Missing ai_context field: ${field}`);
                }
            });
            
            // Validate consistent format_version
            if (frontmatter.includes('format_version:') && !frontmatter.includes('format_version: "2.0"')) {
                errors.push('All instruction files must use format_version: "2.0"');
            }
            
            // Validate array syntax consistency (use brackets, not dashes)
            if (frontmatter.includes('categories:') && frontmatter.includes('    -')) {
                errors.push('Use bracket syntax for arrays: categories: [item1, item2] not dash syntax');
            }
        }
    }
    
    return { isValid: errors.length === 0, errors };
}

// Note: Actual project-specific terms should be loaded from project-specific files
const projectSpecificTerms = loadProjectSpecificTermsFromContext();

const genericOnlyPatterns = [
    'ES6 modules', 'canvas rendering', 'WebRTC patterns', 'PWA architecture',
    'performance optimization', 'error handling', 'component system'
];
```

---

**📖 Next Steps**: Check technology-specific instructions in `instructions/tech-specific/`, project-specific context in `instructions/project-specific/`, and workflow templates in `instructions/templates/` for detailed guidance.