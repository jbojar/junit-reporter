# JUnit Reporter

Report JUnit test results as annotations on Github Pull Request and collect them on remote server.

# Usage

<!-- start usage -->
```yaml
- uses: allegro-actions/junit-reporter@v1
  # Execute action if previous job fails or succeeds, otherwise it won't report failurs
  # Default for workflows is success()
  if: ${{ success() || failure() }}
  with:
    # JUnit XML report path in glob format
    # Default: '**/TEST-*.xml'
    path: '**/test-results/*/*.xml'
```
