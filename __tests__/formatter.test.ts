import Report from '../src/Report';
import { TestCase, TestSuite } from 'junit2json';
import { toMarkdown } from '../src/formatter';
import {createTestFilter} from '../src/TestFilter';

const counter = jest.fn();
jest.mock('../src/Report', () => {
  return jest.fn().mockImplementation(() => {
    return { counter };
  });
});

describe('formatter', () => {
  const report = new Report('**/*.xml');
  const allFilter = createTestFilter('all');

  test('should handle empty tests results', async () => {
    report.hasTests = jest.fn(() => false);

    expect(toMarkdown(report, allFilter)).toEqual('# Test results not found\n');
  });

  test('should handle successful test', async () => {
    report.getTestSuites = jest.fn(() => [
      {
        name: 'TestSuite',
        classname: 'TestSuiteClassName',
        tests: 1,
        testcase: [
          { name: 'TestCase', classname: 'TestCaseClassName', time: 0.006 } as TestCase,
        ],
      } as TestSuite,
    ]);

    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => false);
    report.hasErrors = jest.fn(() => false);
    report.hasSkipped = jest.fn(() => false);

    report.counter.tests = 1;
    report.counter.succesfull = 1;

    const result = toMarkdown(report, allFilter);

    expect(result).toEqual(trimmed(`
      # Results (1 test) ✓
      
      ## TestSuite
      
      | Test case | Result | Duration |
      | :-------- | :----: | :------: |
      | TestCase  |    ✓   |   6 ms   |
      
      - **All** tests were successful
    `));
  });

  test('should handle empty testcase', async () => {
    report.getTestSuites = jest.fn(() => [
      {
        name: 'TestSuite',
        classname: 'TestSuiteClassName',
        tests: 1,
        testcase: undefined as unknown,
      } as TestSuite,
    ]);

    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => false);
    report.hasErrors = jest.fn(() => false);
    report.hasSkipped = jest.fn(() => false);

    report.counter.tests = 1;
    report.counter.succesfull = 1;

    const result = toMarkdown(report, allFilter);

    expect(result).toEqual(trimmed(`
      # Results (1 test) ✓
      
      ## TestSuite
      
      | Test case | Result | Duration |
      | :-------- | :----: | :------: |
      
      - **All** tests were successful
    `));
  });

  test('should handle undefined values in data', async () => {
    report.getTestSuites = jest.fn(() => [
      {
        name: 'TestSuite',
        classname: 'TestSuiteClassName',
        tests: 1,
        failures: 1,
        testcase: [
          { name: undefined as unknown,
            classname: undefined as unknown,
            failure: [{ message: 'Failed message' }] } as TestCase,
        ],
      } as TestSuite,
    ]);

    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => false);
    report.hasErrors = jest.fn(() => false);
    report.hasSkipped = jest.fn(() => false);

    report.counter.tests = 1;
    report.counter.failures = 1;
    report.counter.succesfull = 0;
    report.counter.get = jest.fn(() => 1);

    const result = toMarkdown(report, allFilter);

    expect(result).toEqual(trimmed(`
      # Results (1 test) ✗
      
      ## TestSuite
      
      | Test case | Result | Duration |
      | :-------- | :----: | :------: |
      | undefined |    ×   |   0 ms   |
      
      - **No** test were successful
      
      ## Failed tests
      
      <details>
      <summary><strong>Default/Unknown test case:</strong></summary>
      
      > Failed message
      
      </details>
      
    `));
  });

  test('should handle failed test', async () => {
    report.getTestSuites = jest.fn(() => [
      {
        name: 'TestSuite',
        classname: 'TestSuiteClassName',
        tests: 2,
        failures: 1,
        testcase: [
          {
            name: 'Successful TestCase',
            classname: 'TestCaseClassName',
          } as TestCase,
          {
            name: 'Failed TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: 'Failed message' }],
          } as TestCase,
        ],
      } as TestSuite,
    ]);

    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => true);
    report.hasErrors = jest.fn(() => false);
    report.hasSkipped = jest.fn(() => false);

    report.counter.tests = 2;
    report.counter.succesfull = 1;
    report.counter.failures = 1;
    report.counter.get = jest.fn(() => 1);

    const result = toMarkdown(report, allFilter);

    expect(result).toEqual(trimmed(`
      # Results (2 tests) ✗
      
      ## TestSuite
      
      | Test case           | Result | Duration |
      | :------------------ | :----: | :------: |
      | Successful TestCase |    ✓   |   0 ms   |
      | Failed TestCase     |    ×   |   0 ms   |
      
      - **1** test was successful
      - **1** test failed
      
      ## Failed tests
      
      <details>
      <summary><strong>TestCaseClassName</strong>: Failed TestCase</summary>
      
      > Failed message
      
      </details>
      
    `));
  });

  test('should handle skipped test', async () => {
    report.getTestSuites = jest.fn(() => [
      {
        name: 'TestSuite',
        classname: 'TestSuiteClassName',
        tests: 2,
        skipped: 1,
        testcase: [
          {
            name: 'Successful TestCase',
            classname: 'TestCaseClassName',
          } as TestCase,
          {
            name: 'Skipped TestCase',
            classname: 'TestCaseClassName',
            skipped: [{ message: 'Skipped' }],
          } as TestCase,
        ],
      } as TestSuite,
    ]);

    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => false);
    report.hasErrors = jest.fn(() => false);
    report.hasSkipped = jest.fn(() => true);

    report.counter.tests = 2;
    report.counter.succesfull = 1;
    report.counter.skipped = 1;
    report.counter.get = jest.fn(() => 1);

    const result = toMarkdown(report, allFilter);

    expect(result).toEqual(trimmed(`
      # Results (2 tests) ✗
  
      ## TestSuite
      
      | Test case           | Result | Duration |
      | :------------------ | :----: | :------: |
      | Successful TestCase |    ✓   |   0 ms   |
      | Skipped TestCase    |   💔   |   0 ms   |
      
      - **1** test was successful
      - **1** test is skipped
      
      ## Skipped tests
      
      <details>
      <summary><strong>TestCaseClassName</strong>: Skipped TestCase</summary>
      
      > Skipped
      
      </details>
      
    `));
  });

  test('should handle test without message', async () => {
    report.getTestSuites = jest.fn(() => [
      {
        name: 'TestSuite',
        classname: 'TestSuiteClassName',
        tests: 1,
        skipped: 1,
        testcase: [
          {
            name: 'Skipped TestCase',
            classname: 'TestCaseClassName',
            skipped: [{}],
          } as TestCase,
        ],
      } as TestSuite,
    ]);

    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => false);
    report.hasErrors = jest.fn(() => false);
    report.hasSkipped = jest.fn(() => true);

    report.counter.tests = 1;
    report.counter.succesfull = 0;
    report.counter.skipped = 1;
    report.counter.get = jest.fn(() => 1);

    const result = toMarkdown(report, allFilter);

    expect(result).toEqual(trimmed(`
      # Results (1 test) ✗
  
      ## TestSuite
      
      | Test case        | Result | Duration |
      | :--------------- | :----: | :------: |
      | Skipped TestCase |   💔   |   0 ms   |
      
      - **No** test were successful
      - **1** test is skipped
      
      ## Skipped tests
      
      <details>
      <summary><strong>TestCaseClassName</strong>: Skipped TestCase</summary>
      
      > No message provided
      
      </details>

    `));
  });

  test('should handle test with error', async () => {
    report.getTestSuites = jest.fn(() => [
      {
        name: 'TestSuite',
        classname: 'TestSuiteClassName',
        tests: 2,
        errors: 1,
        testcase: [
          {
            name: 'Successful TestCase',
            classname: 'TestCaseClassName',
          } as TestCase,
          {
            name: 'TestCase with Error',
            classname: 'TestCaseClassName',
            error: [{ message: 'Something\nfailed' }],
          } as TestCase,
        ],
      } as TestSuite,
    ]);

    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => false);
    report.hasErrors = jest.fn(() => true);
    report.hasSkipped = jest.fn(() => false);

    report.counter.tests = 2;
    report.counter.succesfull = 1;
    report.counter.errors = 1;
    report.counter.get = jest.fn(() => 1);

    const result = toMarkdown(report, allFilter);

    expect(result).toEqual(trimmed(`
      # Results (2 tests) ✗
  
      ## TestSuite
      
      | Test case           | Result | Duration |
      | :------------------ | :----: | :------: |
      | Successful TestCase |    ✓   |   0 ms   |
      | TestCase with Error |    ×   |   0 ms   |
      
      - **1** test was successful
      - **1** test ended with error
      
      ## Errors
      
      <details>
      <summary><strong>TestCaseClassName</strong>: TestCase with Error</summary>
      
      > Something
      > failed
      
      </details>

    `));
  });

  test('should handle multiple results', async () => {
    report.getTestSuites = jest.fn(() => [
      {
        name: 'First TestSuite',
        classname: 'FirstTestSuiteClassName',
        tests: 1,
        testcase: [
          {
            name: 'Successful TestCase',
            classname: 'SuccessfulTestCaseClassName',
          } as TestCase,
        ],
      } as TestSuite,
      {
        name: 'SecondTestSuite',
        classname: 'SecondTestSuiteClassName',
        tests: 2,
        failures: 1,
        testcase: [
          {
            name: 'Successful TestCase',
            classname: 'SuccessfulTestCaseClassName',
          } as TestCase,
          {
            name: 'Failed TestCase',
            classname: 'FailedCaseClassName',
            failure: [{ message: 'Failed' }],
          } as TestCase,
        ],
      } as TestSuite,
      {
        name: 'Third TestSuite',
        classname: 'ThirdTestSuiteClassName',
        tests: 1,
        skipped: 1,
        testcase: [
          {
            name: 'Skipped TestCase',
            classname: 'TestCaseClassName',
            skipped: [{ message: 'Skipped' }],
          } as TestCase,
        ],
      } as TestSuite,
      {
        name: 'SeparateTestSuite',
        classname: 'SeparateTestSuiteClassName',
        tests: 1,
        errors: 1,
        testcase: [
          {
            name: 'TestCase with Error',
            classname: 'TestCaseClassName',
            error: [{ message: 'Something\nfailed' }],
          } as TestCase,
        ],
      } as TestSuite,
    ]);

    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => true);
    report.hasErrors = jest.fn(() => true);
    report.hasSkipped = jest.fn(() => true);

    report.counter.tests = 5;
    report.counter.succesfull = 2;
    report.counter.failures = 1;
    report.counter.errors = 1;
    report.counter.skipped = 1;
    report.counter.get = jest.fn(() => 1);

    const result = toMarkdown(report, allFilter);

    expect(result).toEqual(trimmed(`
      # Results (5 tests) ✗
  
      ## First TestSuite
      
      | Test case           | Result | Duration |
      | :------------------ | :----: | :------: |
      | Successful TestCase |    ✓   |   0 ms   |
      
      ## SecondTestSuite
      
      | Test case           | Result | Duration |
      | :------------------ | :----: | :------: |
      | Successful TestCase |    ✓   |   0 ms   |
      | Failed TestCase     |    ×   |   0 ms   |
      
      ## Third TestSuite
      
      | Test case        | Result | Duration |
      | :--------------- | :----: | :------: |
      | Skipped TestCase |   💔   |   0 ms   |
      
      ## SeparateTestSuite
      
      | Test case           | Result | Duration |
      | :------------------ | :----: | :------: |
      | TestCase with Error |    ×   |   0 ms   |
      
      - **2** tests were successful
      - **1** test failed
      - **1** test ended with error
      - **1** test is skipped
      
      ## Errors
      
      <details>
      <summary><strong>TestCaseClassName</strong>: TestCase with Error</summary>
      
      > Something
      > failed
      
      </details>
      
      
      ## Failed tests
      
      <details>
      <summary><strong>FailedCaseClassName</strong>: Failed TestCase</summary>
      
      > Failed
      
      </details>
      
      
      ## Skipped tests
      
      <details>
      <summary><strong>TestCaseClassName</strong>: Skipped TestCase</summary>
      
      > Skipped
      
      </details>
    
    `));
  });

  test('should only display first 10 failed tests', async () => {
    report.getTestSuites = jest.fn(() => [
      {
        name: 'TestSuite',
        classname: 'TestSuiteClassName',
        tests: 12,
        failures: 12,
        testcase: [
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '1' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '2' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '3' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '4' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '5' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '5' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '7' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '8' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '9' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '10' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '11' }],
          } as TestCase,
          {
            name: 'TestCase',
            classname: 'TestCaseClassName',
            failure: [{ message: '12' }],
          } as TestCase,
        ],
      } as TestSuite,
    ]);

    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => true);
    report.hasErrors = jest.fn(() => false);
    report.hasSkipped = jest.fn(() => false);

    report.counter.tests = 12;
    report.counter.succesfull = 0;
    report.counter.failures = 12;
    report.counter.get = jest.fn(() => 12);

    const result = toMarkdown(report, allFilter);

    expect(result).toContain(
      '_Only the first ten tests have been listed below!_'
    );
  });

  test('should show only failed test results if such filter is in use', () => {
    //given
    report.getTestSuites = jest.fn(() => [
      {
        name: 'TestSuiteWithFailures',
        classname: 'TestSuiteWithFailuresClassName',
        tests: 2,
        failures: 1,
        testcase: [
          {
            name: 'FailedTestCase',
            classname: 'FailedTestCaseClassName',
            failure: [{ message: 'Expected pi to equal 3.14 but it was 3.141' }],
          } as TestCase,
          {
            name: 'SuccessfulTestCase',
            classname: 'SuccessfulTestCaseClassName'
          } as TestCase,
        ]
      } as TestSuite,
      {
        name: 'TestSuiteWithoutFailures',
        classname: 'TestSuiteWithoutFailuresClassName',
        tests: 1,
        failures: 0,
        testcase: [
          {
            name: 'AnotherSuccessfulTestCase',
            classname: 'AnotherSuccessfulTestCaseClassName'
          } as TestCase,
        ]
      },
      {
        name: 'TestSuiteWithErrors',
        classname: 'TestSuiteWithErrorsClassName',
        tests: 1,
        errors: 1,
        testcase: [
          {
            name: 'ErrorsTestCase',
            classname: 'ErrorsTestCaseClassName',
            error: [{message: 'Internal error'}]
          } as TestCase,
        ]
      }
    ]);
    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => true);
    report.hasErrors = jest.fn(() => false);
    report.hasSkipped = jest.fn(() => false);

    report.counter.tests = 4;
    report.counter.succesfull = 2;
    report.counter.failures = 1;
    report.counter.errors = 1;
    report.counter.get = jest.fn(() => 4);

    //when
    const result = toMarkdown(report, createTestFilter('failures'));

    //then
    expect(result).toContain('Results (4 tests)');

    expect(result).toContain('TestSuiteWithFailures');
    expect(result).toContain('FailedTestCase');
    expect(result).toContain('ErrorsTestCase');
    expect(result).toContain('Internal error');
    expect(result).not.toContain('SuccessfulTestCase');
    expect(result).not.toContain('TestSuiteWithoutFailures');
    expect(result).not.toContain('AnotherSuccessfulTestCase');
  });

  test('should show message if all tests are filtered out', () => {
    //given
    report.getTestSuites = jest.fn(() => [
      {
        name: 'TestSuiteWithoutFailures',
        classname: 'TestSuiteWithoutFailuresClassName',
        tests: 1,
        failures: 0,
        testcase: [
          {
            name: 'SuccessfulTestCase',
            classname: 'SuccessfulTestCaseClassName'
          } as TestCase,
        ]
      }
    ]);
    report.hasTests = jest.fn(() => true);
    report.hasFailures = jest.fn(() => false);
    report.hasErrors = jest.fn(() => false);
    report.hasSkipped = jest.fn(() => false);

    report.counter.tests = 1;
    report.counter.succesfull = 1;
    report.counter.failures = 0;
    report.counter.errors = 0;
    report.counter.get = jest.fn(() => 1);

    //when
    const result = toMarkdown(report, createTestFilter('failures'));

    //then
    expect(result).toContain('Results (1 test)');
    expect(result).toContain('**All** tests were successful');
    expect(result).not.toContain('SuccessfulTestCase');
    expect(result).not.toContain('TestSuiteWithoutFailures');
  });
});

function trimmed(input: string): string {
  return input
      .replace(/^([ \t\r])*/gm, '')
      .replace(/^\n*/, '')
      .replace(/\n$/, '');
}
