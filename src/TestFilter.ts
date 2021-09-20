import {TestCase, TestSuite} from 'junit2json';

export interface TestFilter {
    shouldReportTestCase(testCase: TestCase): boolean
    shouldReportTestSuite(testSuite: TestSuite): boolean
}

class AllFilter implements TestFilter {
    shouldReportTestCase(): boolean {
        return true;
    }

    shouldReportTestSuite(): boolean {
        return true;
    }
}

const definedAndNotEqualToZero = (input: number | null | undefined): boolean => {
    return input !== undefined && input !== null && input !== 0;
};

class FailuresOnlyFilter implements TestFilter {
    shouldReportTestCase(testCase: TestCase): boolean {
        return definedAndNotEqualToZero(testCase.failure?.length)
            || definedAndNotEqualToZero(testCase.error?.length);
    }

    shouldReportTestSuite(testSuite: TestSuite): boolean {
        return definedAndNotEqualToZero(testSuite.failures)
            || definedAndNotEqualToZero(testSuite.errors);
    }
}

class FailuresAndSkippedFilter implements TestFilter {
    readonly failuresFilter = new FailuresOnlyFilter();

    shouldReportTestCase(testCase: TestCase): boolean {
        return this.failuresFilter.shouldReportTestCase(testCase)
            || definedAndNotEqualToZero(testCase.skipped?.length);
    }

    shouldReportTestSuite(testSuite: TestSuite): boolean {
        return this.failuresFilter.shouldReportTestSuite(testSuite)
            || definedAndNotEqualToZero(testSuite.skipped);
    }
}

export function createTestFilter(type: string | null): TestFilter {
    switch (type) {
        case 'failures':
            return new FailuresOnlyFilter();
        case 'failures-and-skipped':
            return new FailuresAndSkippedFilter();
        case 'all':
        default:
            return new AllFilter();
    }
}
