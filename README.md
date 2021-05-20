# Sample Integration: GitHub Issues to Notion

## About the Integration 

This Notion integration syncs GitHub Issues for a specific repo to a Notion Database. This integration was built using this [database template](https://www.notion.so/367cd67cfe8f49bfaf0ac21305ebb9bf?v=bc79ca62b36e4c54b655ceed4ef06ebd) and [GitHub's Octokit Library](https://github.com/octokit). Changes made to issues in the Notion database will not be reflected in GitHub. For an example which allows you to take actions based on changes in a database [go here.](https://github.com/makenotion/notion-sdk-js/examples/database-update-send-email)

## Running Locally

### 1. Setup your local project
```zsh
Remix this Glitch example project
```

### 2. Set your enviornment variables in a `.env` file
```zsh
GITHUB_KEY=<your-github-personal-access-token>
NOTION_KEY=<your-notion-api-key>
NOTION_DATABASE_ID=<notion-database-id>
GITHUB_REPO_OWNER=<github-owner-username>
GITHUB_REPO_NAME=<github-repo-name>
```

You can create your Notion API key [here](www.notion.com/my-integrations).

You can create your GitHub Personal Access token by following the guide [here](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token).

To create a Notion database that will work with this example, duplicate [this empty database template](https://www.notion.so/367cd67cfe8f49bfaf0ac21305ebb9bf?v=bc79ca62b36e4c54b655ceed4ef06ebd).

### 3. Run code 

```zsh
node index.js
```
