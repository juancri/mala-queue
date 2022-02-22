
all:
	rm -rf out
	mkdir -p out
	npx uglify-js src/load.js -o out/load.min.js
	npx uglify-js src/run.js -o out/run.min.js

publish:
	aws s3 cp \
	  --acl public-read \
	  --region us-east-1 \
	  --metadata-directive REPLACE \
	  --expires 2001-01-01T00:00:00Z \
	  --cache-control no-cache \
	  out/run.min.js \
	  s3://juancri-web/malaqueue/run.min.js
