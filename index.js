const core = require("@actions/core");
const github = require("@actions/github");

const githubToken = core.getInput("github-token");
const octokit = github.getOctokit(githubToken);
const fetch = require("node-fetch");
const GRAPH_URL = "https://api.github.com/graphql";
const graphHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `token ${githubToken}`,
};

async function getBetaProjectId(org, projectNumber) {
  const query = `query{organization(login: "${org}"){projectNext(number: ${projectNumber}){id}}}`;
  const result = await fetch(GRAPH_URL, {
    method: "POST",
    headers: graphHeaders,
    body: JSON.stringify({
      query: query,
    }),
  });
  const data = await result.json();
  return data.data.organization.projectNext.id;
}

async function addIssueToBetaProject(projectId, issueId) {
  const query = `mutation {addProjectNextItem(input: {projectId: "${projectId}" contentId: "${issueId}"}) {projectNextItem {id}}}`;
  const result = await fetch(GRAPH_URL, {
    method: "POST",
    headers: graphHeaders,
    body: JSON.stringify({
      query: query,
    }),
  });
  return await result.json();
}

async function process(dataMap, payload) {
  try {
    for (let item in dataMap) {
      console.log(
        `Adding label: ${dataMap[item].label} to Issue #${payload.issue.number}`
      );

      console.log(`Getting ID for project #${dataMap[item].project}`);
      const projectId = await getBetaProjectId(
        dataMap[item].org,
        dataMap[item].project
      );
      const issueId = payload.issue.node_id;
      await addIssueToBetaProject(projectId, issueId);
    }
  } catch (error) {
    console.error(error);
  }
}

async function addLabelToIssue(org, repo, issueNumber, label) {
  return await octokit.rest.issues.addLabels({
    org,
    repo,
    issue_number: issueNumber,
    labels: [label],
  });
}

try {
  (async () => {
    const data = JSON.parse(core.getInput("actions")).data;
    await process(data, github.context.payload);
  })();
} catch (error) {
  core.setFailed(error.message);
}
