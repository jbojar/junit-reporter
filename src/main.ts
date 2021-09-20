import * as core from '@actions/core';
import * as check from './check';
import * as event from './event';
import Report from './Report';
import {createTestFilter} from './TestFilter';

export async function run(): Promise<void> {
  try {
    const token = core.getInput('token', { required: true });
    const reportsPath = core.getInput('path', { required: true });
    const matrix = core.getInput('matrix', { required: false });
    const filterOption = core.getInput('show', { required: false });

    if (matrix != null) {
      core.debug(JSON.stringify(matrix, null, 2));
    }
    const report = new Report(reportsPath);
    await report.build();

    const checkRun = await check.create(token, report, createTestFilter(filterOption));
    await event.send(report, checkRun);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
