#!/bin/bash
MAX_RETRIES=5
RETRY_DELAY=5

# Add changes
git add .

# Commit changes if any
git diff-index --quiet HEAD || git commit -m "$1"

# Retry loop for push
for i in $(seq 1 $MAX_RETRIES); do
  echo "Attempt $i to push changes..."
  git push
  if [ $? -eq 0 ]; then
    echo "Push successful."
    exit 0
  fi
  echo "Push failed. Retrying in $RETRY_DELAY seconds..."
  sleep $RETRY_DELAY
done

echo "Failed to push after $MAX_RETRIES attempts."
exit 1
