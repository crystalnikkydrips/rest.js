import { Octokit, RestEndpointMethodTypes } from "../src";
import { Agent } from "http";

// ************************************************************
// THIS CODE IS NOT EXECUTED. IT IS JUST FOR TYPECHECKING
// ************************************************************

export default async function () {
  // Check empty constructor
  new Octokit();

  // for all supported options
  const octokit = new Octokit({
    timeout: 0,
    headers: {
      accept: "application/vnd.github.v3+json",
      "user-agent": "octokit/rest.js v1.2.3",
    },
    baseUrl: "https://api.github.com",
    agent: new Agent({ keepAlive: true }),
    custom: {
      foo: "bar",
    },
  });

  // check responses
  const repoResponse = await octokit.repos.get({
    owner: "octokit",
    repo: "rest.js",
  });
  repoResponse.data;
  repoResponse.status;
  repoResponse.headers.link;
  repoResponse.headers.etag;
  repoResponse.headers.status;

  const userResponse = await octokit.users.getByUsername({
    username: "octokit",
  });
  userResponse.data.login;
  userResponse.data.type;

  const userIssuesResponse = await octokit.issues.listForAuthenticatedUser({
    state: "open",
  });
  userIssuesResponse.data[0].locked;

  // endpoint method
  await octokit.issues.addLabels({
    owner: "octokit",
    repo: "rest.js",
    issue_number: 10,
    labels: ["label"],
  });

  const requestOptions = octokit.issues.addLabels.endpoint({
    owner: "octokit",
    repo: "rest.js",
    number: 10,
    labels: ["label"],
    request: {
      foo: "bar",
    },
  });
  requestOptions.method;
  requestOptions.url;
  requestOptions.headers;
  requestOptions.body;
  requestOptions.request.foo;
  octokit.issues.addLabels.endpoint.merge({
    foo: "bar",
  });

  // parameter deprecation
  await octokit.issues.get({
    owner: "octokit",
    repo: "rest.js",
    issue_number: 10, // deprecated, renamed to "issue_number", see below
  });
  await octokit.issues.get({
    owner: "octokit",
    repo: "rest.js",
    issue_number: 10,
  });

  // hooks
  octokit.hook.before("request", async (options) => {
    console.log("before hook", options.url);
  });
  octokit.hook.after("request", async (response, options) => {
    console.log(`${options.method} ${options.url}: ${response.status}`);
  });

  const findInCache = (etag: string) => ({ hello: "world" });
  octokit.hook.error("request", async (error, options) => {
    if (error.status === 304) {
      return findInCache(error.headers.etag);
    }

    throw error;
  });
  octokit.hook.wrap("request", async (request, options) => {
    // add logic before, after, catch errors or replace the request altogether
    return request(options);
  });

  // request & endpoint
  octokit.request("/");
  octokit.request("GET /repos/{owner}/{repo}/issues", {
    owner: "octokit",
    repo: "rest.js",
  });
  octokit.request({
    method: "GET",
    url: "/repos/{owner}/{repo}/issues",
    owner: "octokit",
    repo: "rest.js",
  });
  octokit.request.endpoint("/");
  octokit.request.endpoint("GET /repos/{owner}/{repo}/issues", {
    owner: "octokit",
    repo: "rest.js",
  });
  octokit.request.endpoint({
    method: "GET",
    url: "/repos/{owner}/{repo}/issues",
    owner: "octokit",
    repo: "rest.js",
  });
  octokit.request.endpoint.merge({ foo: "bar" });
  octokit.request.endpoint
    .defaults({ owner: "octokit", repo: "rest.js" })
    .merge({ method: "GET", url: "/repos/{owner}/{repo}/issues" });

  // pagination
  octokit
    .paginate("GET /repos/{owner}/{repo}/issues", {
      owner: "octokit",
      repo: "rest.js",
    })
    .then((issues) => {
      // issues is an array of all issue objects
    });

  octokit
    .paginate(
      "GET /repos/{owner}/{repo}/issues",
      { owner: "octokit", repo: "rest.js" },
      (response) => response.data.map((issue) => issue.title)
    )
    .then((issueTitles) => {
      // issueTitles is now an array with the titles only
    });

  const options = octokit.issues.listForRepo.endpoint.merge({
    owner: "octokit",
    repo: "rest.js",
  });
  for await (const response of octokit.paginate.iterator<{ id: number }>(
    options
  )) {
    // do whatever you want with each response, break out of the loop, etc.
    console.log(response.data.map((repo) => repo.id));
  }

  // register endpoints
  octokit.registerEndpoints({
    funk: {
      method: "DELETE",
      url: "/funk",
      request: {
        foo: "bar",
      },
    },
  });

  // Plugins
  const MyOctokit = Octokit.plugin((octokit, options) => {
    octokit.hook.wrap("request", async (request, options) => {
      const time = Date.now();
      const response = await request(options);
      console.log(
        `${options.method} ${options.url} – ${response.status} in ${
          Date.now() - time
        }ms`
      );
      return response;
    });
  });

  const myOctokit = new MyOctokit();
  myOctokit.request("/");

  // mediaType parameter
  // https://github.com/probot/probot/issues/1024
  await octokit.pulls.get({
    owner: "owner",
    repo: "repo",
    pull_number: 123,
    mediaType: {
      format: "diff",
    },
  });

  // Auth strategies
  // https://github.com/octokit/rest.js/issues/1562
  new MyOctokit({
    authStrategy: () => {},
    auth: {
      id: 123,
      privateKey: "private key here",
      installationId: 12345,
    },
  });

  const { data } = await updateLabel({
    owner: "octocat",
    repo: "hello-world",
    name: "bug",
    color: "cc0000",
  });

  console.log(data.color);

  async function updateLabel(
    options: RestEndpointMethodTypes["issues"]["updateLabel"]["parameters"]
  ): Promise<RestEndpointMethodTypes["issues"]["updateLabel"]["response"]> {
    console.log(options);

    return {
      headers: {},
      data: {
        id: 123,
        node_id: "123",
        color: "cc0000",
        default: false,
        description: "",
        name: "bug",
        url: "",
      },
      status: 200,
      url: "",
    };
  }
}
