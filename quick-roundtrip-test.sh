#!/bin/bash
SKIP_FILES=("e2e/flowchart/100_complete.mmd")

total=0
passed=0
failed=0

for file in e2e/**/*.mmd; do
  # Skip specific files
  skip=false
  for skip_file in "${SKIP_FILES[@]}"; do
    if [ "$file" = "$skip_file" ]; then
      skip=true
      break
    fi
  done
  
  if $skip; then
    echo "SKIP: $file"
    continue
  fi
  
  total=$((total + 1))
  
  if timeout 2 node -e "
    const {parse} = require('./packages/parser/dist/index.js');
    const {generateCode} = require('./packages/codegen/dist/index.js');
    const fs = require('fs');
    try {
      const content = fs.readFileSync('$file', 'utf-8');
      const ast1 = parse(content);
      const gen = generateCode(ast1);
      const ast2 = parse(gen);
      if (ast1.body.length === ast2.body.length && ast1.body[0]?.type === ast2.body[0]?.type) {
        process.exit(0);
      } else {
        console.error('AST mismatch');
        process.exit(1);
      }
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  " >/dev/null 2>&1; then
    passed=$((passed + 1))
  else
    failed=$((failed + 1))
    echo "FAIL: $file"
  fi
done

percent=$(awk "BEGIN {printf \"%.1f\", ($passed/$total)*100}")
echo ""
echo "=== Round-trip Test Results ==="
echo "Total: $total"
echo "Passed: $passed"
echo "Failed: $failed"
echo "Success Rate: $percent%"
