---
ai_context:
  type: workflow-template
  role: session-structure
  scope: generic
  categories: [ai-workflow, development-session, documentation]
  format_version: "2.0"
last_updated: "2025-11-23"
---

<!-- AI-CONTEXT: ai-session-workflow -->
<!-- SCOPE: generic -->

# AI Development Session Template

## @AI-SECTION: session-initialization

### Session Startup Checklist
```markdown
## Session Context Discovery
- [ ] Repository: [repository-name]
- [ ] Current Branch: [branch-name]  
- [ ] Feature Focus: [brief-description]
- [ ] Last Session: [previous-session-summary]
- [ ] Modified Files: [files-changed-since-last-session]

## AI Instruction Loading
- [ ] Entry Point: `.github/instructions/copilot-entry-point.md`
- [ ] Technology Context: [list-tech-files-loaded]
- [ ] Project Context: [project-specific-file-loaded]
- [ ] Validation: Schema validation passed

## Session Objectives
- [ ] Primary Goal: [main-objective]
- [ ] Secondary Goals: [supporting-objectives]
- [ ] Success Criteria: [how-to-measure-completion]
- [ ] Time Constraints: [estimated-duration]
```

### Context Validation Pattern
```javascript
// Pre-session validation checklist
const sessionContext = {
    // Verify instruction system integrity
    instructionsLoaded: checkInstructionSystemIntegrity(),
    
    // Understand current development state
    workingDirectory: getCurrentWorkingDirectory(),
    gitBranch: getCurrentBranch(),
    modifiedFiles: getUnstagedChanges(),
    
    // Load appropriate instruction contexts
    technologyInstructions: loadTechnologyContext(),
    projectInstructions: loadProjectContext(),
    
    // Establish session goals
    sessionObjectives: defineSessionObjectives(),
    successCriteria: defineSuccessCriteria()
};
```

## @AI-SECTION: work-patterns

### Feature Development Workflow
```markdown
## Feature Branch Context
1. **Branch Analysis**: Understand feature scope from branch name
2. **File Scope**: Identify files relevant to current feature
3. **Integration Points**: Map connections to existing systems
4. **Documentation**: Plan updates to docs, README, instructions
5. **Testing Strategy**: Define appropriate testing approach

## Task Breakdown Pattern
### Large Tasks → Smaller Tasks
- Break complex features into implementable chunks
- Each chunk should be testable independently  
- Maintain clear dependency relationships
- Document decision points and alternatives considered

### Implementation Order
1. **Core Functionality**: Implement basic feature mechanics
2. **Error Handling**: Add robust error handling and fallbacks
3. **Integration**: Connect to existing systems
4. **Polish**: UI/UX improvements and optimization
5. **Documentation**: Update all relevant documentation
```

### Code Quality Patterns
```markdown
## Before Making Changes
- [ ] Read existing code to understand patterns
- [ ] Identify integration points and dependencies
- [ ] Plan changes to minimize risk of breaking existing functionality
- [ ] Consider performance implications

## During Implementation  
- [ ] Follow established code style and naming conventions
- [ ] Add appropriate error handling and fallbacks
- [ ] Include meaningful comments for complex logic
- [ ] Test changes incrementally as they're implemented

## After Implementation
- [ ] Test all affected functionality
- [ ] Update relevant documentation
- [ ] Stage only files modified in current session
- [ ] Write clear commit messages describing changes
```

## @AI-SECTION: instruction-separation

### Generic vs Project-Specific Separation
```markdown
## Generic Instructions (tech-specific/*.md)
- **Technology patterns** that apply to any project using that technology
- **Reusable code patterns** that work across different applications
- **Best practices** that are technology-specific, not project-specific
- **Anti-patterns** that are universally problematic

### ✅ Good Generic Content
- JavaScript ES6+ module patterns
- Canvas rendering optimization techniques  
- WebRTC connection management patterns
- PWA offline-first architecture

### ❌ Don't Include in Generic
- Specific debug commands for a particular application
- Game-specific mechanics or business logic
- Project-specific file structure details
- Domain-specific terminology or concepts

## Project-Specific Instructions (project-specific/*.md)
- **Domain concepts** specific to the application/game/business
- **Debug commands** and testing procedures  
- **Application-specific workflows** and patterns
- **Project file structure** and organization

### ✅ Good Project-Specific Content
- Debug console commands for the application
- Application mechanics like user interactions and system behaviors
- Specific asset files and their purposes
- Application-specific testing procedures

### ❌ Don't Include in Project-Specific
- Generic JavaScript patterns that work anywhere
- Technology setup instructions 
- General web development best practices
- Patterns that could be reused in other projects
```

