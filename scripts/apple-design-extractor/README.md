# Apple reference import helpers
These manually invoked tools stage Apple Human Interface Guidelines references for review. They are not connected to CI, installation, or marketplace generation. The current plugin owns `plugins/apple/skills/platforms/references/<platform>/`; this pipeline preserves that layout and leaves the curated `platforms/SKILL.md` and plugin metadata alone.

Use a scratch directory for every output. Run a step only when its external access is intended. Extraction contacts Apple; paraphrasing contacts the explicitly selected model endpoint and is optional. Paraphrasing does not establish copyright or licensing permission. Preserve source attribution and review imported text before publication.

```sh
python3 scripts/apple-design-extractor/extract.py --output-root /tmp/apple-import/raw --cache-root /tmp/apple-import/cache
python3 scripts/apple-design-extractor/optimize.py --input-root /tmp/apple-import/raw --output-root /tmp/apple-import/optimized
python3 scripts/apple-design-extractor/paraphrase.py --input-root /tmp/apple-import/optimized --output-root /tmp/apple-import/paraphrased --cache-root /tmp/apple-import/model-cache --model MODEL_ID
python3 scripts/apple-design-extractor/slice.py --input-root /tmp/apple-import/paraphrased --output-root /tmp/apple-import/slices
python3 scripts/apple-design-extractor/scaffold.py --input-root /tmp/apple-import/slices --output-root /tmp/apple-import/staged
```

`slice.py` also accepts `--model MODEL_ID --workspace-root DIR`, resolving `DIR/apple-design-md-paraphrased-MODEL_ID` with `/` replaced by `_`. This removes dependence on one historical model name. Explicit `--input-root` takes precedence.

Inspect staged references and links, retain existing unrelated references, then deliberately copy selected files into the repository. Scaffold refuses existing output files unless `--replace` is supplied. It never deletes a plugin or emits the retired per-platform plugin directories. Run the repository's usual validation after any selected import.

Run the offline fixtures with `python3 -m unittest discover -s scripts/apple-design-extractor -p 'test_*.py'`. These fixtures make no network or model requests.
