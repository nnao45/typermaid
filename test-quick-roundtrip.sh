#!/bin/bash
# Quick roundtrip test with limited files

# Create temporary test files
mkdir -p /tmp/test-e2e/{flowchart,sequence,class,er,state,gantt}
cp e2e/flowchart/001_quality.mmd /tmp/test-e2e/flowchart/
cp e2e/sequence/001_basic_actors.mmd /tmp/test-e2e/sequence/
cp e2e/class/001_basic.mmd /tmp/test-e2e/class/
cp e2e/er/001_basic.mmd /tmp/test-e2e/er/
cp e2e/state/001_basic.mmd /tmp/test-e2e/state/
cp e2e/gantt/001_basic.mmd /tmp/test-e2e/gantt/

# Run test with limited files
E2E_DIR=/tmp/test-e2e npx vitest run e2e/roundtrip.test.ts --reporter=verbose

# Cleanup
rm -rf /tmp/test-e2e
