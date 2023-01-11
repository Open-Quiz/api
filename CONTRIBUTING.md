# Contributing to Open Quiz API

## How to Contribute

### Reporting Bugs

If you run into an issue, please first check the [issue tracker](https://github.com/Open-Quiz/api/issues?q=is%3Aissue+label%3Abug+) to ensure it hasn't been reported before. Only open a new issue if you haven't found anything similar to your issue.

### Requesting Features

The Open Quiz API is currently under active development. Feature requests are always welcome and can be created by opening a new [feature request](https://github.com/Open-Quiz/api/issues/new/choose).

### Completing Features

You can help develop the Open Quiz API by assigning yourself to issues. If you're new to Open Quiz, it's recommended to only assign yourself to one issue at a time and only pick up new issues after you've fully completed the current issue. All your work related to the issue should be done on a branch off main (See [project structure](#project-structure) for branch naming conventions).

### Testing

Every endpoint should have appropriate integration tests. These tests are located at `/tests/integration` and use Docker Compose to create a temporary test PostgreSQL database. For more information on this refer to the integration tests section of the README.md.

## Style Guide

### Project Structure

Open Quiz API uses a standardised branching structure. The `main` branch is the branch all development should be based on. All changes should be done on a separate branch and a PR should be created in order to merge it into `main`.

**Branch names**
- Feature branches should be named `feature/#{issue-number}-{feature-name}`
- Bugfix branches should be named `bugfix/#{issue-number}-{bugfix-name}`
- Documentation branches should be named `docs/#{issue-number}-{documentation-topic}`
- Maintenance/chore branches should be named `chore/#{issue-number}-{maintenance-topic}`
- Miscellaneous branches should be named `task/#{issue-number}-{task-topic}`

**Updating branches**

If you need to update your branch before merging a PR into `main` you should rebase your branch to keep the commit history clean. Refer to [this](https://www.w3docs.com/snippets/git/how-to-rebase-git-branch.html) resource for additional information on how to rebase your branch.

### Coding Conventions

Open Quiz API utilises [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) for ensuring consistent code styling. It's recommended to set this to format on save. How to set this up for VSCode is documented in the extension overview.

[ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) is also used to help identify issues within your code. 