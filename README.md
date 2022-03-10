# Issue Card Creator

This is a GitHub Action written in JavaScript. It allows you to automatically create a project card for an issue when it's created. It supports both repo-level projects and org-level projects.

The `main.yml` has an `actions` input, which allows you to customize which issue labels should map to which project/org/column. Here's an example that uses both repo-level and org-level projects:
```
  actions: '{"data": [
    {
      "label": "test",
      "project": "Ultra Project",
      "project_type": "repo",
      "column": "To-Do",
      "repo": "super-repo"
    },
    {
      "label": "wontfix",
      "project": "Mega Project",
      "project_type": "org",
      "column": "Icebox",
      "org": "ultra-important-org"
    }
  ]}'
  ```
  
  
  # Accessing Organization-level Projects
  By default, the access token that GitHub generates for an action is limited to only the repo that the action is added to. Meaning, you can't get data for other repos; only the one the action is added to. However, it's possible to use a custom access token that allows you to access those other repos.
  
First, you need to create an Organization Secret called `ACCESS_TOKEN`, and set the value to the access token you want to use.

Once you've done that, you'll need to add `github-token: ${{ secrets.ACCESS_TOKEN }}` to your `main.yml`. See below for examples.
  
  
  
  
  
  ## Example main.yml (default permissions)
  ```
on:
  issues:
    types: [opened]

jobs:
  issue_creator_job:
    runs-on: ubuntu-latest
    name: Issue card handler
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Issue Card Creator
        uses: somnolentPumpkin/issue-card-creator@1.24
        id: hello
        with:
          actions: '{"data": [
            {
              "label": "test",
              "project": "Project 2",
              "project_type": "org",
              "column": "Column 2",
              "org": "qe-test-org"
            },
            {
              "label": "bug",
              "project": "Super Project",
              "project_type": "repo",
              "column": "Super Column",
              "repo": "Ultra-Repo"
            }
          ]}'

```

## Example main.yml (custom access token)
  ```
on:
  issues:
    types: [opened]

jobs:
  issue_creator_job:
    runs-on: ubuntu-latest
    name: Issue card handler
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Issue Card Creator
        uses: somnolentPumpkin/issue-card-creator@1.24
        id: hello
        with:
          github-token: ${{ secrets.ACCESS_TOKEN }}
          actions: '{"data": [
            {
              "label": "test",
              "project": "Project 2",
              "project_type": "org",
              "column": "Column 2",
              "org": "qe-test-org"
            },
            {
              "label": "bug",
              "project": "Super Project",
              "project_type": "repo",
              "column": "Super Column",
              "repo": "Ultra-Repo"
            }
          ]}'

```
