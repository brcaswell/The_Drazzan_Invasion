# AI Development Session Template

## Session Information
- **Date**: [YYYY-MM-DD]
- **Feature/Branch**: [feature/branch-name]
- **Duration**: [Start Time] - [End Time] ([Total Duration])
- **AI Tools Used**: GitHub Copilot, [Other AI Tools]
- **Developer**: [Primary Developer Name]

## Session Objectives
### Primary Goals
- [ ] [Main objective 1]
- [ ] [Main objective 2]
- [ ] [Main objective 3]

### Secondary Goals (if time permits)
- [ ] [Secondary objective 1]
- [ ] [Secondary objective 2]

## Pre-Session Context
### Current Branch Status
```bash
git branch                          # Current branch
git status                          # Working directory status
git log --oneline -5               # Recent commits
```

### Files in Scope
**Expected Modifications:**
- `client/js/[component].js` - [Purpose/Changes]
- `client/css/[styles].css` - [Purpose/Changes]
- `docs/[documentation].md` - [Purpose/Changes]

**Related Dependencies:**
- `[file-name]` - [How it relates]

### Architecture Context
**Current System State:**
- [Brief description of current implementation]

**Target Architecture:**
- [Description of desired end state]

## AI-Human Collaboration Plan

### AI-Led Tasks (High Automation Value)
- [ ] Boilerplate code generation
- [ ] Pattern matching and consistency
- [ ] Documentation structure creation
- [ ] Test case generation
- [ ] Integration point identification

### Human-Led Tasks (Domain Expertise Required)
- [ ] Architectural decisions
- [ ] User experience design
- [ ] Performance optimization
- [ ] Game logic validation
- [ ] Final integration testing

### Collaborative Tasks (AI + Human Review)
- [ ] Component integration
- [ ] Error handling patterns
- [ ] Code review and refinement
- [ ] Documentation enhancement

## Session Progress Log

### [Time] - [Activity Description]
**AI Contribution:**
- [What AI tools generated/suggested]

**Human Decision:**
- [Human choices, modifications, rejections]

**Output:**
- [Files created/modified]
- [Key code segments]

**Issues Encountered:**
- [Any problems or unexpected behavior]

**Resolution:**
- [How issues were resolved]

---

### [Time] - [Next Activity]
[Continue logging pattern above...]

## Session Results

### Completed Objectives
- ✅ [Completed objective with brief description]
- ✅ [Another completed objective]

### Partially Completed
- 🔄 [Partially completed with status/next steps]

### Deferred Tasks
- ⏸️ [Deferred task with reasoning]

### Unexpected Discoveries
- 💡 [New insights or architectural realizations]

## Code Changes Summary

### New Files Created
```bash
[file-path]                         # [Purpose/Description]
[file-path]                         # [Purpose/Description]
```

### Modified Files
```bash
[file-path]                         # [Changes made]
[file-path]                         # [Changes made]
```

### Integration Points
- **[Component A]** ↔ **[Component B]**: [How they integrate]
- **[System X]** ↔ **[System Y]**: [Integration description]

## Testing Results

### AI-Generated Tests
- [Test category]: [Pass/Fail count] - [Brief notes]

### Manual Testing
- [Test type]: [Results and observations]

### Performance Impact
- [Metric]: [Before] → [After]
- [Another metric]: [Measurement]

## Architecture Decisions

### Decision: [Decision Title]
**Context:** [What situation required a decision]

**AI Input:** [What AI tools suggested]

**Options Considered:**
1. [Option 1] - [AI suggested/Human designed] - [Pros/Cons]
2. [Option 2] - [AI suggested/Human designed] - [Pros/Cons]

**Decision Made:** [Chosen option]

**Reasoning:** [Why this option was selected]

**AI Role:** [How AI contributed to the decision]

**Human Override:** [Any AI suggestions rejected and why]

---

### [Additional decisions follow same pattern]

## Git Staging Strategy

### Files to Stage
```bash
# Feature-specific changes
git add client/js/[feature-files]      # Core implementation
git add client/css/[related-styles]    # Styling changes
git add docs/[updated-docs]            # Documentation

# AI instruction updates (if modified)
git add .github/[instruction-files]    # Updated AI context
```

### Commit Message Template
```
[feature]: [concise description of changes]

- AI-generated: [list of AI-created components]
- Human-designed: [list of human-designed elements]
- Integrated: [description of integration work]

Co-authored-by: GitHub-Copilot <copilot@github.com>

Session: [session-date] | Duration: [duration]
Branch: [feature/branch-name]
```

## Next Session Preparation

### Immediate Next Steps
1. [Next task to tackle]
2. [Follow-up work needed]

### Technical Debt Created
- [Any shortcuts taken that need refinement]

### Documentation Updates Needed
- [Architecture docs to update]
- [README changes needed]

### Testing Gaps
- [Areas needing more testing]
- [Integration scenarios to validate]

## Session Retrospective

### What Worked Well
- **AI Efficiency**: [Where AI saved significant time]
- **Human Insight**: [Where human expertise was crucial]
- **Collaboration**: [Effective AI-human patterns]

### What Could Be Improved
- **AI Limitations**: [Where AI struggled or needed guidance]
- **Process**: [Workflow improvements for next session]
- **Tools**: [Additional tools that might help]

### Lessons Learned
- [Key insights about AI-assisted development]
- [Technical insights about the project]
- [Process improvements discovered]

## Reference Links
- **Branch**: [GitHub branch URL]
- **Issues**: [Related GitHub issues]
- **Documentation**: [Relevant architecture docs]
- **External Resources**: [Any external references used]

---

**Template Version**: 1.0  
**Last Updated**: 2025-01-05  
**For Project**: The Drazzan Invasion  
**AI Context**: GitHub Copilot + VS Code