## Label Issue and Add to Project
This GitHub Action is written in JavaScript, though its purpose is fairly specific. For organization-level GitHub projects that specifically use the projects beta, it will automatically take issues as they're created, label them, and then add them to the project.

**Note:** It requires you to set have an organization-level secret called `ACCESS_TOKEN`, and the value should be an access token that allows you to read at the organization level, and write at the individual repo level.

Example YML:
```
on:
  issues:
    types: [opened]

jobs:
  issue_creator_job:
    runs-on: ubuntu-latest
    name: Label issue and add to project
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Label issue and add to project
        uses: somnolentPumpkin/issue-card-creator-and-labeler@0.96
        id: hello
        with:
          github-token: ${{ secrets.ACCESS_TOKEN }}
          actions: '{"data": [
            {
              "label": "Bugs",
              "project": "1",
              "repo": "your-repo",
              "org": "your-org-name"
            }
          ]}'
```