### Enforcement Mechanisms
```markdown
## Content Review Checklist
### For tech-specific/*.md files:
- [ ] Would this pattern work in other projects using this technology?
- [ ] Does this avoid project-specific terminology?
- [ ] Are examples generic enough to be educational?
- [ ] Could another developer use this in a different project?

### For project-specific/*.md files:
- [ ] Is this specific to this application/domain?
- [ ] Does this require knowledge of the project to understand?
- [ ] Would this be irrelevant to developers of other projects?
- [ ] Does this include application-specific commands/procedures?

## Cross-Reference Guidelines
- tech-specific files can reference other tech-specific files
- project-specific files can reference tech-specific files
- tech-specific files should NOT reference project-specific files
- Use `🔗 Related:` sections for appropriate cross-references
```

## @AI-SECTION: session-documentation

### Decision Documentation Pattern
```markdown
## Architectural Decisions Log
### Decision: [brief-decision-title]
- **Context**: What situation led to this decision?
- **AI Input**: What did AI tools suggest?
- **Human Input**: What did human developer decide? 
- **Alternatives**: What other approaches were considered?
- **Rationale**: Why was this approach chosen?
- **Impact**: How does this affect existing/future systems?
- **Validation**: How will we know if this decision was good?

### Implementation Notes
- **Unexpected Challenges**: Issues that arose during implementation
- **Workarounds**: Temporary solutions and why they were needed
- **Performance Notes**: Observed performance characteristics
- **Integration Issues**: Problems connecting to existing systems
```

### Session Completion Template
```markdown
## Session Summary
- **Objectives Met**: [list-completed-objectives]
- **Partial Progress**: [work-started-but-not-finished]  
- **Blocked Items**: [issues-preventing-progress]
- **Next Session**: [recommended-next-steps]

## Files Modified
- **Created**: [new-files-created]
- **Modified**: [existing-files-changed]
- **Staged**: [files-ready-for-commit]
- **Unstaged**: [modified-but-not-staged]

## Knowledge Gained
- **Technical Insights**: [new-technical-understanding]
- **Process Improvements**: [workflow-optimizations-discovered]
- **Documentation Updates**: [instruction-improvements-needed]
- **Tool Usage**: [effective-ai-tool-patterns-discovered]
```

## @AI-SECTION: quality-assurance

### Pre-Commit Validation
```markdown
## Code Quality Checklist
- [ ] All modified files follow established patterns
- [ ] No hardcoded values that should be configurable
- [ ] Error handling appropriate for context
- [ ] Performance considerations addressed
- [ ] Integration points tested

## Documentation Quality
- [ ] All new features documented appropriately
- [ ] Instruction files updated if patterns changed
- [ ] README updated if user-facing changes made
- [ ] Session notes capture important decisions

## Git Hygiene  
- [ ] Only stage files modified in current session
- [ ] Commit message clearly describes changes
- [ ] No unintended files included in commit
- [ ] Branch is appropriate for the type of changes
```

### Instruction System Integrity
```markdown
## Instruction Validation
- [ ] New patterns added to appropriate instruction files
- [ ] Generic patterns remain generic (no project-specific content)
- [ ] Project-specific patterns remain project-specific
- [ ] Cross-references are accurate and helpful
- [ ] YAML frontmatter is valid and complete
- [ ] @AI-SECTION markers are properly structured

## Discoverability
- [ ] New instruction files added to discovery algorithm
- [ ] README.md file organization updated if structure changed  
- [ ] copilot-entry-point.md references are current
- [ ] Schema validation passes for all instruction files
```

---

**🔗 Related**: See `feature-branch-template.md` for branch-specific workflows, `copilot-entry-point.md` for instruction system overview, and project-specific instructions for application-specific workflows.