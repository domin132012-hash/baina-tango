# Issue tracker: GitHub

Issues, PRDs, and implementation tickets for this repo live in GitHub Issues:

- Repository: `domin132012-hash/baina-tango`
- Remote: `https://github.com/domin132012-hash/baina-tango.git`

Use the `gh` CLI from inside this repo for issue operations.

## Conventions

- Create an issue: `gh issue create --title "..." --body "..."`
- Read an issue: `gh issue view <number> --comments`
- List issues: `gh issue list --state open --json number,title,body,labels,comments`
- Comment on an issue: `gh issue comment <number> --body "..."`
- Apply or remove labels: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- Close an issue: `gh issue close <number> --comment "..."`

When a skill says "publish to the issue tracker", create a GitHub issue unless the user explicitly asks for a local markdown draft instead.
