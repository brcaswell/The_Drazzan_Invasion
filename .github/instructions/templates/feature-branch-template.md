---
ai_context:
  type: workflow-template
  role: branch-workflow
  scope: generic
  categories: [git-workflow, feature-development, ai-workflow]
  format_version: "2.0"
last_updated: "2025-11-23"
---

<!-- AI-CONTEXT: feature-branch-workflow -->
<!-- SCOPE: generic -->

# Feature Branch Workflow Template

## @AI-SECTION: branch-analysis

### Branch Name Context Extraction
```javascript
// Extract context from branch names
function analyzeBranchContext(branchName) {
    const patterns = {
        feature: /^feature\/(.+)/,
        bugfix: /^(bugfix|fix)\/(.+)/,
        hotfix: /^hotfix\/(.+)/,
        refactor: /^refactor\/(.+)/,
        docs: /^docs\/(.+)/,
        chore: /^chore\/(.+)/
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
        const match = branchName.match(pattern);
        if (match) {
            return {
                type: type,
                scope: match[1].replace(/-/g, ' '),
                workArea: inferWorkArea(match[1])
            };
        }
    }
    
    return { type: 'unknown', scope: branchName };
}

// Current branch: feature/multiplayer-foundation-pwa
// Extracted context: { type: 'feature', scope: 'multiplayer foundation pwa', workArea: ['multiplayer', 'pwa'] }
```

### Branch-Specific File Scoping
```markdown
## Feature Branch: `feature/multiplayer-foundation-pwa`
### Expected Work Areas
- **Primary**: `client/js/pwa/` - Multiplayer system implementation
- **Secondary**: `docs/` - Architecture documentation updates
- **Integration**: `client/js/` - Integration with existing single-player systems
- **Configuration**: `.github/` - AI instruction updates for new patterns

### Files Likely to be Modified
- `client/js/pwa/game-mode-manager.js` - Mode selection and management
- `client/js/pwa/webrtc-manager.js` - P2P networking implementation  
- `client/js/pwa/lobby-manager.js` - Multiplayer lobby functionality
- `docs/multiplayer-architecture.md` - System documentation
- `.github/instructions/` - Updated AI instruction patterns
```

## @AI-SECTION: development-stages

### Feature Development Lifecycle
```markdown
## Stage 1: Foundation Setup
### Objectives
- Create basic infrastructure for the feature
- Establish interfaces and data structures
- Set up placeholder implementations

### AI Focus Areas
- Follow established architectural patterns
- Create proper separation of concerns
- Plan integration with existing systems
- Document new patterns as they emerge

### Validation Criteria
- [ ] Basic structure compiles/loads without errors
- [ ] Integration points defined and stubbed
- [ ] Core data structures established
- [ ] Initial tests or debug access implemented

## Stage 2: Core Implementation  
### Objectives
- Implement primary feature functionality
- Handle normal use cases and workflows
- Create basic user interface elements

### AI Focus Areas
- Implement robust error handling
- Follow performance best practices
- Maintain consistency with existing code style
- Create meaningful user feedback mechanisms

### Validation Criteria
- [ ] Primary use cases work end-to-end
- [ ] Error conditions handled gracefully
- [ ] Performance meets acceptable standards
- [ ] UI/UX follows established patterns

## Stage 3: Integration & Polish
### Objectives  
- Connect feature to existing systems
- Handle edge cases and error conditions
- Optimize performance and user experience
- Complete documentation and testing

### AI Focus Areas
- Ensure backward compatibility
- Optimize for production use
- Update all relevant documentation
- Create comprehensive testing procedures

### Validation Criteria
- [ ] Full integration with existing systems
- [ ] Edge cases and errors handled properly
- [ ] Documentation complete and accurate
- [ ] Ready for code review and merge
```

## @AI-SECTION: git-workflow-patterns

### Feature Branch Best Practices
```bash
# Branch Creation and Context
git checkout -b feature/descriptive-feature-name

# Regular Development Workflow
git add [specific-files-only]              # Never use `git add .`
git commit -m "Clear description of changes"
git push origin feature/feature-name

# Pre-Merge Preparation
git rebase main                            # Update with latest main
git push --force-with-lease origin feature/feature-name
```

### Commit Message Patterns
```markdown
## Commit Message Structure
```
[type]: [clear description of changes]

[optional body explaining why changes were made]

