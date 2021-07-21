/* ================================================================================

	notion-github-sync.
  
  Glitch example: https://glitch.com/edit/#!/notion-github-sync
  Find the official Notion API client @ https://github.com/makenotion/notion-sdk-js/

================================================================================ */

const { Client } = require("@notionhq/client")
const dotenv = require("dotenv")
const { Octokit } = require("octokit")

dotenv.config()
const octokit = new Octokit({ auth: process.env.GITHUB_KEY })
const notion = new Client({ auth: process.env.NOTION_KEY })

const databaseId = process.env.NOTION_DATABASE_ID
const OPERATION_BATCH_SIZE = 10

/**
 * Local map to store  GitHub issue ID to its Notion pageId.
 * { [issueId: string]: string }
 */
const gitHubIssuesIdToNotionPageId = {}

/**
 * Initialize local data store.
 * Then sync with GitHub.
 */
setInitialGitHubToNotionIdMap().then(syncNotionDatabaseWithGitHub)

/**
 * Get and set the initial data store with issues currently in the database.
 */
async function setInitialGitHubToNotionIdMap() {
  const currentIssues = await getIssuesFromNotionDatabase()
  for (const { pageId, issueNumber } of currentIssues) {
    gitHubIssuesIdToNotionPageId[issueNumber] = pageId
  }
}

async function syncNotionDatabaseWithGitHub() {
  // Get all issues currently in the provided GitHub repository.
  const issues = await getGitHubIssuesForRepository()
  console.log(`\nFetched ${issues.length} issues from GitHub repository.`)
  // Group issues into those that need to be created or updated in the Notion database.
  const { pagesToCreate, pagesToUpdate } = getNotionOperations(issues)
  // Create pages for new issues.
  console.log(`\n${pagesToCreate.length} new issues to add to Notion.`)
  await createPages(pagesToCreate)
  // Updates pages for existing issues.
  console.log(`\n${pagesToUpdate.length} issues to update in Notion.`)
  await updatePages(pagesToUpdate)
  // Success!
  console.log("\n✅ Notion database is synced with GitHub.")
}

/**
 * Gets issues from the database.
 *
 * Returns array of objects with pageId and issueNumber
 * Array<{ pageId: string, issueNumber: number }>
 */
async function getIssuesFromNotionDatabase() {
  const pages = []
  let cursor = undefined
  while (true) {
    console.log("\nFetching issues from Notion DB...")
    const { results, next_cursor } = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
    })
    pages.push(...results)
    if (!next_cursor) {
      break
    }
    cursor = next_cursor
  }
  console.log(`${pages.length} issues successfully fetched.`)
  return pages.map(page => {
    return {
      pageId: page.id,
      issueNumber: page.properties["Issue Number"].number,
    }
  })
}

/**
 * Gets issues from a GitHub repository. Pull requests are omitted.
 *
 * Returns array of issue objects with number, title, state, comment_count, and url.
 * Array<{ number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>
 */
async function getGitHubIssuesForRepository() {
  const issues = []
  // https://docs.github.com/en/rest/guides/traversing-with-pagination
  // https://docs.github.com/en/rest/reference/issues
  const iterator = octokit.paginate.iterator(octokit.rest.issues.listForRepo, {
    owner: process.env.GITHUB_REPO_OWNER,
    repo: process.env.GITHUB_REPO_NAME,
    state: "all",
    per_page: 100,
  })
  for await (const { data } of iterator) {
    for (const issue of data) {
      if (!issue.pull_request) {
        issues.push({
          number: issue.number,
          title: issue.title,
          state: issue.state,
          comment_count: issue.comments,
          url: issue.html_url,
        })
      }
    }
  }
  return issues
}

/**
 * Determines which issues already exist in the Notion database.
 *
 * @param issues Array<{ number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>
 *
 * Returns an object with keys for each operation grouping:
 * {
 *  pagesToCreate: Array<{ number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>
 *  pagesToUpdate: Array<{ pageId: string, number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>
 * }
 */
function getNotionOperations(issues) {
  const pagesToCreate = []
  const pagesToUpdate = []
  for (const issue of issues) {
    const pageId = gitHubIssuesIdToNotionPageId[issue.number]
    if (pageId) {
      pagesToUpdate.push({
        ...issue,
        pageId,
      })
    } else {
      pagesToCreate.push(issue)
    }
  }
  return { pagesToCreate, pagesToUpdate }
}

/**
 * Creates new pages in Notion.
 *
 * @param  Array<{ number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>
 */
async function createPages(pagesToCreate) {
  for (const pagesToCreateBatch of chunkItems(pagesToCreate)) {
    await Promise.all(
      pagesToCreateBatch.map(issue =>
        notion.pages.create({
          parent: { database_id: databaseId },
          properties: getPropertiesFromIssue(issue),
        })
      )
    )
    console.log(`Completed batch size: ${pagesToCreateBatch.length}`)
  }
}

/**
 * Updates provided pages in Notion.
 *
 * @param  Array<{ pageId: string, number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>
 */
async function updatePages(pagesToUpdate) {
  // https://developers.notion.com/reference/patch-page
  for (const pagesToUpdateBatch of chunkItems(pagesToUpdate)) {
    await Promise.all(
      pagesToUpdateBatch.map(({ pageId, ...issue }) =>
        notion.pages.update({
          page_id: pageId,
          properties: getPropertiesFromIssue(issue),
        })
      )
    )
    console.log(`Completed batch size: ${pagesToUpdateBatch.length}`)
  }
}

//*========================================================================
// Helpers
//*========================================================================

/**
 * An iterator that batches out a list of items into smaller chunks.
 */
function* chunkItems(items) {
  let startIndex = 0
  while (true) {
    const itemChunk = items.slice(startIndex, startIndex + OPERATION_BATCH_SIZE)
    yield itemChunk
    if (itemChunk.length < OPERATION_BATCH_SIZE) {
      break
    }
    startIndex += OPERATION_BATCH_SIZE
  }
}

/**
 * Formats a GitHub issue to match Notion database fields.
 *
 * @param issue { number: number, title: string, state: "open" | "closed", comment_count: number, url: string }
 *
 * Returns a Notion database request property object.
 */
function getPropertiesFromIssue(issue) {
  const { title, number, state, comment_count, url } = issue
  return {
    Name: {
      title: [{ type: "text", text: { content: title } }],
    },
    "Issue Number": {
      number,
    },
    State: {
      select: { name: state },
    },
    "Number of Comments": {
      number: comment_count,
    },
    "Issue URL": {
      url,
    },
  }
}
