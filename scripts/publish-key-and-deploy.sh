#!/bin/bash
set -euo pipefail

if [ ! -f deploy/REQUEST ]; then
  echo "No deploy request."
  exit 0
fi

if [ -f deploy/payload.b64 ]; then
  echo "Payload is already in this checkout. The waiting job will deploy it."
  exit 0
fi

umask 077
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out deploy/private.pem
openssl rsa -pubout -in deploy/private.pem -out deploy/public.pem
PUB_B64="$(base64 -w0 deploy/public.pem)"

if ! jq -n --arg sha "$GITHUB_SHA" --arg summary "$PUB_B64" '{
  name: "bims-deploy-key",
  head_sha: $sha,
  status: "in_progress",
  output: { title: "ephemeral public key", summary: $summary }
}' | gh api "repos/${GITHUB_REPOSITORY}/check-runs" --input - >/dev/null; then
  gh api "repos/${GITHUB_REPOSITORY}/issues" \
    -f title="bims-deploy-key ${GITHUB_RUN_ID}" \
    -f body="$PUB_B64" >/dev/null
fi

echo "Public key published for ${GITHUB_SHA}."
REF_ENC="$(python3 -c 'import os,urllib.parse; print(urllib.parse.quote(os.environ["GITHUB_REF_NAME"], safe=""))')"

for i in $(seq 1 48); do
  if gh api "repos/${GITHUB_REPOSITORY}/contents/deploy/payload.b64?ref=${REF_ENC}" --jq .content > /tmp/payload.api.b64; then
    tr -d '\n\r ' < /tmp/payload.api.b64 | base64 -d > /tmp/payload.inner.b64
    base64 -d /tmp/payload.inner.b64 > /tmp/payload.enc
    openssl pkeyutl -decrypt \
      -inkey deploy/private.pem \
      -pkeyopt rsa_padding_mode:oaep \
      -pkeyopt rsa_oaep_md:sha256 \
      -in /tmp/payload.enc \
      -out /tmp/bims-tokens.txt
    set -a
    # shellcheck disable=SC1091
    . /tmp/bims-tokens.txt
    set +a
    rm -f /tmp/bims-tokens.txt /tmp/payload.enc /tmp/payload.inner.b64 /tmp/payload.api.b64 deploy/private.pem
    if grep -q preview deploy/REQUEST; then
      export BIMS_PREVIEW=1
    fi
    node scripts/remote-deploy.js
    exit 0
  fi
  echo "Waiting for encrypted payload ($i)"
  sleep 10
done

echo "Timed out waiting for the encrypted payload."
exit 1
