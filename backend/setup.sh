#!/bin/bash

# Install dependencies
npm install helmet cookie-signature cookie-parser

# Verify installation
echo "Verifying installations..."
npm list helmet cookie-signature cookie-parser

echo "Setup complete. You can now run 'npm run dev'"
