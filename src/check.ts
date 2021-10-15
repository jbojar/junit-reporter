import * as github from '@actions/github';
import * as core from '@actions/core';
import * as formatter from './formatter';
import * as matrix from './matrix';
import Report from './Report';
import {TestFilter} from './TestFilter';

const GITHUB_SUMMARY_LIMIT = 50000;

function truncateByBytesUTF8(str: string, limit: number): string {
  const result = new TextEncoder().encode(str).slice(0, limit);

  return new TextDecoder('utf-8').decode(result);
}

export async function create(token: string, report: Report, filter: TestFilter): Promise<CheckRun> {
  const message = truncateByBytesUTF8(formatter.toMarkdown(report, filter), GITHUB_SUMMARY_LIMIT);

  const name = core.getInput('check-name', { required: false }) || matrix.getName('JUnit Report');
  const status = 'completed' as const;
  const conclusion =
    report.hasTests() && report.isSuccesfull()
      ? ('success' as const)
      : ('failure' as const);
  const pullRequest = github.context.payload.pull_request;
  const head_sha = (pullRequest && pullRequest.head.sha) || github.context.sha;

  const createCheckRequest = {
    ...github.context.repo,
    name,
    head_sha,
    status,
    conclusion,
    output: {
      title: name,
      summary: message
    }
  };

  core.debug(JSON.stringify(createCheckRequest, null, 2));

  const octokit = github.getOctokit(token);
  const response = await octokit.checks.create(createCheckRequest);
  return {
    id: response.data.id,
    nodeId: response.data.node_id,
    checkSuiteId: response.data.check_suite?.id,
    conclusion
  };
}

export interface CheckRun {
  id: number,
  nodeId: string,
  checkSuiteId: number | undefined,
  conclusion: string
}
