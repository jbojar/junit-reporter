import { TestCase } from 'junit2json';
import Report from './Report';
import { forEachTestCase } from './suites';
import { markdownTable } from './markdown-table';
import {TestFilter} from './TestFilter';

function getMessage(testCase: TestCase): string | undefined {
  return (
    testCase.skipped?.[0]?.message?.trim() ||
    testCase.error?.[0]?.message?.trim() ||
    testCase.failure?.[0]?.message?.trim() ||
    'No message provided'
  )
    ?.split('\n')
    .map((s) => `> ${s}`)
    .join('\n');
}

function getName(testCase: TestCase): string {
  const name = testCase.name?.trim();
  const classname = testCase.classname?.trim();

  if (name === undefined || classname === undefined) {
    return '<strong>Default/Unknown test case:</strong>';
  } else if (name.toLowerCase() === classname.toLowerCase()) {
    return `<strong>${name}</strong>`;
  } else {
    return `<strong>${classname}</strong>: ${name}`;
  }
}

function getPlural(type: string, count: number): string {
  switch (type) {
    case 'tests': {
      return count === 1 ? 'test' : 'tests';
    }
    case 'skipped': {
      return count === 1 ? 'test is' : 'tests are';
    }
    case 'failures': {
      return count === 1 ? 'test' : 'tests';
    }
    case 'errors': {
      return count === 1 ? 'test' : 'tests';
    }
    case 'successful': {
      return count === 1 ? 'test was' : 'tests were';
    }
    default: {
      return count === 1 ? 'test' : 'tests';
    }
  }
}

function getTitle(type: string): string {
  switch (type) {
    case 'skipped': {
      return 'Skipped tests';
    }
    case 'failures': {
      return 'Failed tests';
    }
    case 'errors': {
      return 'Errors';
    }
    default: {
      return 'Other';
    }
  }
}

function getType(testCase: TestCase): string | undefined {
  if ((testCase.skipped?.length || 0) > 0) {
    return 'skipped';
  } else if ((testCase.error?.length || 0) > 0) {
    return 'errors';
  } else if ((testCase.failure?.length || 0) > 0) {
    return 'failures';
  } else {
    return undefined;
  }
}

function getMessageAboutLimit(
  results: string[] | undefined,
  count: number
): string {
  return (results?.length || 0) < count
    ? '_Only the first ten tests have been listed below!_'
    : '';
}

export function toMarkdown(report: Report, filter: TestFilter): string {
  if (!report.hasTests()) {
    return '# Test results not found\n';
  }

  const results: Map<string, string[]> = new Map();

  const suites = report.getTestSuites().filter(suite => filter.shouldReportTestSuite(suite));

  forEachTestCase(suites, (testCase) => {
    const type = getType(testCase);
    if (type === undefined || (results.get(type)?.length || 0) >= 10)
      return;
    if (filter.shouldReportTestCase(testCase)) {
      const name = getName(testCase);
      const message = getMessage(testCase);

      const details = `<details>\n<summary>${name}</summary>\n\n${message}\n\n</details>`;

      results.set(type, (results.get(type) || []).concat(details));
    }
  });

  const tests = report.counter.tests,
    successful = report.counter.succesfull;

  let result = `# Results (${tests} ${getPlural('tests', tests)}) ${successful === tests ? '✓' : '✗'}\n`;

  suites.forEach((suite) => {
    result += `\n## ${suite.name}\n\n`;
    const testCases = suite.testcase || [];
    const rows = testCases
        .filter(testCase => filter.shouldReportTestCase(testCase))
        .map(it => [`${it.name}`, `${it.failure || it.error ? '×' : it.skipped ? '💔' : '✓'}`, `${(it.time || 0) * 1000} ms`]);
    const tableHeader = ['Test case', 'Result', 'Duration'];
    result += markdownTable([tableHeader].concat(rows), {align: ['l', 'c', 'c']});
    result += '\n';
  });

  if (successful === tests) {
    result += '\n- **All** tests were successful';
  } else if (successful > 0) {
    result += `\n- **${successful}** ${getPlural(
      'successful',
      successful
    )} successful`;
  } else {
    result += '\n- **No** test were successful';
  }

  if (report.hasFailures()) {
    const failures = report.counter.failures;
    result += `\n- **${failures}** ${getPlural('failures', failures)} failed`;
  }

  if (report.hasErrors()) {
    const errors = report.counter.errors;
    result += `\n- **${errors}** ${getPlural(
      'errors',
      errors
    )} ended with error`;
  }

  if (report.hasSkipped()) {
    const skipped = report.counter.skipped;
    result += `\n- **${skipped}** ${getPlural('skipped', skipped)} skipped`;
  }

  const keys = [...results.keys()].sort((a, b) => a.localeCompare(b));
  for (const key of keys) {
    if ((results.get(key)?.length || 0) <= 0) continue;

    result += `\n\n## ${getTitle(key)}\n`;
    result += getMessageAboutLimit(results.get(key), report.counter.get(key));
    result += '\n';

    result += results.get(key)?.join('\n') || '';
    result += '\n';
  }

  return result;
}
