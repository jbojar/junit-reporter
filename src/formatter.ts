import {TestCase} from 'junit2json';
import Report from './Report';

function getMessage(testCase: TestCase): string | undefined {
  return (
    testCase.skipped?.[0]?.message?.trim() ||
    testCase.error?.[0]?.message?.trim() ||
    testCase.failure?.[0]?.message?.trim() ||
    undefined
  )
    ?.split('\n')
    .map(s => `> ${s}`)
    .join('\n');
}

function getName(testCase: TestCase): string {
  const name = testCase.name.trim();
  const classname = testCase.classname.trim();

  if (name.toLowerCase() === classname.toLowerCase()) {
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
    case 'successes': {
      return 'Successful tests';
    }
    default: {
      return 'Other';
    }
  }
}

function getType(testCase: TestCase): string {
  if ((testCase.skipped?.length || 0) > 0) {
    return 'skipped';
  } else if ((testCase.error?.length || 0) > 0) {
    return 'errors';
  } else if ((testCase.failure?.length || 0) > 0) {
    return 'failures';
  } else {
    return 'successes';
  }
}

export function toMarkdown(report: Report): Result {
  if (!report.hasTests()) {
    return {summary: '### Test results not found\n'};
  }

  const results: Map<string, string[]> = new Map();

  for (const testSuite of report.getTestSuites()) {
    for (const testCase of testSuite.testcase) {
      const type = getType(testCase);
      const name = getName(testCase);
      const message = getMessage(testCase);

      let details;
      if (message) {
        details = `<details>\n <summary>${name}</summary>\n\n${message}\n\n</details>`;
      } else {
        details = `* ${name}`;
      }

      results.set(type, (results.get(type) || []).concat(details));
    }
  }

  const tests = report.counter.tests,
    successful = report.counter.succesfull;

  let summary = `### Found ${tests} ${getPlural('tests', tests)}\n`;

  if (successful === tests) {
    summary += `\n- **All** tests were successful`;
  } else if (successful > 0) {
    summary += `\n- **${successful}** ${getPlural('successful', successful)} successful`;
  } else {
    summary += `\n- **None** test were successful`;
  }

  if (report.hasFailures()) {
    const failures = report.counter.failures;
    summary += `\n- **${failures}** ${getPlural('failures', failures)} failed`;
  }

  if (report.hasErrors()) {
    const errors = report.counter.errors;
    summary += `\n- **${errors}** ${getPlural('errors', errors)} ended with error`;
  }

  if (report.hasSkipped()) {
    const skipped = report.counter.skipped;
    summary += `\n- **${skipped}** ${getPlural('skipped', skipped)} skipped`;
  }

  let text = '';
  const keys = [...results.keys()].sort((a, b) => a.localeCompare(b));
  for (const key of keys) {
    if ((results.get(key)?.length || 0) <= 0) continue;

    text += `\n### ${getTitle(key)}\n`;
    text += '\n';

    text += results.get(key)?.join('\n') || '';
    text += '\n';
  }

  return {summary, text};
}

interface Result {
  summary: string;
  text?: string;
}