[optional footer with breaking changes or issue references]
```

### Commit Types
- **feat**: New feature implementation
- **fix**: Bug fix or correction
- **docs**: Documentation updates only
- **style**: Code style changes (no functional changes)
- **refactor**: Code structure improvements (no functional changes)
- **perf**: Performance optimizations
- **test**: Adding or updating tests
- **chore**: Build process or tool changes

### Examples
```
feat: implement WebRTC connection manager for multiplayer

- Add peer connection establishment and management
- Implement data channel creation and message handling
- Include connection state monitoring and recovery
- Provide fallback to single-player on connection failure

Closes #123
```
```

## @AI-SECTION: session-scoping

### Work Session Focus
```markdown
## Session Boundaries
### Single Session Scope (2-4 hours)
- Implement one complete user story or use case
- Focus on files directly related to current objective
- Complete documentation updates for implemented features
- Test implemented functionality thoroughly

### Multi-Session Features
- Break large features into logical session-sized chunks
- Each session should leave the system in a working state
- Document progress and next steps between sessions
- Plan integration points early in the process

## Context Preservation Between Sessions
### Session Handoff Documentation
```markdown
## Session [N] → Session [N+1] Handoff

### Completed This Session
- [specific-achievements-with-file-references]

### In Progress (Partial)
- [work-started-but-not-complete-with-context]

### Next Session Priorities
1. [highest-priority-next-step]
2. [secondary-priorities]
3. [stretch-goals-if-time-permits]

### Context Notes
- [important-context-that-might-be-forgotten]
- [architectural-decisions-made-this-session]
- [integration-challenges-discovered]
```
```

### File Staging Strategy
```bash
# Good: Surgical staging of session-specific changes
git add client/js/pwa/game-mode-manager.js     # New feature implementation
git add docs/multiplayer-architecture.md        # Related documentation
git add .github/instructions/project-specific/[project-name].md  # Updated debug commands

# Avoid: Broad staging that includes unrelated changes  
# git add .                                     # Too broad
# git add client/                               # Includes unmodified files
# git add client/js/                            # May include unrelated changes
```

## @AI-SECTION: integration-patterns

### Connecting New Features to Existing Systems
```markdown
## Integration Checkpoint Pattern
### Before Integration
- [ ] Understand existing system interfaces
- [ ] Identify all integration points
- [ ] Plan backwards compatibility approach
- [ ] Create integration tests/validation

### During Integration
- [ ] Make minimal changes to existing working code
- [ ] Add new functionality without breaking existing features
- [ ] Provide graceful fallbacks for unsupported scenarios
- [ ] Maintain performance characteristics

### After Integration
- [ ] Test all affected workflows end-to-end
- [ ] Verify existing functionality still works
- [ ] Update documentation for new integration points
- [ ] Create examples of new capabilities
```

### Legacy System Compatibility
```javascript
// Pattern: Preserve existing functionality while adding new capabilities
class ExistingSystem {
    // Original functionality preserved
    originalMethod() {
        // Keep existing implementation unchanged
        return this.legacyImplementation();
    }
    
    // New functionality added alongside
    enhancedMethod(options = {}) {
        // Check for new capabilities
        if (options.useNewFeature && this.newFeatureAvailable()) {
            return this.newImplementation(options);
        }
        
        // Fall back to original behavior
        return this.originalMethod();
    }
}
```

## @AI-SECTION: documentation-updates

### Documentation Maintenance During Development
```markdown
## Documentation Update Strategy
### Real-Time Documentation  
- Update instruction files as new patterns emerge
- Document architectural decisions when they're made
- Capture debugging procedures as they're developed
- Record integration challenges and solutions immediately

### End-of-Session Documentation
- Update project README if user-facing changes made
- Add new debug commands to project-specific instructions  
- Update architecture docs if system design changed
- Create/update examples demonstrating new functionality

## Instruction File Maintenance
### When to Update Instructions
- **New Patterns Discovered**: Add to appropriate tech-specific file
- **Project-Specific Procedures**: Add to project-specific file
- **Workflow Improvements**: Update templates and process docs
- **Common Pitfalls**: Add to anti-patterns sections

### Maintaining Instruction Quality
- Keep generic instructions generic (reusable across projects)
- Keep project-specific instructions focused on the project domain
- Ensure cross-references between instruction files remain accurate
- Validate YAML frontmatter and @AI-SECTION structure
```

---

**🔗 Related**: See `ai-session-template.md` for session structure, `copilot-entry-point.md` for instruction system overview, and project-specific instructions for application-specific workflows.