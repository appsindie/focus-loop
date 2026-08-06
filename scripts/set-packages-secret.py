"""Create the APPSINDIE_PACKAGES_TOKEN Actions secret in each migrated repo.

Org-level secrets require a paid plan, so the same value is set per repository.
"""
import base64
import json
import os
import urllib.request

from nacl import encoding, public

TOKEN = os.environ["GITHUB_PACKAGES_PAT"]
REPOS = [
    "appsindie-react-native-cores",
    "appsindie-react-native-auth",
    "appsindie-react-native-notification",
    "appsindie-react-native-ads",
    "appsindie-react-native-document",
    "appsindie-user-manager-functions",
    "appsindie-document-functions",
    "appsindie-notification-functions",
    "common",
    "react-native-user-client",
    "appsindie-node-core",
    "appsindie-react-native-cores-extensions",
]


def api(path, method="GET", body=None):
    req = urllib.request.Request(
        f"https://api.github.com{path}",
        method=method,
        data=json.dumps(body).encode() if body else None,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Accept": "application/vnd.github+json",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return resp.status, (json.loads(resp.read() or b"null"))


for repo in REPOS:
    _, key = api(f"/repos/appsindie/{repo}/actions/secrets/public-key")
    sealed = public.SealedBox(
        public.PublicKey(key["key"].encode(), encoding.Base64Encoder())
    ).encrypt(TOKEN.encode())
    status, _ = api(
        f"/repos/appsindie/{repo}/actions/secrets/APPSINDIE_PACKAGES_TOKEN",
        method="PUT",
        body={
            "encrypted_value": base64.b64encode(sealed).decode(),
            "key_id": key["key_id"],
        },
    )
    print(repo, status)
