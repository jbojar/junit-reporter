import {createTestFilter} from '../src/TestFilter';
import {TestCase, TestSuite} from 'junit2json';

const successfulTestCase = {
    name: 'SuccessTest',
    classname: 'SuccessTestClass'
} as TestCase;

const skippedTestCase =  {
    name: 'SkippedTest',
    classname: 'SkippedTestClass',
    skipped: [{ message: 'to be implemented' }]
} as TestCase;

const errorTestCase =  {
    name: 'ErrorTest',
    classname: 'ErrorTestCkass',
    error: [{ message: 'Internal error' }]
} as TestCase;

const failedTestCase = {
    name: 'FailedTest',
    classname: 'FailedTestClass',
    failure: [{message: 'expected true to be false'}]
} as TestCase;

const successfulTestSuite = {
    testcase: [successfulTestCase],
    name: 'Success test suite',
    tests: 1
} as TestSuite;

const failedTestSuite = {
    testcase: [successfulTestCase, failedTestCase],
    name: 'Failed test suite',
    tests: 2,
    failures: 1
} as TestSuite;

const errorTestSuite = {
    testcase: [errorTestCase],
    name: 'Test suite with error',
    tests: 1,
    errors: 1
} as TestSuite;

const skippedTestSuite = {
    testcase: [skippedTestCase],
    name: 'Skipped test suite',
    tests: 1,
    skipped: 1
} as TestSuite;

describe('TestFilter of type ', () => {
    describe('all', () => {
        const allowAllFilter = createTestFilter('all');

        test('should show successful tests cases', () => {
            expect(allowAllFilter.shouldReportTestCase(successfulTestCase)).toBeTruthy();
        });

        test('should show skipped test cases', () => {
            expect(allowAllFilter.shouldReportTestCase(skippedTestCase)).toBeTruthy();
        });

        test('should show test cases with errors', () => {
            expect(allowAllFilter.shouldReportTestCase(errorTestCase)).toBeTruthy();
        });

        test('should show failed test case', () => {
            expect(allowAllFilter.shouldReportTestCase(failedTestCase)).toBeTruthy();
        });

        test('should show successful tests suites', () => {
            expect(allowAllFilter.shouldReportTestSuite(successfulTestSuite)).toBeTruthy();
        });

        test('should show skipped test suites', () => {
            expect(allowAllFilter.shouldReportTestSuite(skippedTestSuite)).toBeTruthy();
        });

        test('should show test suites with errors', () => {
            expect(allowAllFilter.shouldReportTestSuite(errorTestSuite)).toBeTruthy();
        });

        test('should show failed test suites', () => {
            expect(allowAllFilter.shouldReportTestSuite(failedTestSuite)).toBeTruthy();
        });
    });

    describe('failures', () => {
        const failuresOnlyFilter = createTestFilter('failures');

        test('should not show successful tests cases', () => {
            expect(failuresOnlyFilter.shouldReportTestCase(successfulTestCase)).toBeFalsy();
        });

        test('should not show skipped test cases', () => {
            expect(failuresOnlyFilter.shouldReportTestCase(skippedTestCase)).toBeFalsy();
        });

        test('should show test cases with errors', () => {
            expect(failuresOnlyFilter.shouldReportTestCase(errorTestCase)).toBeTruthy();
        });

        test('should show failed test case', () => {
            expect(failuresOnlyFilter.shouldReportTestCase(failedTestCase)).toBeTruthy();
        });

        test('should not show successful tests suites', () => {
            expect(failuresOnlyFilter.shouldReportTestSuite(successfulTestSuite)).toBeFalsy();
        });

        test('should not show skipped test suites', () => {
            expect(failuresOnlyFilter.shouldReportTestSuite(skippedTestSuite)).toBeFalsy();
        });

        test('should show test suites with errors', () => {
            expect(failuresOnlyFilter.shouldReportTestSuite(errorTestSuite)).toBeTruthy();
        });

        test('should show failed test suites', () => {
            expect(failuresOnlyFilter.shouldReportTestSuite(failedTestSuite)).toBeTruthy();
        });
    });

    describe('failures-and-skipped', () => {

        const failuresAndSkippedFilter = createTestFilter('failures-and-skipped');

        test('should not show successful tests cases', () => {
            expect(failuresAndSkippedFilter.shouldReportTestCase(successfulTestCase)).toBeFalsy();
        });

        test('should show skipped test cases', () => {
            expect(failuresAndSkippedFilter.shouldReportTestCase(skippedTestCase)).toBeTruthy();
        });

        test('should show test cases with errors', () => {
            expect(failuresAndSkippedFilter.shouldReportTestCase(errorTestCase)).toBeTruthy();
        });

        test('should show failed test case', () => {
            expect(failuresAndSkippedFilter.shouldReportTestCase(failedTestCase)).toBeTruthy();
        });

        test('should not show successful tests suites', () => {
            expect(failuresAndSkippedFilter.shouldReportTestSuite(successfulTestSuite)).toBeFalsy();
        });

        test('should show skipped test suites', () => {
            expect(failuresAndSkippedFilter.shouldReportTestSuite(skippedTestSuite)).toBeTruthy();
        });

        test('should show test suites with errors', () => {
            expect(failuresAndSkippedFilter.shouldReportTestSuite(errorTestSuite)).toBeTruthy();
        });

        test('should show failed test suites', () => {
            expect(failuresAndSkippedFilter.shouldReportTestSuite(failedTestSuite)).toBeTruthy();
        });
    });
});
