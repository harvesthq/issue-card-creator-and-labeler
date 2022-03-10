const core = require("@actions/core");
const github = require("@actions/github");

const githubToken = core.getInput("github-token");
const octokit = github.getOctokit(githubToken);
const fetch = require("node-fetch");

const graphHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
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
  for (let item in dataMap) {
    console.log(
      `Adding label: ${dataMap[item].label} to Issue #${payload.issue.number}`
    );
    await addLabelToIssue(
      dataMap[item].org,
      dataMap[item].repo,
      payload.issue.number,
      dataMap[item].label
    );
    console.log(`Getting ID for project #${dataMap[item].projectNumber}`);
    const projectId = await getBetaProjectId(
      dataMap[item].org,
      dataMap[item].projectNumber
    );
    const issueId = payload.issue.node_id;
    await addIssueToBetaProject(projectId, issueId);
  }
}

async function addLabelToIssue(org, repo, issueNumber, label) {
  return await octokit.rest.issues.addLabels({
    org,
    repo,
    issueNumber,
    label,
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
