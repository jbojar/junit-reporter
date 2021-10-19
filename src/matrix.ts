import * as github from '@actions/github';
import * as core from '@actions/core';

function getMatrix(): Record<string, string> {
  try {
    return JSON.parse(core.getInput('matrix', { required: false }));
  } catch (e) {
    return {};
  }
}

function getContext(): string {
  const job = github.context.job || '';
  const matrix = getMatrix();
  const os = matrix ? matrix['os'] || matrix['operating-system'] || '' : '';

  const parts = [];
  if (os != '') {
    parts.push(os);
  }
  if (matrix) {
    for (const k in matrix) {
      if (k != 'os' && k != 'operating-system') {
        parts.push(`${k}: ${matrix[k]}`);
      }
    }
  }
  const context = parts.join(', ');

  if (job && context != '') return `${job} (${context})`;
  else return job;
}

export function getName(prefix?: string): string {
  const context = getContext();

  if (context && context.length > 0) {
    if (prefix && prefix.length > 0) {
      return `${prefix}: ${context}`;
    } else {
      return context;
    }
  } else if (prefix && prefix.length > 0) {
    return prefix;
  } else {
    return '';
  }
}
