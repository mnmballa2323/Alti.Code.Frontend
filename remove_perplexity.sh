#!/bin/bash
set -e

cd submodules/pentagi

# Delete perplexity tool file
rm -f backend/pkg/tools/perplexity.go

# Remove from config.go
sed -i '' -e '/Perplexity search engine/d' -e '/PerplexityAPIKey/d' -e '/PerplexityModel/d' -e '/PerplexityContextSize/d' backend/pkg/config/config.go

# Remove from args.go
sed -i '' '/PerplexityToolName/d' backend/cmd/ftester/worker/args.go

# Remove from executor.go
sed -i '' '/tools.PerplexityToolName/d' backend/cmd/ftester/worker/executor.go
sed -i '' '/tools.NewPerplexityTool/d' backend/cmd/ftester/worker/executor.go
sed -i '' '/te.cfg.PerplexityAPIKey/d' backend/cmd/ftester/worker/executor.go
sed -i '' '/te.cfg.PerplexityModel/d' backend/cmd/ftester/worker/executor.go
sed -i '' '/te.cfg.PerplexityContextSize/d' backend/cmd/ftester/worker/executor.go
# also remove dangling commas or extra lines around executor.go if needed, but they are gone. Let's fix executor if it leaves a dangling case.

# Remove from registry.go
sed -i '' '/PerplexityToolName/d' backend/pkg/tools/registry.go
sed -i '' '/search in the perplexity search engine/Id' backend/pkg/tools/registry.go

# Remove from tools.go
sed -i '' '/perplexity := &perplexity/,/handlers\[PerplexityToolName\] = perplexity.Handle/d' backend/pkg/tools/tools.go
sed -i '' '/perplexity := &perplexity/,/ce.handlers\[PerplexityToolName\] = perplexity.Handle/d' backend/pkg/tools/tools.go

# Remove from controller.go
sed -i '' '/PerplexityAPIKey/d' backend/cmd/installer/wizard/controller/controller.go
sed -i '' '/PerplexityModel/d' backend/cmd/installer/wizard/controller/controller.go
sed -i '' '/PerplexityContextSize/d' backend/cmd/installer/wizard/controller/controller.go
sed -i '' '/PERPLEXITY_API_KEY/d' backend/cmd/installer/wizard/controller/controller.go
sed -i '' '/PERPLEXITY_MODEL/d' backend/cmd/installer/wizard/controller/controller.go
sed -i '' '/PERPLEXITY_CONTEXT_SIZE/d' backend/cmd/installer/wizard/controller/controller.go
sed -i '' '/perplexity/Id' backend/cmd/installer/wizard/controller/controller.go

# Remove from models/search_engines_form.go
sed -i '' '/Perplexity/Id' backend/cmd/installer/wizard/models/search_engines_form.go
sed -i '' '/PERPLEXITY/Id' backend/cmd/installer/wizard/models/search_engines_form.go

# Remove from mocks/tools.go
sed -i '' '/PerplexityToolName/,/https:\/\/example.com\/perplexity/d' backend/cmd/ftester/mocks/tools.go

# Remove from .env.example
sed -i '' '/Perplexity search engine API/d' .env.example
sed -i '' '/PERPLEXITY_API_KEY/d' .env.example
sed -i '' '/PERPLEXITY_MODEL/d' .env.example
sed -i '' '/PERPLEXITY_CONTEXT_SIZE/d' .env.example

# Remove from docker-compose.yml
sed -i '' '/PERPLEXITY/d' docker-compose.yml

# Remove from README.md and EULA.md
sed -i '' 's/Perplexity, //g' EULA.md
sed -i '' 's/, Perplexity//g' EULA.md
sed -i '' 's/\/Perplexity//g' README.md
sed -i '' 's/Perplexity, //g' README.md
sed -i '' 's/\[Perplexity\](https:\/\/www.perplexity.ai), //g' README.md
sed -i '' '/PERPLEXITY_/d' README.md
sed -i '' '/perplexity/Id' README.md

